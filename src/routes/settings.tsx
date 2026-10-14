import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChipGroup } from "@/components/frame/ChipGroup";
import { Switch } from "@/components/ui/switch";
import { DURATIONS, LANGUAGES, PLATFORMS, TONES } from "@/lib/frame/types";
import {
  clearCreations,
  DEFAULT_SETTINGS,
  getSettings,
  getSimulateErrors,
  saveSettings,
  setSimulateErrors,
  type Settings as S,
} from "@/lib/frame/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FRAME" },
      { name: "description", content: "Set default platform, language, tone and duration for new FRAME videos." },
      { property: "og:title", content: "Settings — FRAME" },
      { property: "og:description", content: "FRAME defaults and preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [s, setS] = useState<S>(DEFAULT_SETTINGS);
  const [sim, setSim] = useState(false);
  useEffect(() => {
    setS(getSettings());
    setSim(getSimulateErrors());
  }, []);

  const set = <K extends keyof S>(k: K, v: S[K]) => {
    const next = { ...s, [k]: v };
    setS(next);
    saveSettings(next);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>

      <Group title="Defaults for new videos" desc="Saved automatically.">
        <div className="grid gap-6 sm:grid-cols-2">
          <ChipGroup label="Platform" options={PLATFORMS} value={s.platform} onChange={(v) => set("platform", v)} />
          <ChipGroup label="Language" options={LANGUAGES} value={s.language} onChange={(v) => set("language", v)} />
          <ChipGroup label="Tone" options={TONES} value={s.tone} onChange={(v) => set("tone", v)} />
          <ChipGroup label="Duration" options={DURATIONS} value={s.duration} onChange={(v) => set("duration", v)} format={(d) => `${d}s`} />
        </div>
      </Group>

      <Group title="Content generation" desc="FRAME currently uses a built-in sample generator. No AI service is connected, and nothing leaves your device.">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-medium">Simulate errors</span>
            <span className="block text-[13px] text-muted-foreground">Testing aid — makes generation fail so you can see the error state.</span>
          </span>
          <Switch
            checked={sim}
            onCheckedChange={(v) => {
              setSim(v);
              setSimulateErrors(v);
            }}
          />
        </label>
      </Group>

      <Group title="Data" desc="Creations are stored in this browser only.">
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Delete all saved creations on this device?")) {
              clearCreations();
              toast("All creations deleted");
            }
          }}
          className="press rounded-full border border-border px-4 py-2 text-sm text-destructive hover:bg-accent"
        >
          Delete all creations
        </button>
      </Group>
    </div>
  );
}

function Group({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-2xl surface p-6">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <p className="mb-5 mt-1 text-[13px] text-muted-foreground">{desc}</p>
      {children}
    </section>
  );
}
