'use server'
import { prisma } from "@/lib/prisma";

export async function upsertDosen(data: any) {
  return prisma.dosen.upsert({
    where: { nidn: data.nidn },
    update: data,
    create: data,
  });
}