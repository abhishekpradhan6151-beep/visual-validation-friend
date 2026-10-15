import { useRef } from "react";
import { cn } from "@/lib/utils";

interface Props<T extends string | number> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}

/** Accessible single-select (radiogroup with roving focus + arrow keys). */
export function ChipGroup<T extends string | number>({ label, options, value, onChange, format }: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + options.length) % options.length;
    onChange(options[n]!);
    refs.current[n]?.focus();
  };
  return (
    <div className="flex flex-col gap-2">
      <span id={`lbl-${label}`} className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={`lbl-${label}`} className="flex flex-wrap gap-1.5">
        {options.map((o, i) => {
          const active = o === value;
          return (
            <button
              key={String(o)}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(o)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "press rounded-full border px-3 py-1.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-secondary/60 text-muted-foreground hover:border-input hover:text-foreground",
              )}
            >
              {format ? format(o) : o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
