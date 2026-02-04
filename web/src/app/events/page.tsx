import { prisma } from "@/lib/db";
import { createEvent, deleteEvent } from "@/app/actions/events";
import { EventType } from "@prisma/client";

export const runtime = "nodejs";

function fmt(d: Date) {
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MeetingsPage() {
  const upcoming = await prisma.event.findMany({
    orderBy: { startAt: "asc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-md shadow-sm vv-watermark-soft">
        <div className="px-6 py-5 border-b border-black/5">
          <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">
            MEETINGS / CALLS
          </div>
          <div className="text-[40px] font-serif tracking-tight text-black">
            Events
          </div>
          <div className="text-black/50 mt-1">Your schedule, kept sharp.</div>
        </div>

        <div className="px-6 py-5">
          <form
            action={async (formData) => {
              "use server";

              const type = String(
                formData.get("type") ?? "MEETING"
              ) as EventType;
              const title = String(formData.get("title") ?? "").trim();
              const person = String(formData.get("person") ?? "");
              const location = String(formData.get("location") ?? "");

              const startAtStr = String(formData.get("startAt") ?? "");
              const endAtStr = String(formData.get("endAt") ?? "");

              const startAt = new Date(startAtStr);
              const endAt = endAtStr
                ? new Date(endAtStr)
                : new Date(startAt.getTime() + 30 * 60 * 1000);

              if (!title || isNaN(startAt.getTime()) || isNaN(endAt.getTime()))
                return;

              await createEvent({
                type,
                title,
                person,
                location,
                startAt,
                endAt,
              });
            }}
            className="grid gap-2 md:grid-cols-6"
          >
            <select
              name="type"
              className="rounded-xl border border-black/10 bg-white/90 px-3 py-3 text-[13px]"
              defaultValue="MEETING"
            >
              <option value="MEETING">Meeting</option>
              <option value="CALL">Call</option>
            </select>

            <input
              name="title"
              placeholder="Title"
              className="md:col-span-2 rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-[13px]"
            />
            <input
              name="person"
              placeholder="Person"
              className="rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-[13px]"
            />
            <input
              name="location"
              placeholder="Location"
              className="rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-[13px]"
            />

            <div className="md:col-span-6 grid gap-2 md:grid-cols-3">
              <input
                name="startAt"
                type="datetime-local"
                className="rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-[13px]"
              />
              <input
                name="endAt"
                type="datetime-local"
                className="rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-[13px]"
              />
              <button className="rounded-xl bg-black px-4 py-3 text-[13px] text-white hover:bg-black/90">
                Add event
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            {upcoming.length === 0 ? (
              <div className="text-[13px] text-black/45">No events yet.</div>
            ) : (
              upcoming.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-black/5 bg-white/70 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-black/10 bg-white px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-black/55">
                        {e.type}
                      </span>
                      <div className="font-medium text-black/80 truncate">
                        {e.title}
                      </div>
                    </div>
                    <div className="mt-1 text-[12px] text-black/45">
                      {fmt(e.startAt)} → {fmt(e.endAt)}
                      {e.person ? ` • ${e.person}` : ""}
                      {e.location ? ` • ${e.location}` : ""}
                    </div>
                  </div>

                  <form
                    action={async () => {
                      "use server";
                      await deleteEvent(e.id);
                    }}
                  >
                    <button className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70 hover:bg-white">
                      Delete
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
