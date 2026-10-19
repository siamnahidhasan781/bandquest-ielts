/** BandQuest IELTS mobile — Learn: courses → episodes → lesson → checkpoint. */
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Markdown from "react-native-markdown-display";
import { api } from "../api";
import { s, ACCENT, EMERALD, AMBER, NAVY } from "../theme";

const KIND_LABEL: Record<string, string> = {
  journey: "My Learning Journey",
  listening: "Listening Academy",
  reading: "Reading Academy",
  writing: "Writing Academy",
  speaking: "Speaking Academy",
  grammar: "Grammar Academy",
  vocabulary: "Vocabulary Academy",
};

export function CoursesScreen({ navigation }: any) {
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

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>Learn</Text>
      {courses.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={s.card}
          onPress={() => navigation.navigate("Episodes", { courseId: c.id, title: c.title })}
        >
          <Text style={s.h3}>{KIND_LABEL[c.kind] ?? c.title}</Text>
          <Text style={s.muted} numberOfLines={2}>
            {c.description ?? c.title}
          </Text>
          <Text style={[s.muted, { marginTop: 6 }]}>
            {c.passedCount}/{c.totalCount} passed
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export function EpisodesScreen({ navigation, route }: any) {
  const { courseId, title } = route.params;
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await api.courses();
      const c = d.courses.find((x: any) => x.id === courseId);
      setEpisodes(c?.episodes ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [courseId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>{title}</Text>
      {episodes.map((e) => {
        const locked = e.progress.status === "locked";
        return (
          <TouchableOpacity
            key={e.id}
            style={[s.card, locked && { opacity: 0.55 }]}
            onPress={() => navigation.navigate("Lesson", { episodeId: e.id })}
          >
            <Text style={s.h3}>
              {locked ? "🔒 " : ""}{e.title}
            </Text>
            <Text style={s.muted}>
              {e.progress.best_score !== null
                ? `Best ${Math.round(e.progress.best_score)}% · ${"★".repeat(e.progress.best_stars ?? 0)}`
                : locked
                ? "Pass the previous episode to unlock"
                : "Start →"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function LessonScreen({ navigation, route }: any) {
  const { episodeId } = route.params;
  const [ep, setEp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      api
        .episode(episodeId)
        .then((d) => alive && setEp(d.episode))
        .catch(() => {})
        .finally(() => alive && setLoading(false));
      return () => { alive = false; };
    }, [episodeId])
  );

  const start = async () => {
    setError("");
    setStarting(true);
    try {
      const d = await api.startAttempt(episodeId, "checkpoint");
      navigation.navigate("Checkpoint", { attemptId: d.attemptId, questions: d.questions, episodeId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start.");
    } finally {
      setStarting(false);
    }
  };

  if (loading || !ep) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>{ep.title}</Text>
      {ep.title_bn ? <Text style={s.muted}>{ep.title_bn}</Text> : null}
      <View style={[s.card, { marginTop: 12 }]}>
        <Markdown>{ep.content_md ?? ""}</Markdown>
      </View>
      {ep.vocab?.length ? (
        <View style={s.card}>
          <Text style={s.h3}>Key vocabulary</Text>
          {ep.vocab.map((v: any, i: number) => (
            <Text key={i} style={[s.body, { marginTop: 4 }]}>
              • <Text style={{ fontWeight: "700" }}>{v.word}</Text>
              {v.bn ? ` — ${v.bn}` : ""} {v.definition ? `\n  ${v.definition}` : ""}
            </Text>
          ))}
        </View>
      ) : null}
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TouchableOpacity style={s.btn} onPress={start} disabled={starting}>
        {starting ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Start checkpoint ✓</Text>}
      </TouchableOpacity>
      <Text style={[s.muted, { textAlign: "center", marginTop: 8 }]}>
        Pass with {ep.pass_threshold ?? 70}% to unlock the next episode
      </Text>
    </ScrollView>
  );
}

function QuestionInput({ q, value, onChange }: any) {
  if (q.qtype === "mcq" && q.options_json) {
    return (
      <View>
        {q.options_json.map((opt: string, i: number) => (
          <TouchableOpacity
            key={i}
            style={[
              s.card,
              { marginBottom: 8, borderWidth: 2, borderColor: value === i ? ACCENT : "transparent" },
            ]}
            onPress={() => onChange(i)}
          >
            <Text style={s.body}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
  if (q.qtype === "truefalse") {
    return (
      <View style={[s.row, { justifyContent: "space-between" }]}>
        {["true", "false", "notgiven"].map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              s.chip,
              { paddingHorizontal: 18, paddingVertical: 10 },
              value === opt && { backgroundColor: ACCENT },
            ]}
            onPress={() => onChange(opt)}
          >
            <Text style={[s.chipText, value === opt && { color: "#fff" }]}>
              {opt === "notgiven" ? "Not Given" : opt[0].toUpperCase() + opt.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
  // fillblank / default → text input
  return (
    <TextInput
      style={s.input}
      value={String(value ?? "")}
      onChangeText={onChange}
      placeholder="Type your answer"
      autoCapitalize="none"
    />
  );
}

export function CheckpointScreen({ navigation, route }: any) {
  const { attemptId, questions } = route.params;
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const r = await api.submitAttempt(attemptId, responses);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.padded}>
        <Text style={s.h1}>{result.passed ? "🎉 Passed!" : "💪 Keep going"}</Text>
        <View style={[s.card, { alignItems: "center", marginTop: 12 }]}>
          <Text style={{ fontSize: 52, fontWeight: "800", color: result.passed ? EMERALD : AMBER }}>
            {Math.round(result.score)}%
          </Text>
          <Text style={{ fontSize: 28, color: AMBER }}>{"★".repeat(result.stars)}{"☆".repeat(5 - result.stars)}</Text>
          <Text style={s.muted}>+{result.xpAwarded ?? 0} XP</Text>
        </View>
        {result.results.map((r: any, i: number) => {
          const q = questions.find((x: any) => x.id === r.questionId);
          return (
            <View key={i} style={s.card}>
              <Text style={s.body}>
                {r.isCorrect ? "✅" : "❌"} {q?.prompt_md?.slice(0, 80)}
              </Text>
              {r.explanation_md ? <Markdown>{r.explanation_md}</Markdown> : null}
            </View>
          );
        })}
        {result.remediation ? (
          <View style={[s.card, { backgroundColor: "#fffbeb" }]}>
            <Text style={s.h3}>Focus next</Text>
            <Text style={s.body}>{result.remediation.message}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={s.btn} onPress={() => navigation.goBack()}>
          <Text style={s.btnText}>Back to lessons</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>Checkpoint</Text>
      <Text style={s.muted}>{questions.length} questions · answers are scored on the server</Text>
      {questions.map((q: any, i: number) => (
        <View key={q.id} style={[s.card, { marginTop: 12 }]}>
          <Text style={[s.muted, { marginBottom: 6 }]}>Q{i + 1}</Text>
          <Markdown>{q.prompt_md ?? ""}</Markdown>
          <View style={{ marginTop: 8 }}>
            <QuestionInput
              q={q}
              value={responses[q.id]}
              onChange={(v: unknown) => setResponses((r) => ({ ...r, [q.id]: v }))}
            />
          </View>
        </View>
      ))}
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TouchableOpacity style={[s.btn, { backgroundColor: EMERALD }]} onPress={submit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Submit answers</Text>}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export { NAVY };
