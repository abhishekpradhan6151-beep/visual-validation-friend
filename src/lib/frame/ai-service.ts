/**
 * FRAME AI service interface.
 * UI components talk ONLY to this module. Phase 1 uses the deterministic mock
 * provider. Phase 2 swaps `provider` for one that calls a server function
 * (see docs/ai-integration.md) — never a provider API directly from the browser.
 */
import { mockEdit, mockPackage, mockSection } from "./mock-generator";
import type { Brief, ContentPackage, SectionKey } from "./types";
import { INSTRUCTION_MAX, validateIdea } from "./types";

export interface AIProvider {
  readonly kind: "mock" | "ai";
  generate(brief: Brief): Promise<ContentPackage>;
  regenerateSection<K extends SectionKey>(brief: Brief, content: ContentPackage, key: K, variant: number): Promise<ContentPackage[K]>;
  edit(brief: Brief, content: ContentPackage, instruction: string): Promise<{ content: ContentPackage; changed: SectionKey[] }>;
}

export class AIServiceError extends Error {
  constructor(message: string, public code: "invalid_input" | "rate_limited" | "timeout" | "provider" = "provider") {
    super(message);
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockProvider: AIProvider = {
  kind: "mock",
  async generate(brief) {
    await delay(1100);
    return mockPackage(brief);
  },
  async regenerateSection(brief, _content, key, variant) {
    await delay(650);
    return mockSection(brief, key, variant);
  },
  async edit(brief, content, instruction) {
    await delay(900);
    return mockEdit(brief, content, instruction);
  },
};

let provider: AIProvider = mockProvider;
export const getProviderKind = () => provider.kind;

export async function generatePackage(brief: Brief) {
  const err = validateIdea(brief.idea);
  if (err) throw new AIServiceError(err, "invalid_input");
  return provider.generate({ ...brief, idea: brief.idea.trim() });
}

export function regenerateSection<K extends SectionKey>(brief: Brief, content: ContentPackage, key: K, variant: number) {
  return provider.regenerateSection(brief, content, key, variant);
}

export async function editPackage(brief: Brief, content: ContentPackage, instruction: string) {
  const t = instruction.trim();
  if (!t) throw new AIServiceError("Tell FRAME what to change.", "invalid_input");
  if (t.length > INSTRUCTION_MAX) throw new AIServiceError(`Keep instructions under ${INSTRUCTION_MAX} characters.`, "invalid_input");
  return provider.edit(brief, content, t);
}
