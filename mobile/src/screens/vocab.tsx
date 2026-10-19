/** BandQuest IELTS mobile — Vocabulary SRS flashcards. */
import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api";
import { s, ACCENT, EMERALD, AMBER, RED } from "../theme";

const GRADES = [
  { grade: 1, label: "Again", color: RED },
  { grade: 3, label: "Hard", color: AMBER },
  { grade: 4, label: "Good", color: ACCENT },
  { grade: 5, label: "Easy", color: EMERALD },
];

export function VocabScreen() {
  const [cards, setCards] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.vocabDue(20);
      setCards(d.cards);
      setIdx(0);
      setFlipped(false);
      setDone(d.cards.length === 0);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const grade = async (g: number) => {
    const card = cards[idx];
    try {
      await api.reviewVocab(card.vocab_id, g, "recall");
    } catch {
    }
    if (idx + 1 >= cards.length) {
      setDone(true);
    } else {
      setIdx(idx + 1);
      setFlipped(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (done) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 48 }}>🎉</Text>
        <Text style={s.h2}>All caught up!</Text>
        <Text style={[s.muted, { textAlign: "center", marginTop: 8 }]}>
          No cards due right now. Come back later — spaced repetition works best in small sessions.
        </Text>
        <TouchableOpacity style={s.btn} onPress={load}>
          <Text style={s.btnText}>Check again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const card = cards[idx];
  if (!card) return <View style={s.center}><Text style={s.muted}>No cards.</Text></View>;

  return (
    <View style={[s.screen, s.padded]}>
      <Text style={s.muted}>
        Card {idx + 1} of {cards.length}
      </Text>
      <TouchableOpacity
        style={[s.card, { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 12 }]}
        onPress={() => setFlipped(!flipped)}
        activeOpacity={0.9}
      >
        <Text style={[s.h1, { fontSize: 34, textAlign: "center" }]}>{card.word}</Text>
        {card.pos ? <Text style={s.muted}>{card.pos}</Text> : null}
        {flipped ? (
          <View style={{ marginTop: 16, alignItems: "center" }}>
            <Text style={[s.body, { textAlign: "center" }]}>Tap to recall, then grade yourself honestly.</Text>
            <Text style={[s.muted, { marginTop: 8 }]}>Definition hidden until you flip — check the web app for full entries.</Text>
          </View>
        ) : (
          <Text style={[s.muted, { marginTop: 16 }]}>Tap to flip 👆</Text>
        )}
      </TouchableOpacity>
      {flipped ? (
        <View style={[s.row, { justifyContent: "space-between", marginTop: 4 }]}>
          {GRADES.map((g) => (
            <TouchableOpacity
              key={g.grade}
              style={[s.chip, { backgroundColor: g.color, paddingHorizontal: 16, paddingVertical: 12 }]}
              onPress={() => grade(g.grade)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
