import type { ContentPackage, SectionKey } from "./types";

export function sectionText(content: ContentPackage, key: SectionKey): string {
  switch (key) {
    case "hooks":
      return content.hooks.map((h, i) => `${i + 1}. ${h}`).join("\n");
    case "script":
      return [
        `OPENING\n${content.script.opening}`,
        `MAIN POINTS\n${content.script.points.map((p, i) => `${i + 1}. ${p}`).join("\n")}`,
        `ENDING\n${content.script.ending}`,
      ].join("\n\n");
    case "caption":
      return content.caption;
    case "cta":
      return content.cta;
  }
}

export function packageText(content: ContentPackage) {
  return [
    `HOOKS\n${sectionText(content, "hooks")}`,
    `SCRIPT\n${sectionText(content, "script")}`,
    `CAPTION\n${content.caption}`,
    `CALL TO ACTION\n${content.cta}`,
  ].join("\n\n———\n\n");
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
