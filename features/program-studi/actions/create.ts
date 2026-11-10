'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Jenjang, Role } from "@prisma/client";
import { ProgramStudiFormValues, programStudiSchema } from "../validations";

export async function create(formData: ProgramStudiFormValues) {
  await requireAuth([Role.ADMIN]);

  const validated = programStudiSchema.safeParse(formData);
  if (!validated.success) {
    return { error: 'Validasi program studi gagal', details: validated.error.flatten().fieldErrors };
  }

  const { nama, jenjang, fakultas, kode, singkatan } = validated.data;
  const data = {
    nama,
    kode,
    singkatan: singkatan || null,
    jenjang: jenjang as Jenjang,
    fakultasId: BigInt(fakultas),
  };
  
  return await prisma.jurusan.create({
    data
  });
}
