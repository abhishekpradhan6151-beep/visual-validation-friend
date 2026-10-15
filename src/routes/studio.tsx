import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowUp, Bookmark, BookmarkCheck, Copy, Loader2, PenLine, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BriefForm } from "@/components/frame/BriefForm";
import { ListEditor, ScriptEditor, TextEditor } from "@/components/frame/Editors";
import { SampleBadge } from "@/components/frame/SampleBadge";
import { SectionCard } from "@/components/frame/SectionCard";
import { editPackage, generatePackage, regenerateSection } from "@/lib/frame/ai-service";
import { copyText, packageText, sectionText } from "@/lib/frame/format";
import { getCreation, getDraft, saveCreation, setDraft, type Draft } from "@/lib/frame/storage";
import { INSTRUCTION_MAX, type Brief, type ContentPackage, type SectionKey } from "@/lib/frame/types";

export const Route = createFileRoute("/studio")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s["id"] === "string" ? s["id"] : "" }),
  head: () => ({
    meta: [
      { title: "Creation Studio — FRAME" },
      { name: "description", content: "Edit, refine and copy your hooks, script, caption and call to action." },
      { property: "og:title", content: "Creation Studio — FRAME" },
      { property: "og:description", content: "Refine your short-form video package." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Studio,
});

const SUGGESTIONS = [
  "Make this more conversational.",
  "Rewrite this in Hinglish.",
  "Give me a stronger opening.",
  "Shorten the script to 30 seconds.",
];

type Status = "loading" | "ready" | "error" | "missing";

function Studio() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [item, setItem] = useState<Draft | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<Partial<Record<SectionKey, boolean>>>({});
  const [changed, setChanged] = useState<SectionKey[]>([]);
  const [briefOpen, setBriefOpen] = useState(false);
  const variant = useRef(1);

  const generate = useCallback(async (d: Draft) => {
    setStatus("loading");
    setError("");
    try {
      const content = await generatePackage(d.brief);
      const next = { ...d, content, updatedAt: Date.now() };
      setItem(next);
      setDraft(next);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const savedItem = id ? getCreation(id) : null;
    if (savedItem) {
      setItem(savedItem);
      setSaved(true);
      setStatus("ready");
      return;
    }
    const d = getDraft();
    if (!d || d.id !== id) {
      setStatus("missing");
      return;
    }
    setItem(d);
    if (d.content) setStatus("ready");
    else void generate(d);
  }, [id, generate]);

  const update = (content: ContentPackage, keys: SectionKey[]) => {
    if (!item) return;
    const next = { ...item, content, updatedAt: Date.now() };
    setItem(next);
    setDraft(next);
    setSaved(false);
    setChanged(keys);
    setTimeout(() => setChanged([]), 2000);
  };

  const patch = <K extends SectionKey>(key: K, value: ContentPackage[K]) => {
    if (!item?.content) return;
    update({ ...item.content, [key]: value }, [key]);
  };

  const regen = async (key: SectionKey) => {
    if (!item?.content) return;
    setBusy((b) => ({ ...b, [key]: true }));
    try {
      const v = await regenerateSection(item.brief, item.content, key, variant.current++);
      patch(key, v);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't regenerate");
    } finally {
      setBusy((b) => ({ ...b, [key]: false }));
    }
  };

  const save = () => {
    if (!item?.content) return;
    saveCreation({ ...item, content: item.content });
    setSaved(true);
    toast.success("Saved to My Creations");
  };

  const copyAll = async () => {
    if (!item?.content) return;
    try {
      await copyText(packageText(item.content));
      toast.success("Full package copied");
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  };

  const applyBrief = (brief: Brief) => {
    if (!item) return;
    setBriefOpen(false);
    const next = { ...item, brief };
    setItem(next);
    setSaved(false);
    void generate(next);
  };

  if (status === "missing") {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="text-xl font-semibold">This creation isn't here</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been deleted, or it was never saved on this device.</p>
        <Link to="/" className="press mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Start a new video
        </Link>
      </div>
    );
  }

  const c = item?.content;
  const ready = status === "ready" && c;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="press inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Home
        </button>
        <div className="flex items-center gap-1.5">
          <ToolbarButton onClick={() => setBriefOpen(true)} disabled={!item || status === "loading"} icon={<PenLine className="size-4" />}>
            Edit brief
          </ToolbarButton>
          <ToolbarButton onClick={copyAll} disabled={!ready} icon={<Copy className="size-4" />}>
            Copy all
          </ToolbarButton>
          <button
            type="button"
            onClick={save}
            disabled={!ready || saved}
            className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {saved ? <BookmarkCheck className="size-4" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Brief summary */}
      {item && (
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SampleBadge />
            <span className="text-[13px] text-muted-foreground">
              {item.brief.platform} · {item.brief.language} · {item.brief.tone} · {item.brief.duration}s
            </span>
          </div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{item.brief.idea}</h1>
        </div>
      )}

      {status === "loading" && <LoadingState />}

      {status === "error" && (
        <div role="alert" className="rounded-2xl surface p-8 text-center">
          <AlertCircle className="mx-auto size-6 text-destructive" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">Generation didn't finish</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => item && generate(item)}
            className="press mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Try again
          </button>
        </div>
      )}

      {ready && item && (
        <div className="space-y-4">
          <SectionCard
            index={1}
            title="Hooks"
            copy={sectionText(c, "hooks")}
            busy={busy.hooks}
            highlight={changed.includes("hooks")}
            onRegenerate={() => regen("hooks")}
            renderEditor={(done) => <ListEditor label="Hook" value={c.hooks} onSave={(v) => patch("hooks", v)} done={done} />}
          >
            <ol className="space-y-3">
              {c.hooks.map((h, i) => (
                <li key={i} className="flex gap-3 text-[16px] leading-relaxed">
                  <span className="mt-0.5 font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                  <span>{h}</span>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard
            index={2}
            title="Script"
            copy={sectionText(c, "script")}
            busy={busy.script}
            highlight={changed.includes("script")}
            onRegenerate={() => regen("script")}
            renderEditor={(done) => <ScriptEditor value={c.script} onSave={(v) => patch("script", v)} done={done} />}
          >
            <div className="space-y-5 text-[15px] leading-relaxed">
              <ScriptPart label="Opening">{c.script.opening}</ScriptPart>
              <ScriptPart label="Main points">
                <ol className="space-y-2">
                  {c.script.points.map((p, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-mono text-xs leading-6 text-muted-foreground">{i + 1}</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ol>
              </ScriptPart>
              <ScriptPart label="Ending">{c.script.ending}</ScriptPart>
            </div>
          </SectionCard>

          <SectionCard
            index={3}
            title="Caption"
            copy={c.caption}
            busy={busy.caption}
            highlight={changed.includes("caption")}
            onRegenerate={() => regen("caption")}
            renderEditor={(done) => <TextEditor label="Caption" value={c.caption} onSave={(v) => patch("caption", v)} done={done} />}
          >
            <p className="whitespace-pre-line text-[15px] leading-relaxed">{c.caption}</p>
          </SectionCard>

          <SectionCard
            index={4}
            title="Call to Action"
            copy={c.cta}
            busy={busy.cta}
            highlight={changed.includes("cta")}
            onRegenerate={() => regen("cta")}
            renderEditor={(done) => <TextEditor label="Call to action" rows={2} value={c.cta} onSave={(v) => patch("cta", v)} done={done} />}
          >
            <p className="text-[16px] leading-relaxed">{c.cta}</p>
          </SectionCard>

          <Composer brief={item.brief} content={c} onApply={update} />
        </div>
      )}

      <Dialog open={briefOpen} onOpenChange={setBriefOpen}>
        <DialogContent className="max-w-2xl border-glass-border bg-popover">
          <DialogHeader>
            <DialogTitle>Edit brief</DialogTitle>
            <DialogDescription>Changing the brief creates a fresh package. Unsaved edits will be replaced.</DialogDescription>
          </DialogHeader>
          {item && <BriefForm initial={item.brief} defaultOpen submitLabel="Regenerate" onSubmit={applyBrief} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToolbarButton({ onClick, disabled, icon, children }: { onClick: () => void; disabled?: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="press inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
    >
      <span aria-hidden="true">{icon}</span>
      <span className="hidden sm:inline">{children}</span>
      <span className="sr-only sm:hidden">{children}</span>
    </button>
  );
}

function ScriptPart({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[7rem_1fr] sm:gap-4">
      <span className="text-[11px] font-medium uppercase leading-6 tracking-[0.14em] text-muted-foreground">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4" aria-live="polite" aria-label="Generating your package">
      {["Hooks", "Script", "Caption", "Call to Action"].map((t, i) => (
        <div key={t} className="rounded-2xl surface p-6" style={{ opacity: 1 - i * 0.15 }}>
          <Skeleton className="mb-5 h-4 w-24 bg-muted" />
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-11/12 bg-muted" />
            <Skeleton className="h-4 w-8/12 bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Composer({ brief, content, onApply }: { brief: Brief; content: ContentPackage; onApply: (c: ContentPackage, k: SectionKey[]) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const run = async (instruction: string) => {
    setErr("");
    setBusy(true);
    try {
      const res = await editPackage(brief, content, instruction);
      onApply(res.content, res.changed);
      setText("");
      const names: Record<SectionKey, string> = { hooks: "Hooks", script: "Script", caption: "Caption", cta: "Call to Action" };
      toast.success(`Updated: ${res.changed.map((k) => names[k]).join(", ")}`, { description: "Everything else was kept as is." });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't apply that edit.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sticky bottom-24 z-30 pt-4 md:bottom-6">
      <div className="rounded-3xl glass bg-popover/90 p-2">
        <div className="flex gap-1.5 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none]">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy}
              onClick={() => run(s)}
              className="press shrink-0 rounded-full border border-border bg-secondary/50 px-3 py-1 text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(text);
          }}
          className="flex items-center gap-2"
        >
          <Sparkles className="ml-3 size-4 shrink-0 text-silver" aria-hidden="true" />
          <label htmlFor="composer" className="sr-only">
            Describe a targeted edit
          </label>
          <input
            id="composer"
            value={text}
            maxLength={INSTRUCTION_MAX}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask for a targeted change…"
            className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-muted-foreground/70"
          />
          <button
            type="submit"
            aria-label="Apply edit"
            disabled={busy || !text.trim()}
            className="press inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </button>
        </form>
        {err && (
          <p role="alert" className="px-3 pb-1 pt-1 text-[13px] text-destructive">
            {err}
          </p>
        )}
      </div>
    </div>
  );
}
