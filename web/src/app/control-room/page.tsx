export const runtime = "nodejs";

import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  addCapture,
  updateNextActionStatus
} from "@/app/actions/tasks";

export default async function ControlRoomPage() {
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Fetch counts & lists
  const [backlogCount, nextActionsCount, upcomingEventsCount, topNextActions] = await Promise.all([
    prisma.capture.count(),
    prisma.nextAction.count({ where: { done: false } }),
    prisma.event.count({
      where: {
        startAt: {
          gte: now,
          lte: next7Days,
        },
      },
    }),
    prisma.nextAction.findMany({
      where: { done: false },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-12 pb-20">
      <header className="mb-12">
        <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">Command Center</div>
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl text-black">Control Room</h1>
        <p className="mt-2 text-black/50 italic">Dashboard overview. Status: Operational.</p>
      </header>

      {/* TOP: Stats Indicators */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Backlog"
          value={backlogCount.toString()}
          subtitle="Items in queue"
        />
        <StatCard
          label="Next Actions"
          value={`${nextActionsCount}/10`}
          subtitle="Capacity utilized"
          alert={nextActionsCount >= 10}
        />
        <StatCard
          label="Upcoming"
          value={upcomingEventsCount.toString()}
          subtitle="Events (7 days)"
        />
      </section>

      {/* MAIN: Left (Top Next Actions) & Right (Quick Capture) */}
      <section className="grid gap-8 lg:grid-cols-2">
        {/* Left: Top Next Actions */}
        <div className="vv-card p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/40">Top Next Actions</h3>
              <Link href="/next-actions" className="text-[10px] uppercase font-bold text-black/30 hover:text-black transition-colors">View All</Link>
           </div>

           <div className="space-y-4">
              {topNextActions.length === 0 ? (
                <div className="py-10 text-center text-sm text-black/30 italic">No active actions.</div>
              ) : (
                topNextActions.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-black/5 bg-black/[0.01] hover:bg-black/[0.03] transition-colors">
                    <span className="text-base text-black/80">{a.title}</span>
                    <form action={async () => { "use server"; await updateNextActionStatus(a.id, "DONE"); }}>
                      <button className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 hover:text-emerald-600 px-3 py-1 border border-emerald-600/20 rounded-lg bg-emerald-50/30">
                        Complete
                      </button>
                    </form>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Right: Quick Capture */}
        <div className="vv-card p-8 bg-black/[0.02] border-0">
           <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-8">Quick Capture</h3>
           <form action={addCapture} className="space-y-4">
              <input
                name="title"
                required
                placeholder="Capture a thought to backlog..."
                className="w-full rounded-xl border border-black/10 bg-white px-5 py-4 text-base outline-none focus:ring-2 focus:ring-black/10"
              />
              <div className="flex justify-end">
                <button className="vv-btn px-10 py-4">Capture</button>
              </div>
           </form>
           <p className="mt-6 text-[11px] text-black/30 italic text-center">
             Items are automatically routed to the Backlog for triage.
           </p>
        </div>
      </section>

      {/* BOTTOM: Mini AI Terminal */}
      <section className="vv-card p-8 border-t-2 border-black/5">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/60">AI Terminal (Mini)</h3>
          <Link href="/ai-terminal" className="text-[10px] uppercase font-bold text-black/30 hover:text-black transition-colors">Open Full Interface</Link>
        </div>

        <form action="#" className="relative">
           <input
             disabled
             placeholder="Mini terminal input disabled in this preview. Use Full Terminal for interactions."
             className="w-full rounded-xl border border-black/10 bg-white/50 px-5 py-4 text-sm italic text-black/40 cursor-not-allowed"
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-black/20 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-black/20">Standby</span>
           </div>
        </form>
      </section>
    </div>
  );
}

function StatCard({ label, value, subtitle, alert }: { label: string; value: string; subtitle: string; alert?: boolean }) {
  return (
    <div className={`vv-card p-8 border border-black/5 ${alert ? 'bg-red-50/30 border-red-100' : 'bg-white/40'}`}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">{label}</div>
      <div className={`text-4xl font-serif ${alert ? 'text-red-700' : 'text-black'}`}>{value}</div>
      <div className="text-xs text-black/30 mt-1">{subtitle}</div>
    </div>
  );
}
