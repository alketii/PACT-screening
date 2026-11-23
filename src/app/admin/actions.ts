"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { ENTRY_STATUSES } from "@/db/schema";
import { isAdmin, signIn, signOut } from "@/lib/auth";

export async function login(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  // Slow down password guessing.
  await new Promise((r) => setTimeout(r, 800));
  const ok = await signIn(String(formData.get("password") ?? ""));
  if (!ok) return { error: "Fjalëkalimi nuk është i saktë." };
  revalidatePath("/admin");
  return {};
}

export async function logout() {
  await signOut();
  revalidatePath("/admin");
}

export async function setStatus(id: string, status: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const parsed = z.object({ id: z.uuid(), status: z.enum(ENTRY_STATUSES) }).parse({ id, status });
  await getDb().update(schema.entries).set({ status: parsed.status }).where(eq(schema.entries.id, parsed.id));
  revalidatePath("/admin");
}

export async function deleteEntry(id: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  await getDb().delete(schema.entries).where(eq(schema.entries.id, z.uuid().parse(id)));
  revalidatePath("/admin");
}
