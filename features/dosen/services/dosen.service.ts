'use server'
import { prisma } from "@/lib/prisma";

export async function upsertDosen(data: any) {
  return prisma.dosen.upsert({
    where: { id: data.id },
    update: data,
    create: data,
  });
}