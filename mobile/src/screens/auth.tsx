/** BandQuest IELTS mobile — Welcome / Sign in / Sign up. */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import * as Google from "expo-auth-session/providers/google";
import { useAuth } from "../auth";
import { api } from "../api";
import { s, NAVY, ACCENT } from "../theme";

const googleClientId =
  ((Constants.expoConfig?.extra ?? {}) as { googleClientId?: string }).googleClientId ?? "";

export function WelcomeScreen({ navigation }: any) {
  const { continueAsGuest } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const guest = async () => {
    setBusy(true);
    setError("");
    try {
      await continueAsGuest();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not continue as guest.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.padded, { paddingTop: 80 }]}>
      <Text style={[s.h1, { fontSize: 34 }]}>BandQuest IELTS</Text>
      <Text style={[s.muted, { fontSize: 16, marginTop: 8 }]}>
        From Zero to IELTS-Ready.{"\n"}Free forever for learners.
      </Text>

      <View style={[s.card, { marginTop: 32 }]}>
        <Text style={s.body}>
          10 grammar episodes · 4 skill academies · vocabulary SRS · mock tests · AI feedback
        </Text>
      </View>

      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate("SignIn")}>
        <Text style={s.btnText}>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.navigate("SignUp")}>
        <Text style={s.btnSecondaryText}>Create free account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnSecondary} onPress={guest} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={ACCENT} />
        ) : (
          <Text style={s.btnSecondaryText}>Continue as guest</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={s.error}>{error}</Text> : null}
      <Text style={[s.muted, { marginTop: 16, textAlign: "center" }]}>
        Guests can learn right away — progress is saved. AI feedback and mock tests need a free account.
      </Text>
    </ScrollView>
  );
}

function GoogleButton() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: googleClientId,
    scopes: ["openid", "email", "profile"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = (response.params as any)?.id_token;
      if (idToken) {
        signInWithGoogle(idToken).catch((e) =>
          setError(e instanceof Error ? e.message : "Google sign-in failed.")
        );
      } else {
        setError("Google did not return an identity token.");
      }
    } else if (response?.type === "error") {
      setError("Google sign-in was cancelled or failed.");
    }
  }, [response]);

  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    api
      .authConfig()
      .then((d) => setEnabled(Boolean(d.googleEnabled) && googleClientId.length > 0))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;
  return (
    <View>
      <TouchableOpacity
        style={s.btnSecondary}
        disabled={!request}
        onPress={() => promptAsync()}
      >
        <Text style={s.btnSecondaryText}>Continue with Google</Text>
      </TouchableOpacity>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

export function SignInScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>Welcome back</Text>
      <Text style={s.muted}>Pick up right where you left off.</Text>
      <Text style={s.label}>Email</Text>
      <TextInput
        style={s.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
      />
      <Text style={s.label}>Password</Text>
      <TextInput
        style={s.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Your password"
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign in</Text>}
      </TouchableOpacity>
      <GoogleButton />
      <TouchableOpacity onPress={() => navigation.navigate("SignUp")} style={{ marginTop: 16 }}>
        <Text style={[s.muted, { textAlign: "center" }]}>
          New here? <Text style={{ color: ACCENT, fontWeight: "700" }}>Create a free account</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function SignUpScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await register(email.trim(), password, name.trim() || "Learner");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.padded}>
      <Text style={s.h1}>Create your free account</Text>
      <Text style={s.muted}>Your guest progress carries over automatically.</Text>
      <Text style={s.label}>Display name</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your name" />
      <Text style={s.label}>Email</Text>
      <TextInput
        style={s.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
      />
      <Text style={s.label}>Password</Text>
      <TextInput
        style={s.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="At least 8 characters"
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create free account</Text>}
      </TouchableOpacity>
      <GoogleButton />
      <TouchableOpacity onPress={() => navigation.navigate("SignIn")} style={{ marginTop: 16 }}>
        <Text style={[s.muted, { textAlign: "center" }]}>
          Already have an account? <Text style={{ color: ACCENT, fontWeight: "700" }}>Sign in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export { NAVY };
