import { prisma } from "@/lib/db";
import { 
  addNextAction, 
  updateNextActionStatus, 
  deleteNextAction,
  demoteToBacklog
} from "@/app/actions/tasks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NextActionsPage() {
  const items = await prisma.nextAction.findMany({
    orderBy: { createdAt: "desc" },
  });
  
  const activeCount = items.filter(i => !i.done).length;
  const isFull = activeCount >= 10;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-md shadow-sm vv-watermark-soft">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">
                EXECUTION QUEUE
              </div>
              <div className="text-[40px] font-serif tracking-tight text-black">
                Next Actions
              </div>
            </div>
            <div className={`text-sm font-mono ${isFull ? 'text-red-600' : 'text-black/40'}`}>
              {activeCount}/10
            </div>
          </div>
          <div className="text-black/50 mt-1">
            If it’s not actionable, it doesn’t live here.
          </div>
        </div>

        <div className="px-6 py-5">
           <form action={addNextAction} className="flex flex-col gap-2 mb-8">
              <div className="flex gap-2">
                <input
                  name="title"
                  placeholder={isFull ? "Queue is full..." : "Add a next action..."}
                  disabled={isFull}
                  className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                />
                <button 
                  disabled={isFull}
                  className="rounded-xl bg-black px-4 py-3 text-[13px] text-white hover:bg-black/90 disabled:bg-black/20"
                >
                  Queue
                </button>
              </div>
              {isFull && (
                <div className="text-xs text-red-600 font-medium">
                  Queue is full. Complete or demote something first.
                </div>
              )}
           </form>

          <div className="space-y-1">
            {items.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-black/45">
                Queue is empty. Add something that moves the needle.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className={`group py-3 border-b border-black/5 last:border-0 ${item.done ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                        item.status === 'DOING' ? 'bg-amber-100 text-amber-700' : 
                        item.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                      <div className={`text-base text-black/80 ${item.done ? 'line-through' : ''}`}>{item.title}</div>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.status !== 'DOING' && !item.done && (
                        <form action={async () => { "use server"; await updateNextActionStatus(item.id, "DOING"); }}>
                          <button className="rounded px-2 py-1 text-xs text-black/60 hover:bg-black/5">Doing</button>
                        </form>
                      )}
                      {!item.done && (
                        <form action={async () => { "use server"; await updateNextActionStatus(item.id, "DONE"); }}>
                          <button className="rounded px-2 py-1 text-xs text-black/60 hover:bg-black/5">Complete</button>
                        </form>
                      )}
                      <form action={async () => { "use server"; await demoteToBacklog(item.id); }}>
                        <button className="rounded px-2 py-1 text-xs text-black/60 hover:bg-black/5">Demote</button>
                      </form>
                      <form action={deleteNextAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button className="rounded px-2 py-1 text-xs text-red-600/60 hover:bg-red-50">Delete</button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
