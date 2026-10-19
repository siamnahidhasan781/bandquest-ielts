/**
 * BandQuest IELTS — Database seed
 * Run: npm run db:seed
 * Populates courses, the 10 grammar foundation episodes, questions,
 * achievements, system config and a sample mock test.
 */
import { randomUUID, createHash } from "node:crypto";
import { getDb, migrate } from "./index";
import { EPISODES_1_5 } from "../curriculum/episodes-1-5";
import { EPISODES_6_10 } from "../curriculum/episodes-6-10";
import { SKILL_LESSONS } from "../curriculum/skills";
import type { CurriculumEpisode } from "../curriculum/episodes-1-5";

function fingerprint(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

const COURSES = [
  { id: "course-grammar-foundations", title: "Grammar Foundations", title_bn: "ব্যাকরণের ভিত্তি", description: "10 episodes building core English grammar from zero to IELTS-ready.", level: 1, kind: "journey", sort_order: 1 },
  { id: "course-listening", title: "Listening Academy", title_bn: "লিসেনিং একাডেমি", description: "IELTS Listening: accents, keywords, question types and strategies.", level: 1, kind: "listening", sort_order: 2 },
  { id: "course-reading", title: "Reading Academy", title_bn: "রিডিং একাডেমি", description: "IELTS Reading: skimming, scanning, Academic & General Training.", level: 1, kind: "reading", sort_order: 3 },
  { id: "course-writing", title: "Writing Academy", title_bn: "রাইটিং একাডেমি", description: "IELTS Writing Task 1 & 2 with AI feedback and rubrics.", level: 1, kind: "writing", sort_order: 4 },
  { id: "course-speaking", title: "Speaking Academy", title_bn: "স্পিকিং একাডেমি", description: "IELTS Speaking Parts 1–3 with AI examiner practice.", level: 1, kind: "speaking", sort_order: 5 },
  { id: "course-grammar-academy", title: "Grammar Academy", title_bn: "ব্যাকরণ একাডেমি", description: "Standalone grammar training with mastery tracking.", level: 1, kind: "grammar", sort_order: 6 },
  { id: "course-vocabulary", title: "Vocabulary Academy", title_bn: "শব্দভাণ্ডার একাডেমি", description: "Topic-based vocabulary with spaced repetition.", level: 1, kind: "vocabulary", sort_order: 7 },
];

const ACHIEVEMENTS = [
  { code: "first-steps", title: "First Steps", description: "Complete your first lesson.", xp: 50 },
  { code: "grammar-starter", title: "Grammar Starter", description: "Pass Episode 1 checkpoint.", xp: 100 },
  { code: "grammar-half", title: "Halfway There", description: "Pass 5 grammar episodes.", xp: 250 },
  { code: "grammar-master", title: "Grammar Master", description: "Pass all 10 foundation episodes.", xp: 500 },
  { code: "perfect-score", title: "Perfect Score", description: "Score 100% on any checkpoint.", xp: 150 },
  { code: "streak-7", title: "Week Warrior", description: "Study 7 days in a row.", xp: 200 },
  { code: "streak-30", title: "Month Master", description: "Study 30 days in a row.", xp: 500 },
  { code: "vocab-100", title: "Word Collector", description: "Learn 100 vocabulary items.", xp: 200 },
  { code: "mock-finisher", title: "Mock Finisher", description: "Complete a full mock test.", xp: 300 },
  { code: "writer", title: "Essay Writer", description: "Submit your first writing task.", xp: 100 },
  { code: "speaker", title: "Confident Speaker", description: "Complete your first AI speaking session.", xp: 100 },
];

const VOCAB_SEED: Array<{ word: string; pos: string; definition_en: string; definition_bn: string; ipa?: string; example_en: string; topic: string; level: number }> = [
  // Education
  { word: "curriculum", pos: "noun", definition_en: "The subjects in a course of study", definition_bn: "পাঠ্যক্রম", ipa: "/kəˈrɪkjələm/", example_en: "The new curriculum includes coding.", topic: "education", level: 2 },
  { word: "literacy", pos: "noun", definition_en: "Ability to read and write", definition_bn: "সাক্ষরতা", ipa: "/ˈlɪtərəsi/", example_en: "Literacy rates have improved.", topic: "education", level: 2 },
  { word: "compulsory", pos: "adjective", definition_en: "Required by law or rule", definition_bn: "বাধ্যতামূলক", ipa: "/kəmˈpʌlsəri/", example_en: "Education is compulsory until 16.", topic: "education", level: 2 },
  { word: "plagiarism", pos: "noun", definition_en: "Copying work without credit", definition_bn: "চৌর্যবৃত্তি", ipa: "/ˈpleɪdʒərɪzəm/", example_en: "Plagiarism leads to disqualification.", topic: "education", level: 3 },
  // Technology
  { word: "innovation", pos: "noun", definition_en: "A new idea or method", definition_bn: "উদ্ভাবন", ipa: "/ˌɪnəˈveɪʃn/", example_en: "Innovation drives economic growth.", topic: "technology", level: 2 },
  { word: "artificial intelligence", pos: "noun", definition_en: "Machines performing intelligent tasks", definition_bn: "কৃত্রিম বুদ্ধিমত্তা", example_en: "Artificial intelligence is transforming jobs.", topic: "technology", level: 2 },
  { word: "cybersecurity", pos: "noun", definition_en: "Protection of digital systems", definition_bn: "সাইবার নিরাপত্তা", ipa: "/ˌsaɪbəsɪˈkjʊərəti/", example_en: "Cybersecurity is a growing field.", topic: "technology", level: 3 },
  { word: "algorithm", pos: "noun", definition_en: "A set of computational rules", definition_bn: "অ্যালগরিদম", ipa: "/ˈælɡərɪðəm/", example_en: "Search algorithms rank results.", topic: "technology", level: 3 },
  // Environment
  { word: "sustainable", pos: "adjective", definition_en: "Able to continue without harm", definition_bn: "টেকসই", ipa: "/səˈsteɪnəbl/", example_en: "We need sustainable energy.", topic: "environment", level: 2 },
  { word: "biodiversity", pos: "noun", definition_en: "Variety of living species", definition_bn: "জৈববৈচিত্র্য", ipa: "/ˌbaɪəʊdaɪˈvɜːsəti/", example_en: "Biodiversity protects ecosystems.", topic: "environment", level: 3 },
  { word: "emissions", pos: "noun", definition_en: "Gases released into air", definition_bn: "নির্গমন", ipa: "/iˈmɪʃnz/", example_en: "Carbon emissions must fall.", topic: "environment", level: 2 },
  { word: "deforestation", pos: "noun", definition_en: "Clearing of forests", definition_bn: "বন উজাড়", ipa: "/diːˌfɒrɪˈsteɪʃn/", example_en: "Deforestation threatens wildlife.", topic: "environment", level: 2 },
  // Health
  { word: "obesity", pos: "noun", definition_en: "Excessive body weight condition", definition_bn: "স্থূলতা", ipa: "/əʊˈbiːsəti/", example_en: "Obesity is a public health crisis.", topic: "health", level: 2 },
  { word: "vaccination", pos: "noun", definition_en: "Immunisation against disease", definition_bn: "টিকাদান", ipa: "/ˌvæksɪˈneɪʃn/", example_en: "Vaccination saves millions.", topic: "health", level: 2 },
  { word: "sedentary", pos: "adjective", definition_en: "Involving little movement", definition_bn: "অলস/বসে থাকা", ipa: "/ˈsedntri/", example_en: "A sedentary lifestyle harms health.", topic: "health", level: 3 },
  // Work
  { word: "unemployment", pos: "noun", definition_en: "State of being jobless", definition_bn: "বেকারত্ব", ipa: "/ˌʌnɪmˈplɔɪmənt/", example_en: "Unemployment rose last year.", topic: "work", level: 2 },
  { word: "entrepreneur", pos: "noun", definition_en: "One who starts businesses", definition_bn: "উদ্যোক্তা", ipa: "/ˌɒntrəprəˈnɜː/", example_en: "She is a successful entrepreneur.", topic: "work", level: 3 },
  { word: "redundant", pos: "adjective", definition_en: "No longer needed (job)", definition_bn: "অপ্রয়োজনীয়", ipa: "/rɪˈdʌndənt/", example_en: "Many workers were made redundant.", topic: "work", level: 3 },
];

export async function seed(): Promise<void> {
  await migrate();
  const db = getDb();

  // Courses
  for (const c of COURSES) {
    await db.prepare(
      `INSERT OR REPLACE INTO courses (id, title, title_bn, description, level, kind, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
    ).run(c.id, c.title, c.title_bn, c.description, c.level, c.kind, c.sort_order);
  }

  // Episodes + questions
  const all: CurriculumEpisode[] = [...EPISODES_1_5, ...EPISODES_6_10];
  for (const ep of all) {
    await db.prepare(
      `INSERT OR REPLACE INTO episodes
       (id, course_id, title, title_bn, sort_order, objectives_json, content_md, content_md_bn, vocab_json, is_checkpoint_required, pass_threshold, version, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 70, 1, 'published')`
    ).run(
      ep.id, ep.course_id, ep.title, ep.title_bn, ep.sort_order,
      JSON.stringify(ep.objectives), ep.content_md, ep.content_md_bn,
      JSON.stringify(ep.vocab)
    );
    for (const q of ep.questions) {
      await db.prepare(
        `INSERT OR REPLACE INTO questions
         (id, episode_id, module, qtype, difficulty, prompt_md, options_json, answer_json, explanation_md, explanation_md_bn, skill_tags_json, fingerprint, version, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'published')`
      ).run(
        q.id, ep.id, q.module, q.qtype, q.difficulty, q.prompt_md,
        q.options_json ? JSON.stringify(q.options_json) : null,
        JSON.stringify(q.answer_json), q.explanation_md, q.explanation_md_bn || null,
        JSON.stringify(q.skill_tags), fingerprint(q.id + q.prompt_md)
      );
    }
  }

  // Skill lessons as episodes in their courses
  const skillCourseMap: Record<string, string> = {
    listening: "course-listening",
    reading: "course-reading",
    writing: "course-writing",
    speaking: "course-speaking",
  };
  for (let idx = 0; idx < SKILL_LESSONS.length; idx++) {
    const sl = SKILL_LESSONS[idx];
    const epId = `ep-${sl.id}`;
    await db.prepare(
      `INSERT OR REPLACE INTO episodes
       (id, course_id, title, title_bn, sort_order, objectives_json, content_md, content_md_bn, vocab_json, is_checkpoint_required, pass_threshold, version, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 70, 1, 'published')`
    ).run(
      epId, skillCourseMap[sl.skill], sl.title, sl.title_bn, idx + 1,
      JSON.stringify([`Master ${sl.title}`]), sl.content_md, sl.content_md_bn,
      JSON.stringify([]),
    );
    // Store passage/audio script in content via a companion row
    if (sl.passage || sl.audio_script) {
      await db.prepare(
        `INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)`
      ).run(
        `skill_extra:${epId}`,
        JSON.stringify({ passage: sl.passage || null, audio_script: sl.audio_script || null })
      );
    }
    for (const q of sl.questions) {
      const qid = q.id;
      await db.prepare(
        `INSERT OR REPLACE INTO questions
         (id, episode_id, module, qtype, difficulty, prompt_md, options_json, answer_json, explanation_md, explanation_md_bn, skill_tags_json, fingerprint, version, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'published')`
      ).run(
        qid, epId, sl.skill, q.qtype, sl.level, q.prompt_md,
        q.options ? JSON.stringify(q.options) : null,
        JSON.stringify(q.qtype === "truefalse" && q.answer === "notgiven" ? "NOT_GIVEN" : q.answer),
        q.explanation, q.explanation_bn || null,
        JSON.stringify([sl.skill]), fingerprint(qid + q.prompt_md)
      );
    }
  }

  // Achievements
  for (const a of ACHIEVEMENTS) {
    await db.prepare(
      `INSERT OR IGNORE INTO achievements (id, code, title, description, xp_reward)
       VALUES (?, ?, ?, ?, ?)`
    ).run(randomUUID(), a.code, a.title, a.description, a.xp);
  }

  // Vocabulary (dedupe by word)
  for (const v of VOCAB_SEED) {
    const exists = await db.prepare("SELECT id FROM vocabulary_items WHERE word = ?").get(v.word);
    if (exists) continue;
    await db.prepare(
      `INSERT INTO vocabulary_items (id, word, pos, definition_en, definition_bn, ipa, example_en, topic, level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(randomUUID(), v.word, v.pos, v.definition_en, v.definition_bn, v.ipa || null, v.example_en, v.topic, v.level);
  }

  // System config defaults
  const defaults: Record<string, string> = {
    "ai.text_model": process.env.GEMINI_TEXT_MODEL || "gemini-3.8-flash",
    "ai.audio_model": process.env.GEMINI_AUDIO_MODEL || "gemini-3.8-flash",
    "ai.daily_limit_per_user": "50",
    "ai.enabled": "1",
    "mock.listening_minutes": "30",
    "mock.reading_minutes": "60",
    "mock.writing_minutes": "60",
    "pass_threshold": "70",
    "app.name": "BandQuest IELTS",
    "app.tagline": "From Zero to IELTS-Ready.",
  };
  for (const [k, v] of Object.entries(defaults)) {
    await db.prepare(
      "INSERT OR IGNORE INTO system_config (key, value) VALUES (?, ?)"
    ).run(k, v);
  }

  // Sample mock test config
  await db.prepare(
    `INSERT OR IGNORE INTO mock_tests (id, title, test_type, config_json, status)
     VALUES (?, ?, ?, ?, 'published')`
  ).run(
    "mock-academic-01",
    "Academic Mock Test 01",
    "academic",
    JSON.stringify({
      listening: { parts: 4, questions: 40, minutes: 30 },
      reading: { sections: 3, questions: 40, minutes: 60 },
      writing: { tasks: 2, minutes: 60, task1_words: 150, task2_words: 250 },
      speaking: { parts: 3, minutes: 14 },
      band_table: "ielts-general-v1",
    })
  );

  // Content sources
  const sources = [
    { title: "IELTS Official — Test Format", url: "https://ielts.org/take-a-test/test-format", category: "official", skill: "all" },
    { title: "British Council — Prepare for IELTS", url: "https://takeielts.britishcouncil.org/prepare", category: "official", skill: "all" },
    { title: "Cambridge English — IELTS Preparation", url: "https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/", category: "official", skill: "all" },
    { title: "IELTS Liz — Lessons & Tips", url: "https://ieltsliz.com/", category: "community", skill: "all" },
  ];
  for (const s of sources) {
    await db.prepare(
      "INSERT OR IGNORE INTO content_sources (id, title, url, category, skill) VALUES (?, ?, ?, ?, ?)"
    ).run(randomUUID(), s.title, s.url, s.category, s.skill);
  }

  const epCount = (await db.prepare("SELECT COUNT(*) as c FROM episodes").get() as { c: number }).c;
  const qCount = (await db.prepare("SELECT COUNT(*) as c FROM questions").get() as { c: number }).c;
  const vCount = (await db.prepare("SELECT COUNT(*) as c FROM vocabulary_items").get() as { c: number }).c;
  console.log(`Seed complete: ${epCount} episodes, ${qCount} questions, ${vCount} vocab items.`);
}

// Allow direct execution
const isMain = process.argv[1]?.endsWith("seed.ts");
if (isMain) {
  seed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
