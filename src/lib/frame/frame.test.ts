import { describe, expect, it } from "vitest";
import { validateIdea } from "./types";
import { mockEdit, mockPackage } from "./mock-generator";

const brief = { idea: "Morning routines for students", platform: "TikTok", language: "English", tone: "Funny", duration: 30 } as const;

describe("frame rules", () => {
  it("rejects ideas shorter than 8 characters", () => expect(validateIdea("short")).not.toBeNull());
  it("rejects ideas over 500 characters", () => expect(validateIdea("a".repeat(501))).not.toBeNull());
  it("accepts a normal idea", () => expect(validateIdea(brief.idea)).toBeNull());
  it("returns three hooks", () => expect(mockPackage({ ...brief }).hooks).toHaveLength(3));
  it("stronger-opening edit preserves caption and CTA", () => {
    const c = mockPackage({ ...brief });
    const r = mockEdit({ ...brief }, c, "Give me a stronger opening.");
    expect(r.content.caption).toBe(c.caption);
    expect(r.content.cta).toBe(c.cta);
  });
});
