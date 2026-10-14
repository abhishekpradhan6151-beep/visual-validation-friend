import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ApertureMark } from "@/components/frame/Logo";
import { BriefForm } from "@/components/frame/BriefForm";
import { listCreations, newId, setDraft } from "@/lib/frame/storage";
import type { Brief } from "@/lib/frame/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FRAME — Your next video starts here" },
      { name: "description", content: "Turn an idea into hooks, a script, a caption and a call to action for Reels, Shorts and TikTok." },
      { property: "og:title", content: "FRAME — Your next video starts here" },
      { property: "og:description", content: "Turn an idea into content worth watching." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState(0);
  useEffect(() => setRecent(listCreations().length), []);

  const start = (brief: Brief) => {
    const id = newId();
    const now = Date.now();
    setDraft({ id, brief, content: null, source: "mock", createdAt: now, updatedAt: now });
    navigate({ to: "/studio", search: { id } });
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">
      <div className="rise mb-8 inline-flex size-14 items-center justify-center rounded-2xl glass text-silver">
        <ApertureMark className="size-7" />
      </div>
      <h1 className="rise text-balance text-4xl font-semibold tracking-tight sm:text-5xl" style={{ animationDelay: "60ms" }}>
        Your next video starts here.
      </h1>
      <p className="rise mt-4 text-[17px] text-muted-foreground" style={{ animationDelay: "120ms" }}>
        Turn an idea into content worth watching.
      </p>
      <div className="rise mt-10 w-full text-left" style={{ animationDelay: "180ms" }}>
        <BriefForm onSubmit={start} />
      </div>
      <Link
        to="/creations"
        className="press mt-8 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
      >
        {recent ? `Recent creations (${recent})` : "Recent creations"}
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
