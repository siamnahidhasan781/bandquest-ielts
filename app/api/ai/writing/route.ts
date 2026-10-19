import { NextRequest } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { json, err, handler, requireRegistered } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";
import {
  aiEnabled, callGemini, parseJsonResponse, checkRateLimit, logUsage,
  aiErrorMessage, AI_DISCLAIMER, RUBRIC_VERSION, textModel,
} from "@/lib/ai/gemini";
import { awardAchievement, updateStreak } from "@/lib/engine";

const schema = z.object({
  prompt: z.string().min(10).max(2000),
  taskType: z.enum(["academic1", "general1", "task2"]),
  text: z.string().min(50).max(10000),
});

interface WritingAiResult {
  band: number;
  criteria: { name: string; band: number; comment: string }[];
  grammar_errors: { original: string; corrected: string; explanation: string }[];
  strengths: string[];
  priorities: string[];
  model_answer_outline: string;
}

/** Deterministic rule-based fallback when Gemini is unavailable. */
function ruleBasedWriting(text: string, taskType: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgLen = sentences.length ? wordCount / sentences.length : 0;
  const complexMarkers = (text.match(/\b(although|however|moreover|furthermore|therefore|consequently|despite|whereas|in contrast)\b/gi) || []).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

  // Heuristic band 4.0–7.0 (clearly labelled as estimate, rule-based)
  let band = 5.0;
  const target = taskType === "task2" ? 250 : 150;
  if (wordCount >= target) band += 0.5;
  if (wordCount >= target * 1.1) band += 0.25;
  if (avgLen >= 12 && avgLen <= 25) band += 0.25;
  if (complexMarkers >= 3) band += 0.5;
  else if (complexMarkers >= 1) band += 0.25;
  if (paragraphs >= 4) band += 0.25;
  if (wordCount < target * 0.6) band -= 1.0;
  band = Math.max(4.0, Math.min(7.0, Math.round(band * 2) / 2));

  const criteria = [
    { name: "Task Achievement / Response", band, comment: wordCount >= target ? "Length requirement met. Check you answered every part of the prompt." : `Below the ${target}-word target — under-length responses are penalised.` },
    { name: "Coherence & Cohesion", band, comment: complexMarkers >= 2 ? "Some linking devices used. Vary them and check paragraph logic." : "Add more linking devices (however, furthermore, therefore) and clear paragraphing." },
    { name: "Lexical Resource", band, comment: "Rule-based check cannot judge vocabulary precisely — ask AI feedback for detail when available." },
    { name: "Grammatical Range & Accuracy", band, comment: avgLen >= 12 ? "Sentence length looks reasonable. Re-read for verb-tense and article errors." : "Sentences look short or fragmented — combine ideas with conjunctions." },
  ];

  const feedback_md = `## Rule-based writing check (AI unavailable)

**Word count:** ${wordCount} (target ${target}+)
**Paragraphs:** ${paragraphs} · **Avg sentence length:** ${avgLen.toFixed(1)} words
**Linking devices found:** ${complexMarkers}

### Priorities
1. ${wordCount < target ? `Reach ${target}+ words — currently ${wordCount}.` : "Keep length above the target."}
2. ${complexMarkers < 3 ? "Use more discourse markers (however, moreover, therefore, in contrast)." : "Good range of linkers — check they are used accurately."}
3. ${paragraphs < 4 ? "Organise into 4+ clear paragraphs." : "Paragraphing looks fine."}
4. Proofread for articles (a/an/the) and subject–verb agreement — the two most common accuracy losses.

*This is a surface-level check. For detailed grammar corrections and a model answer, enable AI feedback.*`;

  return { band, criteria, feedback_md, grammar_errors: [], strengths: [], priorities: [] as string[] };
}

const WRITING_SYSTEM = `You are an IELTS writing examiner using the public IELTS Writing Band Descriptors. Assess the response honestly and educationally. Never inflate scores. Output ONLY valid JSON with this shape:
{
  "band": <number 0-9, halves allowed>,
  "criteria": [{"name": "Task Achievement/Response"|"Coherence and Cohesion"|"Lexical Resource"|"Grammatical Range and Accuracy", "band": <number>, "comment": "<1-2 sentences>"}],
  "grammar_errors": [{"original": "<exact quote>", "corrected": "<fix>", "explanation": "<short>"}],
  "strengths": ["<2-4 items>"],
  "priorities": ["<3-5 concrete improvements>"],
  "model_answer_outline": "<short paragraph outline of a strong answer>"
}`;

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Invalid submission. Write at least 50 words.", 400);

  const { prompt, taskType, text } = parsed.data;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const db = getDb();
  const id = randomUUID();

  let band: number | null = null;
  let criteria: WritingAiResult["criteria"] | null = null;
  let feedback_md = "";
  let ai = false;
  let model: string | null = null;

  const canUseAi = await aiEnabled() && await checkRateLimit(user.id, "writing");

  if (canUseAi) {
    try {
      const res = await callGemini({
        systemPrompt: WRITING_SYSTEM,
        userPrompt: `Task type: ${taskType}\nPrompt: ${prompt}\n\nStudent response (${wordCount} words):\n${text}`,
        jsonMode: true,
        maxTokens: 2500,
      });
      const parsed2 = parseJsonResponse<WritingAiResult>(res.text, ["band", "criteria", "grammar_errors", "strengths", "priorities"]);
      band = Math.max(0, Math.min(9, parsed2.band));
      criteria = parsed2.criteria;
      model = res.model;
      await logUsage(user.id, "writing", res.tokensIn, res.tokensOut);
      ai = true;

      const errList = parsed2.grammar_errors.slice(0, 8).map(
        (e) => `- ❌ "${e.original}" → ✅ "${e.corrected}" — ${e.explanation}`
      ).join("\n");
      feedback_md = `## AI writing feedback

### Strengths
${parsed2.strengths.map((s) => `- ${s}`).join("\n")}

### Grammar corrections
${errList || "No major grammar errors found — well done."}

### Priority improvements
${parsed2.priorities.map((p, i) => `${i + 1}. ${p}`).join("\n")}

### Model answer outline
${parsed2.model_answer_outline}`;
    } catch (e) {
      const code = e instanceof Error ? e.message : "AI_ERROR";
      if (code === "AI_QUOTA") {
        // Save submission, return honest notice with rule-based fallback
        const fb = ruleBasedWriting(text, taskType);
        band = fb.band; criteria = fb.criteria; feedback_md = fb.feedback_md + "\n\n*AI quota exhausted — showing rule-based check.*";
      } else {
        const fb = ruleBasedWriting(text, taskType);
        band = fb.band; criteria = fb.criteria; feedback_md = fb.feedback_md;
      }
    }
  } else {
    const fb = ruleBasedWriting(text, taskType);
    band = fb.band; criteria = fb.criteria; feedback_md = fb.feedback_md;
    if ((await aiEnabled()) && !(await checkRateLimit(user.id, "writing"))) {
      feedback_md += "\n\n*" + aiErrorMessage("AI_RATE_LIMIT") + "*";
    }
  }

  await db.prepare(
    `INSERT INTO writing_submissions
     (id, user_id, prompt, task_type, text, word_count, ai_band, criteria_json, feedback_md, model, rubric_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, user.id, prompt, taskType, text, wordCount, band, criteria ? JSON.stringify(criteria) : null, feedback_md, model, RUBRIC_VERSION);

  await updateStreak(user.id);
  await awardAchievement(user.id, "writer");

  return json({
    id,
    band,
    criteria,
    feedback_md,
    ai,
    disclaimer: AI_DISCLAIMER,
  });
});
