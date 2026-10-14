import type { Brief, Creation } from "./types";

const KEY = "frame.creations.v1";
const DRAFT_KEY = "frame.draft.v1";
const SETTINGS_KEY = "frame.settings.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  localStorage.setItem(key, JSON.stringify(v));
}

export const listCreations = () => read<Creation[]>(KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
export const getCreation = (id: string) => listCreations().find((c) => c.id === id) ?? null;

export function saveCreation(c: Creation) {
  const all = read<Creation[]>(KEY, []).filter((x) => x.id !== c.id);
  write(KEY, [{ ...c, updatedAt: Date.now() }, ...all]);
}
export function deleteCreation(id: string) {
  write(KEY, read<Creation[]>(KEY, []).filter((x) => x.id !== id));
}
export const clearCreations = () => write(KEY, []);

/** Working (unsaved) creation that the studio is currently showing. */
export const getDraft = () => read<Creation | null>(DRAFT_KEY, null);
export const setDraft = (c: Creation) => write(DRAFT_KEY, c);

export type Settings = Omit<Brief, "idea">;
export const DEFAULT_SETTINGS: Settings = {
  platform: "Instagram Reel",
  language: "English",
  tone: "Conversational",
  duration: 30,
};
export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(SETTINGS_KEY, {}) });
export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
