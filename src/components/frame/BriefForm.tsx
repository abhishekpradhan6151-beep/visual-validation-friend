import { useEffect, useId, useState } from "react";
import { ArrowRight, Loader2, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChipGroup } from "./ChipGroup";
import { DURATIONS, IDEA_MAX, LANGUAGES, PLATFORMS, TONES, validateIdea, type Brief } from "@/lib/frame/types";
import { getSettings } from "@/lib/frame/storage";

interface Props {
  initial?: Brief | undefined;
  submitLabel?: string | undefined;
  busy?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onSubmit: (b: Brief) => void;
}

export function BriefForm({ initial, submitLabel = "Generate content", busy, defaultOpen, onSubmit }: Props) {
  const [brief, setBrief] = useState<Brief>(
    initial ?? { idea: "", platform: "Instagram Reel", language: "English", tone: "Conversational", duration: 30 },
  );
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(!!defaultOpen);
  const ideaId = useId();

  useEffect(() => {
    if (!initial) setBrief((b) => ({ ...b, ...getSettings() }));
  }, [initial]);

  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => setBrief((b) => ({ ...b, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateIdea(brief.idea);
    setError(err);
    if (!err) onSubmit({ ...brief, idea: brief.idea.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="flex w-full flex-col gap-4">
      <div className={cn("rounded-3xl surface p-2 transition-colors focus-within:border-input", error && "border-destructive/60")}>
        <label htmlFor={ideaId} className="sr-only">
          Video idea
        </label>
        <textarea
          id={ideaId}
          value={brief.idea}
          onChange={(e) => {
            set("idea", e.target.value);
            if (error) setError(validateIdea(e.target.value));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
          }}
          maxLength={IDEA_MAX + 50}
          rows={3}
          placeholder="What do you want to create a video about?"
          aria-invalid={!!error}
          aria-describedby={`${ideaId}-hint`}
          className="block w-full resize-none bg-transparent px-4 pt-3 text-[17px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        <div className="flex items-center justify-between gap-2 px-2 pb-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            <span className="sm:hidden">Options</span>
            <span className="hidden sm:inline">
              {brief.platform} · {brief.language} · {brief.tone} · {brief.duration}s
            </span>
          </button>
          <button
            type="submit"
            disabled={busy}
            className="press inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {submitLabel}
            {!busy && <ArrowRight className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <p id={`${ideaId}-hint`} role={error ? "alert" : undefined} className={cn("px-4 text-[13px]", error ? "text-destructive" : "sr-only")}>
        {error ?? `Up to ${IDEA_MAX} characters.`}
      </p>

      {open && (
        <div className="rise grid gap-5 rounded-2xl border border-border/70 p-5 sm:grid-cols-2">
          <ChipGroup label="Platform" options={PLATFORMS} value={brief.platform} onChange={(v) => set("platform", v)} />
          <ChipGroup label="Language" options={LANGUAGES} value={brief.language} onChange={(v) => set("language", v)} />
          <ChipGroup label="Tone" options={TONES} value={brief.tone} onChange={(v) => set("tone", v)} />
          <ChipGroup label="Duration" options={DURATIONS} value={brief.duration} onChange={(v) => set("duration", v)} format={(d) => `${d}s`} />
        </div>
      )}
    </form>
  );
}
