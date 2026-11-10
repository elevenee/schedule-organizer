'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, TypeDosen } from "@prisma/client";
import { dosenFormValues, dosenSchema } from "../validations";

export async function create(formData: dosenFormValues) {
  await requireAuth([Role.ADMIN]);

  const validated = dosenSchema.safeParse(formData);
  if (!validated.success) {
    return { error: 'Validasi data dosen gagal', details: validated.error.flatten().fieldErrors };
  }

  const { nama, nidn, fakultasId, jurusanId, status } = validated.data;
  const data = {
    nama,
    nidn: nidn || null,
    fakultasId: fakultasId ? BigInt(fakultasId) : null,
    jurusanId: jurusanId ? BigInt(jurusanId) : null,
    status: status as TypeDosen
  };

  return await prisma.dosen.create({
    data: data
  });
}
