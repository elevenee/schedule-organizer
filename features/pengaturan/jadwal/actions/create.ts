'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, TypeDosen } from "@prisma/client";
import { pengaturanJadwalFormValues, pengaturanJadwalSchema } from "../validations";

export async function create(formData: pengaturanJadwalFormValues) {
  await requireAuth([Role.ADMIN]);

  const validated = pengaturanJadwalSchema.safeParse(formData);
  if (!validated.success) {
    return { error: 'Validasi pengaturan jadwal gagal', details: validated.error.flatten().fieldErrors };
  }

  const { jenisDosen, minSks, maxSks } = validated.data;
  const data = {
    jenisDosen: jenisDosen as TypeDosen,
    minSks: Number(minSks),
    maxSks: Number(maxSks),
  };

  return await prisma.pengaturanJadwal.create({
    data
  });
}
