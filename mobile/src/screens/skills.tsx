/** BandQuest IELTS mobile — Skills hub, Writing feedback, Speaking examiner. */
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Markdown from "react-native-markdown-display";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { api } from "../api";
import { useAuth } from "../auth";
import { s, ACCENT, EMERALD, AMBER, RED, NAVY } from "../theme";

export function SkillsScreen({ navigation }: any) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await api.courses();
      setCourses(d.courses);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const goCourse = (kind: string) => {
    const c = courses.find((x: any) => x.kind === kind);
    if (c) navigation.navigate("LearnTab", { screen: "Episodes", params: { courseId: c.id, title: c.title } });
  };

  const cards = [
    { emoji: "🎧", title: "Listening", desc: "Keyword spotting, paraphrase, note-taking", onPress: () => goCourse("listening") },
    { emoji: "📖", title: "Reading", desc: "Skimming, T/F/NG, matching headings", onPress: () => goCourse("reading") },
    { emoji: "✍️", title: "Writing", desc: "AI band feedback on your essays", onPress: () => navigation.navigate("Writing") },
    { emoji: "🎙️", title: "Speaking", desc: "Record answers, get AI examiner feedback", onPress: () => navigation.navigate("Speaking") },
  ];

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>Four Skills</Text>
      <Text style={s.muted}>Train each IELTS module independently.</Text>
      {loading ? <ActivityIndicator color={ACCENT} style={{ marginTop: 20 }} /> : null}
      {cards.map((c) => (
        <TouchableOpacity key={c.title} style={s.card} onPress={c.onPress}>
          <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
          <Text style={[s.h3, { marginTop: 6 }]}>{c.title}</Text>
          <Text style={s.muted}>{c.desc}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------

const PROMPTS = [
  { id: "t2-opinion", task: "task2", label: "Task 2 — Opinion", prompt: "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?" },
  { id: "t2-discussion", task: "task2", label: "Task 2 — Discussion", prompt: "Some people think that the best way to reduce crime is to give longer prison sentences. Others believe there are better alternatives. Discuss both views and give your own opinion." },
  { id: "ac1-chart", task: "academic1", label: "Task 1 Academic — Chart", prompt: "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant." },
  { id: "gt1-letter", task: "general1", label: "Task 1 General — Letter", prompt: "You recently bought a piece of equipment for your kitchen but it did not work. Write a letter to the shop manager describing the problem, explaining what happened when you phoned, and saying what you would like the manager to do." },
];

function SignupNeeded() {
  const { user } = useAuth();
  if (!user?.isGuest) return null;
  return (
    <View style={[s.card, { backgroundColor: "#eff6ff", marginTop: 12 }]}>
      <Text style={s.h3}>🔓 Free account needed</Text>
      <Text style={s.body}>
        AI feedback needs an account — it takes 30 seconds and your guest progress carries over.
      </Text>
    </View>
  );
}

export function WritingScreen() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const prompt = PROMPTS[promptIdx];

  const submit = async () => {
    setError("");
    if (words < 50) {
      setError("Write at least 50 words before submitting.");
      return;
    }
    setLoading(true);
    try {
      const r = await api.aiWriting(prompt.prompt, prompt.task, text);
      setResult(r);
    } catch (e: any) {
      setError(e.code === "signup_required" ? "AI feedback needs a free account." : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>✍️ Writing</Text>
      <SignupNeeded />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
        {PROMPTS.map((p, i) => (
          <TouchableOpacity
            key={p.id}
            style={[s.chip, i === promptIdx && { backgroundColor: ACCENT }, { paddingVertical: 10 }]}
            onPress={() => { setPromptIdx(i); setResult(null); }}
          >
            <Text style={[s.chipText, i === promptIdx && { color: "#fff" }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.body}>{prompt.prompt}</Text>
      </View>
      <TextInput
        style={[s.input, { height: 220, textAlignVertical: "top" }]}
        value={text}
        onChangeText={setText}
        multiline
        placeholder="Write your essay or letter here…"
      />
      <Text style={[s.muted, { marginTop: 6 }]}>{words} words {prompt.task === "task2" ? "(aim 250+)" : "(aim 150+)"}</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TouchableOpacity style={s.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Get AI feedback</Text>}
      </TouchableOpacity>
      {result ? (
        <View style={[s.card, { marginTop: 12 }]}>
          <Text style={{ fontSize: 40, fontWeight: "800", color: NAVY }}>
            {result.band !== null ? result.band.toFixed(1) : "—"}
          </Text>
          <Text style={s.muted}>Estimated practice band · {result.ai ? "AI" : "rule-based"} · educational estimate only</Text>
          {(result.criteria ?? []).map((c: any, i: number) => (
            <View key={i} style={{ marginTop: 8 }}>
              <Text style={s.h3}>{c.name}: {c.band?.toFixed(1)}</Text>
              <Text style={s.body}>{c.comment}</Text>
            </View>
          ))}
          <Markdown>{result.feedback_md ?? ""}</Markdown>
        </View>
      ) : null}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------

const PART1_QS = [
  "Let's talk about your hometown. Where is it?",
  "Do you like reading? Why or why not?",
  "What do you usually do in your free time?",
];
const PART2_CARD = {
  topic: "Describe a skill you would like to learn.",
  bullets: ["What the skill is", "Why you want to learn it", "How you would learn it", "How it would help you"],
};
const PART3_QS = [
  "What skills are most important for young people today?",
  "Should schools teach practical skills? Why?",
];

export function SpeakingScreen() {
  const [part, setPart] = useState<"part1" | "part2" | "part3">("part1");
  const [qIndex, setQIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [secs, setSecs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const timer = React.useRef<any>(null);

  const question =
    part === "part1" ? PART1_QS[qIndex % PART1_QS.length]
    : part === "part3" ? PART3_QS[qIndex % PART3_QS.length]
    : `${PART2_CARD.topic} ${PART2_CARD.bullets.join("; ")}`;

  const startRecording = async () => {
    setError("");
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setError("Microphone permission is needed to record.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setSecs(0);
      timer.current = setInterval(() => setSecs((x) => x + 1), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start recording.");
    }
  };

  const stopAndSend = async () => {
    if (!recording) return;
    if (timer.current) clearInterval(timer.current);
    setLoading(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) throw new Error("No recording captured.");
      const b64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const r = await api.aiSpeaking({
        part,
        question,
        audioBase64: b64.slice(0, 5_000_000),
        mimeType: "audio/m4a",
        durationSecs: secs,
      });
      setResult(r);
    } catch (e: any) {
      setError(e.code === "signup_required" ? "The AI examiner needs a free account." : e.message || "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const textFallback = async () => {
    // Simple prompt-based fallback when mic is unavailable
    setError("Recording unavailable — type your answer in the Writing section for feedback instead.");
  };

  React.useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>🎙️ Speaking</Text>
      <SignupNeeded />
      <View style={[s.row, { marginTop: 12 }]}>
        {(["part1", "part2", "part3"] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[s.chip, part === p && { backgroundColor: ACCENT }, { paddingVertical: 10 }]}
            onPress={() => { setPart(p); setQIndex(0); setResult(null); }}
          >
            <Text style={[s.chipText, part === p && { color: "#fff" }]}>
              {p === "part1" ? "Part 1" : p === "part2" ? "Part 2" : "Part 3"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[s.card, { marginTop: 12 }]}>
        {part === "part2" ? (
          <>
            <Text style={s.h3}>Cue card (1 min prep, speak 1–2 min)</Text>
            <Text style={[s.body, { marginTop: 6 }]}>{PART2_CARD.topic}</Text>
            {PART2_CARD.bullets.map((b) => (
              <Text key={b} style={[s.muted, { marginTop: 2 }]}>• {b}</Text>
            ))}
          </>
        ) : (
          <>
            <Text style={s.muted}>Question {qIndex + 1}</Text>
            <Text style={[s.h3, { marginTop: 4 }]}>{question}</Text>
          </>
        )}
      </View>

      {error ? <Text style={s.error}>{error}</Text> : null}

      {!recording ? (
        <TouchableOpacity style={[s.btn, { backgroundColor: RED }]} onPress={startRecording} disabled={loading}>
          <Text style={s.btnText}>● Start recording</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <Text style={[s.h2, { textAlign: "center", marginTop: 8, color: RED }]}>
            ● {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
          </Text>
          <TouchableOpacity style={s.btn} onPress={stopAndSend} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Stop & get feedback</Text>}
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={s.btnSecondary} onPress={textFallback}>
        <Text style={s.btnSecondaryText}>Microphone not working?</Text>
      </TouchableOpacity>

      {result ? (
        <View style={[s.card, { marginTop: 12 }]}>
          <Text style={{ fontSize: 40, fontWeight: "800", color: NAVY }}>
            {result.band !== null ? result.band.toFixed(1) : "—"}
          </Text>
          <Text style={s.muted}>AI examiner · educational estimate only</Text>
          {(result.criteria ?? []).map((c: any, i: number) => (
            <View key={i} style={{ marginTop: 8 }}>
              <Text style={s.h3}>{c.name}: {c.band?.toFixed(1)}</Text>
              <Text style={s.body}>{c.comment}</Text>
            </View>
          ))}
          <Markdown>{result.feedback_md ?? ""}</Markdown>
          <TouchableOpacity
            style={[s.btnSecondary, { marginTop: 12 }]}
            onPress={() => { setQIndex(qIndex + 1); setResult(null); }}
          >
            <Text style={s.btnSecondaryText}>Next question →</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export { AMBER };
