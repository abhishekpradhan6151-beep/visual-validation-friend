import { useState, type ReactNode } from "react";
import { Check, Copy, Pencil, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/frame/format";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  index: number;
  title: string;
  copy: string;
  busy?: boolean | undefined;
  highlight?: boolean | undefined;
  children: ReactNode;
  renderEditor: (done: () => void) => ReactNode;
  onRegenerate: () => void;
}

export function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean | undefined; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="press inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function SectionCard({ index, title, copy, busy, highlight, children, renderEditor, onRegenerate }: Props) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const doCopy = async () => {
    try {
      await copyText(copy);
      setCopied(true);
      toast.success(`${title} copied`);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  };

  return (
    <section
      aria-labelledby={`sec-${index}`}
      aria-busy={busy}
      className={cn("rise rounded-2xl surface p-5 transition-colors sm:p-6", highlight && "border-silver/40")}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 id={`sec-${index}`} className="flex items-baseline gap-3 text-[15px] font-semibold">
          <span className="font-mono text-[11px] text-muted-foreground">0{index}</span>
          {title}
        </h2>
        <div className="flex items-center gap-0.5">
          {editing ? (
            <IconButton label={`Close ${title} editor`} onClick={() => setEditing(false)}>
              <X className="size-4" />
            </IconButton>
          ) : (
            <>
              <IconButton label={`Edit ${title}`} onClick={() => setEditing(true)} disabled={busy}>
                <Pencil className="size-4" />
              </IconButton>
              <IconButton label={`Copy ${title}`} onClick={doCopy} disabled={busy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </IconButton>
              <IconButton label={`Regenerate ${title}`} onClick={onRegenerate} disabled={busy}>
                <RefreshCw className={cn("size-4", busy && "animate-spin")} />
              </IconButton>
            </>
          )}
        </div>
      </header>
      {busy ? (
        <div className="space-y-2.5" aria-label={`Regenerating ${title}`}>
          <Skeleton className="h-4 w-11/12 bg-muted" />
          <Skeleton className="h-4 w-9/12 bg-muted" />
          <Skeleton className="h-4 w-10/12 bg-muted" />
        </div>
      ) : editing ? (
        renderEditor(() => setEditing(false))
      ) : (
        children
      )}
    </section>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-[15px] leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function EditorActions({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="press rounded-full px-4 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
        Cancel
      </button>
      <button type="button" onClick={onSave} className="press rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
        Apply
      </button>
    </div>
  );
}
