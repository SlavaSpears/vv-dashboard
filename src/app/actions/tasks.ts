"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- Backlog (Task) Actions ---

export async function createTask(title: string, status: "BACKLOG" | "PLANNED" | "ACTIVE" | "DONE" = "BACKLOG") {
  const t = title?.trim();
  if (!t) return;
  
  await prisma.task.create({ data: { title: t, status } });
  revalidatePath("/backlog");
  revalidatePath("/tasks");
}

export async function updateTaskStatus(id: string, status: "PLANNED" | "ACTIVE" | "DONE") {
  await prisma.task.update({ where: { id }, data: { status } });
  revalidatePath("/tasks");
}

export async function updateTask(
  id: string,
  data: Partial<{
    title: string;
    notes: string;
    priority: number;
    dueAt: Date | null;
  }>
) {
  await prisma.task.update({ where: { id }, data });
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
}

export async function toggleBacklogTask(id: string, done: boolean) {
  await prisma.task.update({
    where: { id },
    data: {
      status: done ? "ARCHIVED" : "BACKLOG",
      doneAt: done ? new Date() : null,
    },
  });
  revalidatePath("/tasks");
}


// --- Capture Actions ---

export async function addCapture(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await prisma.capture.create({
    data: { title },
  });

  revalidatePath("/");
}

export async function clearCapture(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.capture.delete({ where: { id } });
  revalidatePath("/");
}

// --- 3-System Transition Actions ---

export async function promoteToNextAction(captureId: string) {
  const capture = await prisma.capture.findUnique({ where: { id: captureId } });
  if (!capture) return;

  const count = await prisma.nextAction.count({ where: { done: false } });
  if (count >= 10) throw new Error("Queue is full");

  await prisma.$transaction([
    prisma.nextAction.create({ data: { title: capture.title } }),
    prisma.capture.delete({ where: { id: captureId } }),
  ]);

  revalidatePath("/backlog");
  revalidatePath("/next-actions");
}

export async function convertToTask(captureId: string) {
  const capture = await prisma.capture.findUnique({ where: { id: captureId } });
  if (!capture) return;

  await prisma.$transaction([
    prisma.task.create({ data: { title: capture.title, status: "PLANNED" } }),
    prisma.capture.delete({ where: { id: captureId } }),
  ]);

  revalidatePath("/backlog");
  revalidatePath("/tasks");
}

export async function demoteToBacklog(nextActionId: string) {
  const nextAction = await prisma.nextAction.findUnique({ where: { id: nextActionId } });
  if (!nextAction) return;

  await prisma.$transaction([
    prisma.capture.create({ data: { title: nextAction.title } }),
    prisma.nextAction.delete({ where: { id: nextActionId } }),
  ]);

  revalidatePath("/next-actions");
  revalidatePath("/backlog");
}

// --- Next Action (Today) Actions ---

export async function addNextAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const count = await prisma.nextAction.count({ where: { done: false } });
  if (count >= 10) return;

  await prisma.nextAction.create({
      data: { title, status: "QUEUED" }
  });
  revalidatePath("/next-actions");
  revalidatePath("/");
}

export async function updateNextActionStatus(id: string, status: "QUEUED" | "DOING" | "DONE") {
  await prisma.nextAction.update({
    where: { id },
    data: { status, done: status === "DONE" },
  });
  revalidatePath("/next-actions");
  revalidatePath("/");
}

export async function deleteNextAction(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await prisma.nextAction.delete({ where: { id } });
    revalidatePath("/next-actions");
    revalidatePath("/");
}

export async function toggleNextAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const done = String(formData.get("done") ?? "") === "true";
  
  if (!id) return;

  await prisma.nextAction.update({
    where: { id },
    data: { done, status: done ? "DONE" : "QUEUED" },
  });
  revalidatePath("/next-actions");
  revalidatePath("/");
}

