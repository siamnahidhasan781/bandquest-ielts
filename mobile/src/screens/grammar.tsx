/** BandQuest IELTS mobile — Grammar Academy mastery. */
import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api";
import { s, ACCENT, EMERALD, AMBER, NAVY } from "../theme";

function MasteryBar({ value }: { value: number }) {
  const color = value >= 0.8 ? EMERALD : value >= 0.5 ? ACCENT : AMBER;
  return (
    <View style={{ height: 8, backgroundColor: "#e8edf3", borderRadius: 4, marginTop: 6 }}>
      <View style={{ width: `${Math.round(value * 100)}%`, height: 8, backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
}

export function GrammarScreen() {
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await api.grammarMastery();
      setConcepts(d.concepts ?? []);
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

  const avg = concepts.length
    ? concepts.reduce((a, c) => a + (c.mastery ?? 0), 0) / concepts.length
    : 0;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>Grammar Academy</Text>
      <Text style={s.muted}>Mastery grows as you answer — it never maxes out from one try.</Text>
      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.h3}>Overall mastery</Text>
        <Text style={[s.h1, { color: NAVY }]}>{Math.round(avg * 100)}%</Text>
        <MasteryBar value={avg} />
      </View>
      {concepts.map((c: any, i: number) => (
        <View key={i} style={s.card}>
          <Text style={s.h3}>{c.concept ?? c.tag}</Text>
          <Text style={s.muted}>
            {Math.round((c.mastery ?? 0) * 100)}% · {c.attempts ?? 0} attempts
          </Text>
          <MasteryBar value={c.mastery ?? 0} />
        </View>
      ))}
      {concepts.length === 0 ? (
        <View style={s.card}>
          <Text style={s.muted}>No data yet — complete a checkpoint to start tracking grammar mastery.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
