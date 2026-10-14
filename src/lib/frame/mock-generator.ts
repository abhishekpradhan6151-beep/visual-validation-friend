import type { Brief, ContentPackage, SectionKey } from "./types";

/** Deterministic sample generator. Output is clearly labelled as sample content in the UI. */

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function pick<T>(arr: readonly T[], seed: number, offset = 0) {
  return arr[(seed + offset) % arr.length];
}
function topicOf(idea: string) {
  const t = idea.trim().replace(/[.?!]+$/, "");
  return t.length > 70 ? t.slice(0, 67).trimEnd() + "…" : t;
}

const HOOKS: Record<Brief["language"], ((t: string) => string)[]> = {
  English: [
    (t) => `Nobody tells you this about ${t.toLowerCase()}.`,
    (t) => `I tried ${t.toLowerCase()} for 30 days. Here's what actually happened.`,
    (t) => `Stop scrolling if you've ever struggled with ${t.toLowerCase()}.`,
    (t) => `The fastest way to understand ${t.toLowerCase()} — in under a minute.`,
    (t) => `You're probably getting ${t.toLowerCase()} wrong. Let me fix that.`,
  ],
  Hindi: [
    (t) => `${t} के बारे में ये बात कोई नहीं बताता।`,
    (t) => `एक मिनट में समझिए — ${t}।`,
    (t) => `अगर आप ${t} से परेशान हैं, तो ये वीडियो आपके लिए है।`,
    (t) => `${t} में सबसे बड़ी गलती क्या है? चलिए जानते हैं।`,
  ],
  Hinglish: [
    (t) => `${t} ke baare mein ye koi nahi batata.`,
    (t) => `Bas 1 minute do — ${t} poora samjha dunga.`,
    (t) => `Agar ${t} se struggle kar rahe ho, toh ye video tumhare liye hai.`,
    (t) => `Sach bataun? Zyada log ${t} galat karte hain.`,
  ],
};

const POINTS: Record<Brief["language"], string[]> = {
  English: [
    "Start with the one thing most people overlook.",
    "Show a quick, real example the viewer can picture.",
    "Break the common myth with a simple comparison.",
    "Give one practical step they can try today.",
    "Share the mistake you made so they don't have to.",
  ],
  Hindi: [
    "सबसे पहले वो बात जो ज़्यादातर लोग भूल जाते हैं।",
    "एक छोटा, असली उदाहरण दिखाइए।",
    "आम गलतफहमी को आसान तुलना से तोड़िए।",
    "एक आसान कदम जो आज ही आज़माया जा सके।",
  ],
  Hinglish: [
    "Pehle woh cheez jo zyada log ignore karte hain.",
    "Ek quick real example dikhao jo relate ho.",
    "Common myth ko ek simple comparison se todo.",
    "Ek practical step do jo aaj hi try ho sake.",
  ],
};

const TONE_FLAVOUR: Record<Brief["tone"], string> = {
  Educational: "Keep it clear and factual.",
  Conversational: "Talk like you're explaining it to a friend.",
  Funny: "Add a light, self-aware joke here.",
  Storytelling: "Frame it as a small personal moment.",
  Dramatic: "Pause for a beat before the reveal.",
};

const CTA: Record<Brief["language"], string[]> = {
  English: [
    "Follow for part two — it gets better.",
    "Save this so you don't forget it.",
    "Comment “more” and I'll make the next one.",
    "Share this with someone who needs it.",
  ],
  Hindi: ["पार्ट 2 के लिए फॉलो करें।", "इसे सेव कर लीजिए।", "कमेंट में बताइए, अगला वीडियो किस पर हो?"],
  Hinglish: ["Part 2 ke liye follow karo.", "Isse save kar lo, kaam aayega.", "Comment karo “more” — next video ready."],
};

const TAGS: Record<Brief["platform"], string> = {
  "Instagram Reel": "#reels #creator #learnoninstagram",
  "YouTube Short": "#shorts #youtubeshorts",
  TikTok: "#fyp #learnontiktok",
};

function pointCount(d: Brief["duration"]) {
  return d <= 15 ? 2 : d <= 30 ? 3 : d <= 45 ? 4 : 5;
}

export function mockHooks(brief: Brief, variant = 0): string[] {
  const s = hash(brief.idea) + variant * 7;
  const pool = HOOKS[brief.language];
  const t = topicOf(brief.idea);
  return [0, 1, 2].map((i) => pick(pool, s, i)(t));
}

export function mockScript(brief: Brief, variant = 0): ContentPackage["script"] {
  const s = hash(brief.idea) + variant * 5;
  const pool = POINTS[brief.language];
  const n = Math.min(pointCount(brief.duration), pool.length);
  const points = Array.from({ length: n }, (_, i) => pick(pool, s, i));
  if (points.length) points[0] = `${points[0]} ${TONE_FLAVOUR[brief.tone]}`;
  return {
    opening: mockHooks(brief, variant)[0],
    points,
    ending: pick(CTA[brief.language], s, 1),
  };
}

export function mockCaption(brief: Brief, variant = 0): string {
  const t = topicOf(brief.idea);
  const lines = [
    `${t} — explained in ${brief.duration} seconds.`,
    `Everything I wish I knew about ${t.toLowerCase()}.`,
    `${t}, the simple version.`,
  ];
  return `${pick(lines, hash(brief.idea), variant)}\n\n${TAGS[brief.platform]}`;
}

export function mockCta(brief: Brief, variant = 0): string {
  return pick(CTA[brief.language], hash(brief.idea), variant);
}

export function mockPackage(brief: Brief): ContentPackage {
  return {
    hooks: mockHooks(brief),
    script: mockScript(brief),
    caption: mockCaption(brief),
    cta: mockCta(brief),
  };
}

export function mockSection<K extends SectionKey>(
  brief: Brief,
  key: K,
  variant: number,
): ContentPackage[K] {
  const map = {
    hooks: () => mockHooks(brief, variant),
    script: () => mockScript(brief, variant),
    caption: () => mockCaption(brief, variant),
    cta: () => mockCta(brief, variant),
  };
  return map[key]() as ContentPackage[K];
}

/** Sample targeted edit: only the targeted section changes, everything else is preserved. */
export function mockEdit(
  brief: Brief,
  content: ContentPackage,
  instruction: string,
): { content: ContentPackage; changed: SectionKey[] } {
  const i = instruction.toLowerCase();
  const next: ContentPackage = structuredClone(content);
  if (i.includes("hinglish") || i.includes("hindi")) {
    const language = i.includes("hinglish") ? "Hinglish" : "Hindi";
    const b = { ...brief, language } as Brief;
    return { content: mockPackage(b), changed: ["hooks", "script", "caption", "cta"] };
  }
  if (i.includes("opening") || i.includes("hook")) {
    next.hooks = mockHooks(brief, 3);
    next.script.opening = next.hooks[0];
    return { content: next, changed: ["hooks", "script"] };
  }
  if (i.includes("short") || /\b(15|30)\b/.test(i)) {
    const n = i.includes("15") ? 2 : 3;
    next.script.points = next.script.points.slice(0, n);
    return { content: next, changed: ["script"] };
  }
  if (i.includes("conversational") || i.includes("casual")) {
    next.script.points = next.script.points.map((p) => `So here's the thing — ${p.charAt(0).toLowerCase()}${p.slice(1)}`);
    return { content: next, changed: ["script"] };
  }
  if (i.includes("caption")) {
    next.caption = mockCaption(brief, 1);
    return { content: next, changed: ["caption"] };
  }
  next.script.ending = mockCta(brief, 2);
  next.cta = next.script.ending;
  return { content: next, changed: ["script", "cta"] };
}
