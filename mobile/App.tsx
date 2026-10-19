/** BandQuest IELTS mobile — navigation root. */
import React from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/auth";
import { WelcomeScreen, SignInScreen, SignUpScreen } from "./src/screens/auth";
import { HomeScreen } from "./src/screens/home";
import { CoursesScreen, EpisodesScreen, LessonScreen, CheckpointScreen } from "./src/screens/learn";
import { VocabScreen } from "./src/screens/vocab";
import { GrammarScreen } from "./src/screens/grammar";
import { SkillsScreen, WritingScreen, SpeakingScreen } from "./src/screens/skills";
import { MockScreen } from "./src/screens/mock";
import { MoreScreen, ProgressScreen, AchievementsScreen, CertificatesScreen, ProfileScreen } from "./src/screens/more";
import { ACCENT, NAVY } from "./src/theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOpts = {
  headerStyle: { backgroundColor: "#0f1f3d" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" as const },
};

function LearnStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="Courses" component={CoursesScreen} options={{ title: "Learn" }} />
      <Stack.Screen name="Episodes" component={EpisodesScreen} options={({ route }: any) => ({ title: route.params?.title ?? "Episodes" })} />
      <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: "Lesson" }} />
      <Stack.Screen name="Checkpoint" component={CheckpointScreen} options={{ title: "Checkpoint" }} />
    </Stack.Navigator>
  );
}

function SkillsStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="SkillsHome" component={SkillsScreen} options={{ title: "Skills" }} />
      <Stack.Screen name="Writing" component={WritingScreen} />
      <Stack.Screen name="Speaking" component={SpeakingScreen} />
    </Stack.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="MoreHome" component={MoreScreen} options={{ title: "More" }} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Certificates" component={CertificatesScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Mock" component={MockScreen} options={{ title: "Mock Tests" }} />
      <Stack.Screen name="Grammar" component={GrammarScreen} options={{ title: "Grammar" }} />
    </Stack.Navigator>
  );
}

function VocabStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="VocabHome" component={VocabScreen} options={{ title: "Vocabulary" }} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: "BandQuest IELTS" }} />
      <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: "Lesson" }} />
      <Stack.Screen name="Checkpoint" component={CheckpointScreen} options={{ title: "Checkpoint" }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Create account" }} />
    </Stack.Navigator>
  );
}

const TAB_ICONS: Record<string, string> = {
  Home: "🏠",
  Learn: "📚",
  Vocab: "🃏",
  Skills: "🎯",
  More: "☰",
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: "#8aa3c7",
        tabBarIcon: ({ focused }: any) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{TAB_ICONS[route.name] ?? "•"}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Learn" component={LearnStack} />
      <Tab.Screen name="Vocab" component={VocabStack} />
      <Tab.Screen name="Skills" component={SkillsStack} />
      <Tab.Screen name="More" component={MoreStack} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: "Sign in" }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Create account" }} />
    </Stack.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f1f3d" }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 12 }}>BandQuest IELTS</Text>
      </View>
    );
  }
  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export { NAVY };
