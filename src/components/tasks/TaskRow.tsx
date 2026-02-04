"use client";

import { useState } from "react";
import { toggleBacklogTask, updateTask, deleteTask } from "@/app/actions/tasks";

type TaskShape = {
  id: string;
  title: string;
  notes: string;
  doneAt: Date | null;
  status: string;
};

export default function TaskRow({ task }: { task: TaskShape }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  // Status check (Archived or doneAt)
  const done = task.status === "ARCHIVED" || !!task.doneAt;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-black/5 bg-white/70 px-4 py-3">
      <div className="flex items-start gap-3 min-w-0">
        <button
          type="button"
          onClick={() => toggleBacklogTask(task.id, !done)}
          className={`mt-1 h-5 w-5 rounded-md border ${
            done ? "bg-black border-black" : "bg-white border-black/20"
          }`}
          title={done ? "Reopen" : "Archive"}
        />

        <div className="min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                className="w-[420px] max-w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-black/10"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <button
                className="rounded-lg bg-black px-3 py-2 text-[12px] text-white"
                onClick={async () => {
                  const t = title.trim();
                  await updateTask(task.id, { title: t || task.title });
                  setEditing(false);
                }}
              >
                Save
              </button>
              <button
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70"
                onClick={() => {
                  setTitle(task.title);
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div
                className={`truncate font-medium ${
                  done ? "text-black/35 line-through" : "text-black/80"
                }`}
              >
                {task.title}
              </div>
              {task.notes ? (
                <div className="text-[12px] text-black/45 mt-1 truncate">
                  {task.notes}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!editing && (
          <button
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70 hover:bg-white"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
        <button
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70 hover:bg-white"
          onClick={() => deleteTask(task.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
