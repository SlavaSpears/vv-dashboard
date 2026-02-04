import { prisma } from "@/lib/db";
import { 
  addPerson, 
  deletePerson, 
  markContactedToday,
  updatePerson
} from "@/app/actions/people";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PeoplePage() {
  const people = await prisma.person.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-12 pb-20">
      <section className="vv-card p-8 md:p-10">
        <header className="mb-8">
          <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">Relationship Manager</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-black">People</h2>
          <p className="mt-2 text-black/50">Relationships, kept sharp.</p>
        </header>

        {/* Add Form */}
        <form action={addPerson} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
          <div className="space-y-4">
            <input
              name="name"
              required
              placeholder="Name"
              className="w-full rounded-xl border border-black/10 bg-white/50 px-5 py-3 outline-none focus:ring-2 focus:ring-black/10"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                name="category"
                className="w-full rounded-xl border border-black/10 bg-white/50 px-5 py-3 outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="BUSINESS">Business</option>
                <option value="FRIENDS">Friends</option>
                <option value="FAMILY">Family</option>
              </select>
              <input
                name="context"
                placeholder="Context (How I know them)"
                className="w-full rounded-xl border border-black/10 bg-white/50 px-5 py-3 outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-black/40 pl-2">Last Contact</label>
                  <input
                    type="date"
                    name="lastContact"
                    className="w-full rounded-xl border border-black/10 bg-white/50 px-5 py-2.5 outline-none focus:ring-2 focus:ring-black/10 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-black/40 pl-2">Next Follow-up</label>
                  <input
                    type="date"
                    name="nextFollowUp"
                    className="w-full rounded-xl border border-black/10 bg-white/50 px-5 py-2.5 outline-none focus:ring-2 focus:ring-black/10 text-sm"
                  />
                </div>
             </div>
             <textarea
              name="notes"
              placeholder="Notes..."
              className="w-full h-[88px] rounded-xl border border-black/10 bg-white/50 p-4 outline-none focus:ring-2 focus:ring-black/10 text-sm"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="vv-btn px-12 py-4">Add Person</button>
          </div>
        </form>
      </section>

      {/* List Implementation */}
      <section className="space-y-4">
        {people.length === 0 ? (
          <div className="vv-card p-20 text-center text-sm text-black/30 italic">No contacts added yet.</div>
        ) : (
          people.map(p => (
            <div key={p.id} className="vv-card group hover:bg-white/60 transition-colors p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-black/[0.03] border border-black/5 flex items-center justify-center font-serif text-xl text-black/40">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-medium text-black/90">{p.name}</h3>
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-black/5 py-0.5 px-2 rounded border border-black/5 text-black/40">
                        {p.category}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-black/50 italic">{p.context || "No context provided"}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 sm:gap-12">
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-black/30">Last Contact</div>
                    <div className="text-xs text-black/70 font-mono">
                      {p.lastContact ? p.lastContact.toLocaleDateString() : "Never"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-black/30">Next Follow-up</div>
                    <div className="text-xs text-black/70 font-mono">
                      {p.nextFollowUp ? p.nextFollowUp.toLocaleDateString() : "None"}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <form action={async () => { "use server"; await markContactedToday(p.id); }}>
                      <button className="rounded-lg bg-black/[0.03] hover:bg-black/5 border border-black/5 px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-black/60">
                        Contacted Today
                      </button>
                    </form>
                    <form action={async () => { "use server"; await deletePerson(p.id); }}>
                      <button className="rounded-lg hover:bg-red-50 px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-red-600/60 transition-colors">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              
              {p.notes && (
                <div className="mt-6 pt-6 border-t border-black/5 text-sm text-black/60 line-clamp-2 leading-relaxed">
                  {p.notes}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
