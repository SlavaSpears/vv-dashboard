"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveDailyBrief(content: string) {
  // We only keep one daily brief for now, or we could find/create by date.
  // For simplicity as requested, we'll just update a single singleton or create it.
  const brief = await prisma.dailyBrief.findFirst();
  
  if (brief) {
    await prisma.dailyBrief.update({
      where: { id: brief.id },
      data: { content },
    });
  } else {
    await prisma.dailyBrief.create({
      data: { content },
    });
  }
  
  revalidatePath("/intelligence");
}

export async function addSignal(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim() || null;
  
  if (!text) return;
  
  await prisma.signal.create({
    data: { text, source },
  });
  
  revalidatePath("/intelligence");
}

export async function deleteSignal(id: string) {
  await prisma.signal.delete({ where: { id } });
  revalidatePath("/intelligence");
}

export async function addDossier(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "TOPIC") as any;
  const note = String(formData.get("note") ?? "").trim();
  
  if (!name) return;
  
  await prisma.dossier.create({
    data: { name, type, note },
  });
  
  revalidatePath("/intelligence");
}

export async function deleteDossier(id: string) {
  await prisma.dossier.delete({ where: { id } });
  revalidatePath("/intelligence");
}
