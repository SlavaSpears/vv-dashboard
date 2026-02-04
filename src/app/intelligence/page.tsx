import { prisma } from "@/lib/db";
import { 
  saveDailyBrief, 
  addSignal, 
  deleteSignal, 
  addDossier, 
  deleteDossier 
} from "@/app/actions/intelligence";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function IntelligencePage() {
  const brief = await prisma.dailyBrief.findFirst();
  const signals = await prisma.signal.findMany({
    orderBy: { createdAt: "desc" },
  });
  const dossiers = await prisma.dossier.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-12 pb-20">
      {/* 1) DAILY BRIEF */}
      <section className="vv-card p-8 md:p-10">
        <header className="mb-8">
          <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">Internal Briefing</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-black">Daily Brief</h2>
          <p className="mt-2 text-black/50">Focus on the signal, ignore the noise.</p>
        </header>

        <form action={async (formData) => {
          "use server";
          const content = String(formData.get("content") ?? "");
          await saveDailyBrief(content);
        }}>
          <textarea
            name="content"
            defaultValue={brief?.content || ""}
            placeholder="Write today’s brief..."
            className="w-full min-h-[200px] rounded-2xl border border-black/10 bg-white/50 p-6 text-lg outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
          />
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-black/30">
              {brief ? `Last saved: ${brief.updatedAt.toLocaleString()}` : "Not saved yet"}
            </span>
            <button className="vv-btn px-8 py-4">Save Brief</button>
          </div>
        </form>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* 2) SIGNALS */}
        <section className="vv-card p-8 md:p-10">
          <header className="mb-8">
            <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">Inputs</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-black">Signals</h2>
          </header>

          <form action={addSignal} className="space-y-4 mb-10">
            <input
              name="text"
              placeholder="Capture a signal..."
              className="w-full rounded-xl border border-black/10 bg-white/50 px-5 py-4 outline-none focus:ring-2 focus:ring-black/10"
            />
            <div className="flex gap-4">
              <input
                name="source"
                placeholder="Source (optional)"
                className="flex-1 rounded-xl border border-black/10 bg-white/50 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
              <button className="vv-btn px-8 py-3 text-sm whitespace-nowrap">Add Signal</button>
            </div>
          </form>

          <div className="space-y-4">
            {signals.length === 0 ? (
              <div className="py-8 text-center text-sm text-black/30 italic">No signals captured.</div>
            ) : (
              signals.map(s => (
                <div key={s.id} className="group border-b border-black/5 pb-4 last:border-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-base text-black/80 font-medium">{s.text}</div>
                      {s.source && (
                        <div className="mt-1 text-xs text-black/40 uppercase tracking-widest">{s.source}</div>
                      )}
                    </div>
                    <form action={async () => { "use server"; await deleteSignal(s.id); }}>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-600/60 hover:text-red-600">Delete</button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 3) DOSSIERS */}
        <section className="vv-card p-8 md:p-10">
          <header className="mb-8">
            <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">Knowledge Base</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-black">Dossiers</h2>
          </header>

          <form action={addDossier} className="space-y-4 mb-10">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="name"
                placeholder="Name"
                className="w-full rounded-xl border border-black/10 bg-white/50 px-5 py-3 outline-none focus:ring-2 focus:ring-black/10"
              />
              <select
                name="type"
                className="w-full rounded-xl border border-black/10 bg-white/50 px-5 py-3 outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="PERSON">Person</option>
                <option value="COMPANY">Company</option>
                <option value="TOPIC">Topic</option>
              </select>
            </div>
            <textarea
              name="note"
              placeholder="Note"
              className="w-full min-h-[100px] rounded-xl border border-black/10 bg-white/50 p-5 outline-none focus:ring-2 focus:ring-black/10"
            />
            <button className="vv-btn w-full py-4">Add Dossier</button>
          </form>

          <div className="space-y-6">
            {dossiers.length === 0 ? (
              <div className="py-8 text-center text-sm text-black/30 italic">No dossiers found.</div>
            ) : (
              dossiers.map(d => (
                <div key={d.id} className="group vv-card bg-black/[0.02] p-6 border-0 shadow-none">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 border border-black/10 rounded px-2 py-0.5">
                        {d.type}
                      </span>
                      <h3 className="mt-2 text-xl font-serif text-black">{d.name}</h3>
                    </div>
                    <form action={async () => { "use server"; await deleteDossier(d.id); }}>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-600/60 hover:text-red-600">Delete</button>
                    </form>
                  </div>
                  <p className="text-sm text-black/60 leading-relaxed font-light">{d.note}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
