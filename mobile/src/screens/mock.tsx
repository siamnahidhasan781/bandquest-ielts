/** BandQuest IELTS mobile — Mock Test Centre. */
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
import { api } from "../api";
import { s, ACCENT, EMERALD, NAVY } from "../theme";

const SECTION_ORDER = ["listening", "reading", "writing"];

export function MockScreen() {
  const [mocks, setMocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, any[]>>({});
  const [current, setCurrent] = useState("listening");
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [writing, setWriting] = useState({ task1: "", task2: "" });
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await api.mocks();
      setMocks(d.mocks ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { if (!sessionId) load(); }, [load, sessionId]));

  const start = async (mockId: string) => {
    setError("");
    setStarting(true);
    try {
      const d = await api.startMock(mockId, SECTION_ORDER);
      setSessionId(d.sessionId);
      setSections(d.sections);
      setCurrent("listening");
      setResponses({});
      setWriting({ task1: "", task2: "" });
      setReport(null);
    } catch (e: any) {
      setError(e.code === "signup_required" ? "Mock tests need a free account." : e.message);
    } finally {
      setStarting(false);
    }
  };

  const submit = async () => {
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const r = await api.submitMock(sessionId, { responses, writing });
      setReport(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const answer = (qid: string, v: unknown) => setResponses((r) => ({ ...r, [qid]: v }));

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (report) {
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.padded}>
        <Text style={s.h1}>Mock report</Text>
        <View style={[s.card, { alignItems: "center" }]}>
          <Text style={{ fontSize: 52, fontWeight: "800", color: NAVY }}>
            {report.overallBand?.toFixed(1) ?? "—"}
          </Text>
          <Text style={s.muted}>Estimated overall band</Text>
        </View>
        <View style={s.card}>
          <Markdown>{report.report_md ?? ""}</Markdown>
        </View>
        <Text style={[s.muted, { fontSize: 11, marginTop: 8 }]}>
          This is an estimated practice result, not an official IELTS Test Report Form.
        </Text>
        <TouchableOpacity
          style={s.btn}
          onPress={() => { setReport(null); setSessionId(null); load(); }}
        >
          <Text style={s.btnText}>Back to mocks</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (sessionId) {
    const qs = sections[current] ?? [];
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.padded}>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Text style={s.h1}>{current[0].toUpperCase() + current.slice(1)}</Text>
          <Text style={s.muted}>{SECTION_ORDER.indexOf(current) + 1}/3</Text>
        </View>
        {current !== "writing" ? (
          qs.map((q: any, i: number) => (
            <View key={q.id} style={[s.card, { marginTop: 8 }]}>
              <Text style={s.muted}>Q{i + 1}</Text>
              <Markdown>{q.prompt_md ?? ""}</Markdown>
              {q.qtype === "mcq" && q.options_json ? (
                q.options_json.map((opt: string, oi: number) => (
                  <TouchableOpacity
                    key={oi}
                    style={[s.card, { marginBottom: 6, borderWidth: 2, borderColor: responses[q.id] === oi ? ACCENT : "transparent" }]}
                    onPress={() => answer(q.id, oi)}
                  >
                    <Text style={s.body}>{opt}</Text>
                  </TouchableOpacity>
                ))
              ) : q.qtype === "truefalse" ? (
                <View style={[s.row, { justifyContent: "space-between" }]}>
                  {["true", "false", "notgiven"].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[s.chip, responses[q.id] === opt && { backgroundColor: ACCENT }, { paddingVertical: 10 }]}
                      onPress={() => answer(q.id, opt)}
                    >
                      <Text style={[s.chipText, responses[q.id] === opt && { color: "#fff" }]}>
                        {opt === "notgiven" ? "Not Given" : opt[0].toUpperCase() + opt.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={s.input}
                  value={String(responses[q.id] ?? "")}
                  onChangeText={(v) => answer(q.id, v)}
                  placeholder="Your answer"
                />
              )}
            </View>
          ))
        ) : (
          <>
            <Text style={[s.label, { marginTop: 12 }]}>Task 1 (150+ words)</Text>
            <TextInput
              style={[s.input, { height: 140, textAlignVertical: "top" }]}
              value={writing.task1}
              onChangeText={(v) => setWriting((w) => ({ ...w, task1: v }))}
              multiline
              placeholder="Task 1 response…"
            />
            <Text style={s.label}>Task 2 (250+ words)</Text>
            <TextInput
              style={[s.input, { height: 220, textAlignVertical: "top" }]}
              value={writing.task2}
              onChangeText={(v) => setWriting((w) => ({ ...w, task2: v }))}
              multiline
              placeholder="Task 2 essay…"
            />
          </>
        )}
        {error ? <Text style={s.error}>{error}</Text> : null}
        <View style={[s.row, { justifyContent: "space-between", marginTop: 8 }]}>
          {SECTION_ORDER.indexOf(current) > 0 ? (
            <TouchableOpacity
              style={s.btnSecondary}
              onPress={() => setCurrent(SECTION_ORDER[SECTION_ORDER.indexOf(current) - 1])}
            >
              <Text style={s.btnSecondaryText}>← Back</Text>
            </TouchableOpacity>
          ) : <View />}
          {SECTION_ORDER.indexOf(current) < SECTION_ORDER.length - 1 ? (
            <TouchableOpacity
              style={s.btn}
              onPress={() => setCurrent(SECTION_ORDER[SECTION_ORDER.indexOf(current) + 1])}
            >
              <Text style={s.btnText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.btn, { backgroundColor: EMERALD }]} onPress={submit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Submit mock</Text>}
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>Mock Tests</Text>
      <Text style={s.muted}>Full exam simulation · ~2h45m · estimated band report</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      {mocks.map((m: any) => (
        <View key={m.id} style={s.card}>
          <Text style={s.h3}>{m.title}</Text>
          <Text style={s.muted}>{m.test_type}</Text>
          <TouchableOpacity style={s.btn} onPress={() => start(m.id)} disabled={starting}>
            {starting ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Start mock</Text>}
          </TouchableOpacity>
        </View>
      ))}
      {mocks.length === 0 && !loading ? (
        <View style={s.card}>
          <Text style={s.muted}>No mock tests published yet.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
