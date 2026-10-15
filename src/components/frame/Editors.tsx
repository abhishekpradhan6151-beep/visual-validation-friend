import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { ContentPackage } from "@/lib/frame/types";
import { EditorActions, fieldClass, IconButton } from "./SectionCard";

type Done = () => void;

export function ListEditor({ value, label, onSave, done, min = 1 }: { value: string[]; label: string; onSave: (v: string[]) => void; done: Done; min?: number | undefined }) {
  const [items, setItems] = useState(value);
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <textarea
            aria-label={`${label} ${i + 1}`}
            value={it}
            rows={2}
            onChange={(e) => setItems((a) => a.map((x, j) => (j === i ? e.target.value : x)))}
            className={fieldClass}
          />
          <IconButton label={`Remove ${label} ${i + 1}`} disabled={items.length <= min} onClick={() => setItems((a) => a.filter((_, j) => j !== i))}>
            <Minus className="size-4" />
          </IconButton>
        </div>
      ))}
      <button type="button" onClick={() => setItems((a) => [...a, ""])} className="press inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground">
        <Plus className="size-3.5" aria-hidden="true" /> Add {label.toLowerCase()}
      </button>
      <EditorActions onCancel={done} onSave={() => { onSave(items.map((s) => s.trim()).filter(Boolean)); done(); }} />
    </div>
  );
}

export function ScriptEditor({ value, onSave, done }: { value: ContentPackage["script"]; onSave: (v: ContentPackage["script"]) => void; done: Done }) {
  const [opening, setOpening] = useState(value.opening);
  const [points, setPoints] = useState(value.points.join("\n"));
  const [ending, setEnding] = useState(value.ending);
  return (
    <div className="space-y-3">
      <label className="block space-y-1.5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Opening</span>
        <textarea rows={2} value={opening} onChange={(e) => setOpening(e.target.value)} className={fieldClass} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Main points · one per line</span>
        <textarea rows={5} value={points} onChange={(e) => setPoints(e.target.value)} className={fieldClass} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Ending</span>
        <textarea rows={2} value={ending} onChange={(e) => setEnding(e.target.value)} className={fieldClass} />
      </label>
      <EditorActions
        onCancel={done}
        onSave={() => {
          onSave({ opening: opening.trim(), points: points.split("\n").map((s) => s.trim()).filter(Boolean), ending: ending.trim() });
          done();
        }}
      />
    </div>
  );
}

export function TextEditor({ value, label, rows = 4, onSave, done }: { value: string; label: string; rows?: number | undefined; onSave: (v: string) => void; done: Done }) {
  const [v, setV] = useState(value);
  return (
    <div>
      <textarea aria-label={label} rows={rows} value={v} onChange={(e) => setV(e.target.value)} className={fieldClass} />
      <EditorActions onCancel={done} onSave={() => { onSave(v.trim()); done(); }} />
    </div>
  );
}
