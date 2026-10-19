/** BandQuest IELTS mobile — More tab: menu, progress, profile, achievements, certificates. */
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
import { api } from "../api";
import { useAuth } from "../auth";
import { s, ACCENT, EMERALD, AMBER, RED } from "../theme";

export function MoreScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const items = [
    { title: "📊 Progress & analytics", screen: "Progress" },
    { title: "📝 Mock tests", screen: "Mock" },
    { title: "🔤 Grammar academy", screen: "Grammar" },
    { title: "🏆 Achievements", screen: "Achievements" },
    { title: "🎓 Certificates", screen: "Certificates" },
    { title: "👤 Profile & settings", screen: "Profile" },
  ];
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>More</Text>
      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.h3}>{user?.isGuest ? "Guest" : user?.displayName}</Text>
        <Text style={s.muted}>{user?.isGuest ? "Trial account" : user?.email}</Text>
      </View>
      {items.map((i) => (
        <TouchableOpacity key={i.screen} style={s.card} onPress={() => navigation.navigate(i.screen)}>
          <Text style={s.h3}>{i.title} →</Text>
        </TouchableOpacity>
      ))}
      {user?.isGuest ? (
        <TouchableOpacity style={[s.btn, { backgroundColor: EMERALD }]} onPress={() => navigation.navigate("SignUp")}>
          <Text style={s.btnText}>Create free account</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={s.btnSecondary} onPress={logout}>
        <Text style={s.btnSecondaryText}>{user?.isGuest ? "End guest session" : "Sign out"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function ProgressScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await api.dashboard());
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

  const trend = data?.mockTrend ?? [];
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>Progress</Text>
      <View style={[s.row, { marginTop: 12 }]}>
        <View style={[s.card, { flex: 1, marginRight: 6, alignItems: "center" }]}>
          <Text style={[s.h2, { color: ACCENT }]}>{data?.xp ?? 0}</Text>
          <Text style={s.muted}>Total XP</Text>
        </View>
        <View style={[s.card, { flex: 1, marginLeft: 6, alignItems: "center" }]}>
          <Text style={[s.h2, { color: AMBER }]}>{data?.streak?.current_streak ?? 0}</Text>
          <Text style={s.muted}>Day streak</Text>
        </View>
      </View>
      <Text style={[s.h2, { marginTop: 8 }]}>Mock band trend</Text>
      {trend.length ? (
        trend.map((t: any, i: number) => (
          <View key={i} style={s.card}>
            <Text style={s.body}>
              {t.taken_at?.slice(0, 10)} — <Text style={{ fontWeight: "700" }}>{t.overall_band?.toFixed(1)}</Text>
            </Text>
          </View>
        ))
      ) : (
        <View style={s.card}>
          <Text style={s.muted}>No mock tests yet.</Text>
        </View>
      )}
      <Text style={[s.h2, { marginTop: 8 }]}>Weak concepts</Text>
      {(data?.weakConcepts ?? []).slice(0, 8).map((w: any, i: number) => (
        <View key={i} style={s.card}>
          <Text style={s.body}>
            {w.concept ?? w.tag} — {Math.round((w.mastery ?? 0) * 100)}%
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function AchievementsScreen() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await api.achievements();
      setList(d.achievements ?? []);
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
      <Text style={s.h1}>Achievements</Text>
      {list.map((a: any) => (
        <View key={a.code} style={[s.card, !a.earned && { opacity: 0.55 }]}>
          <Text style={s.h3}>{a.earned ? "🏆" : "🔒"} {a.title}</Text>
          <Text style={s.muted}>{a.description}</Text>
          <Text style={s.muted}>+{a.xp_reward} XP{a.earned_at ? ` · earned ${a.earned_at.slice(0, 10)}` : ""}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function CertificatesScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [issuing, setIssuing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.certificates());
    } catch (e: any) {
      setError(e.code === "signup_required" ? "Certificates need a free account." : e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const issue = async (courseId: string) => {
    setIssuing(courseId);
    try {
      await api.issueCertificate({ courseId });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not issue.");
    } finally {
      setIssuing(null);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>Certificates</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Text style={[s.h2, { marginTop: 8 }]}>Issued</Text>
      {(data?.certificates ?? []).map((c: any) => (
        <View key={c.id} style={s.card}>
          <Text style={s.h3}>🎓 {c.course_title}</Text>
          <Text style={s.muted}>{c.display_name} · {c.issued_at?.slice(0, 10)}</Text>
          <Text style={s.muted}>Verify code: {c.verify_code}</Text>
        </View>
      ))}
      {(data?.certificates ?? []).length === 0 && !error ? (
        <View style={s.card}>
          <Text style={s.muted}>No certificates yet — complete a course to earn one.</Text>
        </View>
      ) : null}
      <Text style={[s.h2, { marginTop: 8 }]}>Eligibility</Text>
      {(data?.eligibility ?? []).map((e: any) => (
        <View key={e.course_id} style={s.card}>
          <Text style={s.h3}>{e.title}</Text>
          <Text style={s.muted}>{e.eligible ? "✅ Eligible" : `🔒 ${e.reason}`}</Text>
          {e.eligible ? (
            <TouchableOpacity style={s.btn} onPress={() => issue(e.course_id)} disabled={issuing === e.course_id}>
              {issuing === e.course_id ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Issue certificate</Text>}
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const BANDS = ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [minutes, setMinutes] = useState("30");

  const load = useCallback(async () => {
    try {
      const d = await api.profile();
      setProfile(d.profile);
      if (d.profile?.minutes_per_day) setMinutes(String(d.profile.minutes_per_day));
    } catch (e: any) {
      setError(e.code === "signup_required" ? "Profile settings need a free account." : e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async (patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      await api.updateProfile(patch);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>Profile</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.h3}>{user?.isGuest ? "Guest" : user?.displayName}</Text>
        <Text style={s.muted}>{user?.isGuest ? "Trial account" : user?.email}</Text>
        <Text style={s.muted}>Role: {user?.role}</Text>
      </View>
      {!user?.isGuest ? (
        <>
          <Text style={s.h2}>Target band</Text>
          <View style={[s.row, { flexWrap: "wrap", marginTop: 8 }]}>
            {BANDS.map((b) => (
              <TouchableOpacity
                key={b}
                style={[s.chip, Number(profile?.target_band) === Number(b) && { backgroundColor: ACCENT }, { marginBottom: 8, paddingVertical: 10 }]}
                onPress={() => save({ target_band: b })}
                disabled={saving}
              >
                <Text style={[s.chipText, Number(profile?.target_band) === Number(b) && { color: "#fff" }]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.h2}>Study time</Text>
          <View style={[s.row, { marginTop: 8 }]}>
            {[15, 30, 60, 120].map((m) => (
              <TouchableOpacity
                key={m}
                style={[s.chip, Number(profile?.minutes_per_day) === m && { backgroundColor: ACCENT }, { paddingVertical: 10 }]}
                onPress={() => save({ minutes_per_day: m })}
                disabled={saving}
              >
                <Text style={[s.chipText, Number(profile?.minutes_per_day) === m && { color: "#fff" }]}>{m}m</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.h2}>Test type</Text>
          <View style={[s.row, { marginTop: 8 }]}>
            {(["academic", "general"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.chip, profile?.test_type === t && { backgroundColor: ACCENT }, { paddingVertical: 10 }]}
                onPress={() => save({ test_type: t })}
                disabled={saving}
              >
                <Text style={[s.chipText, profile?.test_type === t && { color: "#fff" }]}>
                  {t === "academic" ? "Academic" : "General Training"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {saving ? <ActivityIndicator color={ACCENT} style={{ marginTop: 12 }} /> : null}
          <Text style={[s.muted, { marginTop: 8 }]}>Minutes per day (custom):</Text>
          <View style={s.row}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[s.btn, { marginTop: 8, marginLeft: 8, paddingHorizontal: 20 }]}
              onPress={() => save({ minutes_per_day: Math.max(5, Math.min(480, parseInt(minutes, 10) || 30)) })}
            >
              <Text style={s.btnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
      <TouchableOpacity style={[s.btnSecondary, { borderColor: RED, marginTop: 24 }]} onPress={logout}>
        <Text style={[s.btnSecondaryText, { color: RED }]}>{user?.isGuest ? "End guest session" : "Sign out"}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
