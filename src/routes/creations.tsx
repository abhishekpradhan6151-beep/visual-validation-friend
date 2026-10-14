import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCreation, listCreations } from "@/lib/frame/storage";
import type { Creation } from "@/lib/frame/types";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/creations")({
  head: () => ({
    meta: [
      { title: "My Creations — FRAME" },
      { name: "description", content: "Reopen and continue your saved short-form video packages." },
      { property: "og:title", content: "My Creations — FRAME" },
      { property: "og:description", content: "Your saved FRAME video packages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Creations,
});

const fmt = (t: number) => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(t);

function Creations() {
  const [items, setItems] = useState<Creation[] | null>(null);
  useEffect(() => setItems(listCreations()), []);

  const remove = (c: Creation) => {
    deleteCreation(c.id);
    setItems(listCreations());
    toast("Creation deleted");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">My Creations</h1>
      <p className="mt-2 text-sm text-muted-foreground">Saved on this device only.</p>

      <div className="mt-8">
        {items === null ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <FolderOpen className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-3 font-medium">Nothing saved yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Generate a package and tap Save to keep it here.</p>
            <Link to="/" className="press mt-5 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Create your first video
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((c) => (
              <li key={c.id} className="rise group flex items-center gap-2 rounded-2xl surface p-1.5 transition-colors hover:border-input">
                <Link to="/studio" search={{ id: c.id }} className="press min-w-0 flex-1 rounded-xl px-4 py-3">
                  <p className="truncate text-[15px] font-medium">{c.brief.idea}</p>
                  <p className="mt-1 truncate text-[12px] text-muted-foreground">
                    {c.brief.platform} · {c.brief.language} · {c.brief.duration}s · {fmt(c.updatedAt)}
                  </p>
                </Link>
                <button
                  type="button"
                  aria-label={`Delete “${c.brief.idea}”`}
                  onClick={() => remove(c)}
                  className="press mr-2 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
