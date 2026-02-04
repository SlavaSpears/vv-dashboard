"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLocalSettings, Settings, DEFAULT_SETTINGS } from "@/lib/settings";
import { parseCommand } from "@/lib/parser";
import { addCapture, addNextAction, createTask } from "@/app/actions/tasks";
import { createEvent } from "@/app/actions/events";

type Line =
  | { kind: "user"; text: string }
  | { kind: "ok"; text: string }
  | { kind: "err"; text: string };

export default function AITerminal() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [lines, setLines] = useState<Line[]>([
    {
      kind: "ok",
      text: "VV Terminal ready. Use 'add backlog:', 'add next:', etc. for offline control.",
    },
  ]);

  useEffect(() => {
    setSettings(getLocalSettings());
  }, []);

  const suggestions = useMemo(
    () => [
      "add backlog: buy milk",
      "add next: ship build",
      "add task: review project",
      "add event: team sync",
    ],
    []
  );

  async function run(text: string) {
    const t = text.trim();
    if (!t || busy) return;

    setBusy(true);
    setLines((p) => [...p, { kind: "user", text: t }]);
    setInput("");

    // 1. Check Offline Commands
    const parsed = parseCommand(t);
    if (parsed) {
      try {
        if (parsed.type === 'BACKLOG') {
          const fd = new FormData();
          fd.append('title', parsed.payload);
          await addCapture(fd);
          setLines(p => [...p, { kind: 'ok', text: `Captured to Backlog: ${parsed.payload}` }]);
        } else if (parsed.type === 'NEXT') {
          const fd = new FormData();
          fd.append('title', parsed.payload);
          await addNextAction(fd);
          setLines(p => [...p, { kind: 'ok', text: `Added to Next Actions: ${parsed.payload}` }]);
        } else if (parsed.type === 'TASK') {
          await createTask(parsed.payload, "PLANNED");
          setLines(p => [...p, { kind: 'ok', text: `Planned task: ${parsed.payload}` }]);
        } else if (parsed.type === 'EVENT') {
          await createEvent({
            title: parsed.payload,
            startAt: new Date(),
            endAt: new Date(Date.now() + 3600000), // 1 hour later
          });
          setLines(p => [...p, { kind: 'ok', text: `Event created: ${parsed.payload}` }]);
        }
        router.refresh();
      } catch (e: any) {
        setLines(p => [...p, { kind: 'err', text: e?.message || "Local execution failed." }]);
      } finally {
        setBusy(false);
      }
      return;
    }

    // 2. Check AI Mode
    if (settings.ai.mode === 'OFF') {
      setLines(p => [...p, { kind: 'err', text: "AI disabled in Settings." }]);
      setBusy(false);
      return;
    }

    // 3. AI Chat
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: t,
          mode: settings.ai.mode,
          apiKey: settings.ai.apiKey
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setLines((p) => [
          ...p,
          { kind: "err", text: data?.message ?? "AI response failed." },
        ]);
      } else {
        setLines((p) => [...p, { kind: "ok", text: data.message }]);
        router.refresh();
      }
    } catch (e: any) {
      setLines((p) => [
        ...p,
        { kind: "err", text: e?.message ?? "Network error" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-md shadow-sm vv-watermark-soft">
      <div className="px-5 py-4 border-b border-black/5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">
              COMMAND INTERFACE
            </div>
            <div className="text-[26px] font-serif tracking-tight text-black mt-1">
              AI Terminal
            </div>
          </div>
          <div className={`mt-1 px-2.5 py-0.5 rounded border text-[9px] font-bold tracking-widest uppercase transition-colors ${
            settings.ai.mode === 'OFF' ? 'border-black/10 text-black/30' :
            settings.ai.mode === 'DEMO' ? 'border-amber-200/50 text-amber-600/70 bg-amber-50/30' :
            'border-emerald-200/50 text-emerald-600/70 bg-emerald-50/30'
          }`}>
            AI: {settings.ai.mode}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => run(s)}
              className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[11px] text-black/60 hover:bg-white transition-colors"
              disabled={busy}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-xl bg-black/[0.03] border border-black/5 p-4 h-48 overflow-auto">
          <div className="space-y-3 text-[12px] font-mono leading-relaxed">
            {lines.map((l, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-4 shrink-0 font-bold opacity-30">
                  {l.kind === "user" ? ">" : l.kind === "ok" ? "•" : "!"}
                </div>
                <div
                  className={
                    l.kind === "user"
                      ? "text-black/80 font-sans font-medium"
                      : l.kind === "ok"
                      ? "text-black/60"
                      : "text-red-700/80"
                  }
                >
                  {l.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-4 shrink-0 font-bold opacity-30">…</div>
                <div className="text-black/30">Analyzing signal...</div>
              </div>
            )}
          </div>
        </div>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='System input...'
            className="w-full rounded-xl border border-black/10 bg-white/90 px-5 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-black text-white px-6 py-2.5 text-[13px] font-medium hover:bg-black/90 disabled:opacity-40 transition-opacity"
          >
            Run
          </button>
        </form>
      </div>
    </div>
  );
}
