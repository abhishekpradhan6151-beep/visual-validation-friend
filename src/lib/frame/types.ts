export const PLATFORMS = ["Instagram Reel", "YouTube Short", "TikTok"] as const;
export const LANGUAGES = ["English", "Hindi", "Hinglish"] as const;
export const TONES = ["Educational", "Conversational", "Funny", "Storytelling", "Dramatic"] as const;
export const DURATIONS = [15, 30, 45, 60] as const;

export type Platform = (typeof PLATFORMS)[number];
export type Language = (typeof LANGUAGES)[number];
export type Tone = (typeof TONES)[number];
export type Duration = (typeof DURATIONS)[number];

export const IDEA_MIN = 8;
export const IDEA_MAX = 500;
export const INSTRUCTION_MAX = 300;

export interface Brief {
  idea: string;
  platform: Platform;
  language: Language;
  tone: Tone;
  duration: Duration;
}

export interface Script {
  opening: string;
  points: string[];
  ending: string;
}

/** Structured package — the same schema the future server function must return. */
export interface ContentPackage {
  hooks: string[];
  script: Script;
  caption: string;
  cta: string;
}

export type SectionKey = keyof ContentPackage;

export interface Creation {
  id: string;
  brief: Brief;
  content: ContentPackage;
  /** "mock" until a real provider is connected. */
  source: "mock" | "ai";
  createdAt: number;
  updatedAt: number;
}

export function validateIdea(idea: string): string | null {
  const t = idea.trim();
  if (!t) return "Describe your idea to get started.";
  if (t.length < IDEA_MIN) return `Add a little more detail (at least ${IDEA_MIN} characters).`;
  if (t.length > IDEA_MAX) return `Keep it under ${IDEA_MAX} characters.`;
  return null;
}
