/** BandQuest IELTS mobile — shared API client (same backend as web). */
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const cfg = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string };
export const API_URL = cfg.apiUrl || "http://localhost:3000";

const TOKEN_KEY = "bq_session_token";
let unauthorizedHandler: (() => void) | null = null;

export function onUnauthorized(fn: () => void) {
  unauthorizedHandler = fn;
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string | null): Promise<void> {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

async function request<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "x-bq-mobile": "1",
      ...(token ? { Cookie: `bq_session=${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401 && unauthorizedHandler) unauthorizedHandler();
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    const e = new Error(data.error || "Request failed") as Error & { code?: string; status?: number };
    e.code = data.code;
    e.status = res.status;
    throw e;
  }
  return data as T;
}

const get = <T = any>(path: string) => request<T>(path);
const post = <T = any>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
const put = <T = any>(path: string, body?: unknown) =>
  request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined });

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isGuest: boolean;
}

export const api = {
  // auth
  me: () => get<{ user: User | null }>("/api/auth/me"),
  login: (email: string, password: string) =>
    post<{ user: User; token: string }>("/api/auth/login", { email, password }),
  register: (email: string, password: string, displayName: string) =>
    post<{ user: User; token: string }>("/api/auth/register", { email, password, displayName }),
  guest: () => post<{ user: User; token: string }>("/api/auth/guest"),
  googleMobile: (idToken: string) =>
    post<{ user: User; token: string }>("/api/auth/google/mobile", { idToken }),
  logout: () => post("/api/auth/logout"),
  authConfig: () => get<{ googleEnabled: boolean }>("/api/auth/config"),

  // learning
  courses: () => get<{ courses: any[] }>("/api/courses"),
  episode: (id: string) => get<{ episode: any }>(`/api/episodes/${id}`),
  startAttempt: (episodeId: string, kind: string = "checkpoint") =>
    post<{ attemptId: string; questions: any[] }>("/api/attempts/start", { episodeId, kind }),
  submitAttempt: (attemptId: string, responses: Record<string, unknown>) =>
    post<{ score: number; stars: number; passed: boolean; results: any[]; xp?: number }>(
      `/api/attempts/${attemptId}/submit`,
      { responses }
    ),
  dashboard: () => get<any>("/api/dashboard"),
  revision: () => get<any>("/api/revision"),
  achievements: () => get<any>("/api/achievements"),
  certificates: () => get<any>("/api/certificates"),
  issueCertificate: (body: any) => post("/api/certificates", body),
  grammarMastery: () => get<{ concepts: any[] }>("/api/grammar/mastery"),
  vocabDue: (limit = 20) => get<{ cards: any[]; total: number }>(`/api/vocab/due?limit=${limit}`),
  reviewVocab: (vocabId: string, grade: number, mode = "recall") =>
    post("/api/vocab/review", { vocabId, grade, mode }),
  skillExtra: (episodeId: string) => get<any>(`/api/skills/extra?episodeId=${episodeId}`),

  // AI + mocks (registered users only)
  aiWriting: (prompt: string, taskType: string, text: string) =>
    post<any>("/api/ai/writing", { prompt, taskType, text }),
  aiSpeaking: (body: Record<string, unknown>) => post<any>("/api/ai/speaking", body),
  mocks: () => get<{ mocks: any[] }>("/api/mock"),
  startMock: (mockId: string, sections: string[]) =>
    post<{ sessionId: string; sections: Record<string, any[]> }>("/api/mock", { mockId, sections }),
  submitMock: (sessionId: string, body: Record<string, unknown>) =>
    put<any>(`/api/mock?sessionId=${sessionId}`, body),

  // profile
  profile: () => get<any>("/api/profile"),
  updateProfile: (body: Record<string, unknown>) => put("/api/profile", body),
  studyPlan: () => get<any>("/api/study-plan"),
  generateStudyPlan: (body: Record<string, unknown>) => post("/api/study-plan", body),
};
