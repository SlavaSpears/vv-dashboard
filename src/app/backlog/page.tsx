import { prisma } from "@/lib/db";
import { 
  addCapture, 
  clearCapture, 
  promoteToNextAction, 
  convertToTask 
} from "@/app/actions/tasks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function BacklogPage() {
  const items = await prisma.capture.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-md shadow-sm vv-watermark-soft">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">
            INBOX
          </div>
          <div className="text-[40px] font-serif tracking-tight text-black">
            Backlog
          </div>
          <div className="text-black/50 mt-1">
            Capture everything. Plan for later.
          </div>
        </div>

        <div className="px-6 py-5">
           <form action={addCapture} className="flex gap-2 mb-8">
              <input
                name="title"
                placeholder="Add to backlog..."
                className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
              <button className="rounded-xl bg-black px-4 py-3 text-[13px] text-white hover:bg-black/90">
                Add
              </button>
           </form>

          <div className="space-y-1">
            {items.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-black/45">
                No items yet. Capture first, organise later.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="group py-3 border-b border-black/5 last:border-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-base text-black/80">{item.title}</div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <form action={async () => { "use server"; await promoteToNextAction(item.id); }}>
                        <button className="rounded px-2 py-1 text-xs text-black/60 hover:bg-black/5">Promote</button>
                      </form>
                      <form action={async () => { "use server"; await convertToTask(item.id); }}>
                        <button className="rounded px-2 py-1 text-xs text-black/60 hover:bg-black/5">Convert</button>
                      </form>
                      <form action={clearCapture}>
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
