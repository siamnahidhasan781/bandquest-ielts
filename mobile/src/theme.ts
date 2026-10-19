/** BandQuest IELTS mobile — design tokens + shared styles. */
import { StyleSheet } from "react-native";

export const NAVY = "#0f1f3d";
export const NAVY_LIGHT = "#5f7fae";
export const ACCENT = "#2797a8";
export const EMERALD = "#10b981";
export const AMBER = "#f59e0b";
export const RED = "#ef4444";
export const BG = "#f7f9fc";
export const CARD = "#ffffff";

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  padded: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  h1: { fontSize: 26, fontWeight: "800", color: NAVY },
  h2: { fontSize: 20, fontWeight: "700", color: NAVY },
  h3: { fontSize: 16, fontWeight: "700", color: NAVY },
  body: { fontSize: 14, color: NAVY },
  muted: { fontSize: 13, color: NAVY_LIGHT },
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#0f1f3d",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  btn: {
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnSecondary: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#d5dee9",
    backgroundColor: CARD,
  },
  btnSecondaryText: { color: NAVY, fontWeight: "700", fontSize: 16 },
  input: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d5dee9",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: NAVY,
    marginTop: 8,
  },
  label: { fontSize: 13, fontWeight: "600", color: NAVY, marginTop: 12 },
  error: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    color: RED,
    fontSize: 13,
  },
  row: { flexDirection: "row", alignItems: "center" },
  chip: {
    backgroundColor: "#eef2f7",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipText: { fontSize: 12, color: NAVY, fontWeight: "600" },
});
