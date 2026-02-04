import { prisma } from "@/lib/db";
import { createTask, updateTaskStatus, deleteTask } from "@/app/actions/tasks";
import { TaskStatus } from "@prisma/client";

export const runtime = "nodejs";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    where: { 
      status: { in: [TaskStatus.PLANNED, TaskStatus.ACTIVE, TaskStatus.DONE] }
    },
    orderBy: { createdAt: "desc" },
  });

  const planned = tasks.filter(t => t.status === "PLANNED");
  const active = tasks.filter(t => t.status === "ACTIVE");
  const done = tasks.filter(t => t.status === "DONE");

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-md shadow-sm vv-watermark-soft">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">
            LONG-TERM
          </div>
          <div className="text-[40px] font-serif tracking-tight text-black">
            Tasks
          </div>
          <div className="text-black/50 mt-1">
            Longer-term work. Managed calmly.
          </div>
        </div>

        <div className="px-6 py-5">
           <form action={async (formData) => { "use server"; await createTask(String(formData.get("title") ?? ""), "PLANNED"); }} className="flex gap-2">
              <input
                name="title"
                placeholder="Add a task or project..."
                className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
              <button className="rounded-xl bg-black px-4 py-3 text-[13px] text-white hover:bg-black/90">
                Add
              </button>
           </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Column title="Planned" items={planned} status="PLANNED" />
        <Column title="Active" items={active} status="ACTIVE" />
        <Column title="Done" items={done} status="DONE" />
      </div>
    </div>
  );
}

function Column({ title, items, status }: { title: string, items: any[], status: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-black/40">{title}</h3>
        <span className="text-xs font-mono text-black/30">{items.length}</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div key={item.id} className="vv-card p-4 group">
            <div className="text-sm font-medium text-black/80 mb-4">{item.title}</div>
            
            <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {status !== "PLANNED" && (
                <form action={async () => { "use server"; await updateTaskStatus(item.id, "PLANNED"); }}>
                  <button className="text-[10px] uppercase tracking-tighter bg-black/5 hover:bg-black/10 px-2 py-1 rounded">Planned</button>
                </form>
              )}
              {status !== "ACTIVE" && (
                <form action={async () => { "use server"; await updateTaskStatus(item.id, "ACTIVE"); }}>
                  <button className="text-[10px] uppercase tracking-tighter bg-black/5 hover:bg-black/10 px-2 py-1 rounded">Active</button>
                </form>
              )}
              {status !== "DONE" && (
                <form action={async () => { "use server"; await updateTaskStatus(item.id, "DONE"); }}>
                  <button className="text-[10px] uppercase tracking-tighter bg-black/5 hover:bg-black/10 px-2 py-1 rounded">Done</button>
                </form>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-8 text-center border-2 border-dashed border-black/5 rounded-2xl">
            <span className="text-[11px] text-black/20 uppercase tracking-widest font-bold">Empty</span>
          </div>
        )}
      </div>
    </div>
  )
}
