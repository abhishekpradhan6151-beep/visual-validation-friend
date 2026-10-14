import { cn } from "@/lib/utils";

export function ApertureMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-6", className)} fill="none">
      <circle cx="16" cy="16" r="14.25" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <path
          key={r}
          d="M16 1.75 L21.5 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${r} 16 16)`}
          opacity="0.75"
        />
      ))}
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      <ApertureMark />
      <span className="text-[15px] font-semibold tracking-[0.28em]">FRAME</span>
    </span>
  );
}
