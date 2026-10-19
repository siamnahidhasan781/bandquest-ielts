/** BandQuest IELTS mobile — Home dashboard. */
import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api";
import { useAuth } from "../auth";
import { s, ACCENT, EMERALD, AMBER } from "../theme";

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api.dashboard();
      setData(d);
    } catch {
      /* offline etc. */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  const xp = data?.xp ?? 0;
  const streak = data?.streak?.current_streak ?? 0;
  const nextUp = data?.nextUp ?? [];
  const weak = data?.weakConcepts ?? [];

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.padded}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <Text style={s.h1}>Hi, {user?.isGuest ? "Guest" : user?.displayName ?? "Learner"} 👋</Text>
      {user?.isGuest ? (
        <TouchableOpacity
          style={[s.card, { backgroundColor: "#fffbeb", marginTop: 12 }]}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={{ fontWeight: "700", color: "#92400e" }}>
            You're learning as a guest — progress is saved in this app.
          </Text>
          <Text style={{ color: "#92400e", marginTop: 4 }}>
            Create a free account to sync everywhere + unlock AI feedback & mock tests →
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={[s.row, { marginTop: 12 }]}>
        <View style={[s.card, { flex: 1, marginRight: 6, alignItems: "center" }]}>
          <Text style={{ fontSize: 24 }}>⚡</Text>
          <Text style={[s.h2, { color: ACCENT }]}>{xp}</Text>
          <Text style={s.muted}>XP</Text>
        </View>
        <View style={[s.card, { flex: 1, marginLeft: 6, alignItems: "center" }]}>
          <Text style={{ fontSize: 24 }}>🔥</Text>
          <Text style={[s.h2, { color: AMBER }]}>{streak}</Text>
          <Text style={s.muted}>day streak</Text>
        </View>
      </View>

      <Text style={[s.h2, { marginTop: 8 }]}>Continue learning</Text>
      {(nextUp as any[]).slice(0, 3).map((n: any) => (
        <TouchableOpacity
          key={n.episode_id}
          style={s.card}
          onPress={() => navigation.navigate("Lesson", { episodeId: n.episode_id })}
        >
          <Text style={s.h3}>{n.title}</Text>
          <Text style={s.muted}>{n.course_title} · Continue →</Text>
        </TouchableOpacity>
      ))}
      {nextUp.length === 0 ? (
        <View style={s.card}>
          <Text style={s.muted}>Start your journey — pick a course below.</Text>
        </View>
      ) : null}

      {weak.length > 0 ? (
        <>
          <Text style={[s.h2, { marginTop: 8 }]}>Work on these</Text>
          <View style={s.card}>
            {weak.slice(0, 5).map((w: any, i: number) => (
              <Text key={i} style={[s.body, { marginBottom: 4 }]}>
                • {w.concept ?? w.tag} <Text style={[s.muted]}>({Math.round((w.mastery ?? 0) * 100)}%)</Text>
              </Text>
            ))}
          </View>
        </>
      ) : null}

      <TouchableOpacity style={[s.btn, { backgroundColor: EMERALD }]} onPress={() => navigation.navigate("LearnTab")}>
        <Text style={s.btnText}>Browse courses</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
