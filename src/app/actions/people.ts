"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addPerson(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "BUSINESS") as any;
  const context = String(formData.get("context") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const lastContactStr = String(formData.get("lastContact") ?? "");
  const nextFollowUpStr = String(formData.get("nextFollowUp") ?? "");

  if (!name) return;

  await prisma.person.create({
    data: {
      name,
      category,
      context,
      notes,
      lastContact: lastContactStr ? new Date(lastContactStr) : null,
      nextFollowUp: nextFollowUpStr ? new Date(nextFollowUpStr) : null,
    },
  });

  revalidatePath("/people");
}

export async function deletePerson(id: string) {
  await prisma.person.delete({ where: { id } });
  revalidatePath("/people");
}

export async function markContactedToday(id: string) {
  await prisma.person.update({
    where: { id },
    data: { lastContact: new Date() },
  });
  revalidatePath("/people");
}

export async function updatePerson(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "BUSINESS") as any;
  const context = String(formData.get("context") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  
  if (!name) return;

  await prisma.person.update({
    where: { id },
    data: { name, category, context, notes },
  });

  revalidatePath("/people");
}
