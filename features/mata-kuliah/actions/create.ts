'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Jenjang, Role } from "@prisma/client";
import { mataKuliahFormValues, mataKuliahSchema } from "../validations";

export async function create(formData: mataKuliahFormValues) {
  await requireAuth([Role.ADMIN]);

  const validated = mataKuliahSchema.safeParse(formData);
  if (!validated.success) {
    return { error: 'Validasi data mata kuliah gagal', details: validated.error.flatten().fieldErrors };
  }

  const { nama, kode, sks, jurusanId, semester, jenjang, kurikulumId } = validated.data;
  const data = {
    nama,
    kode: kode || null,
    sks: Number(sks),
    semester: Number(semester),
    jurusanId: BigInt(jurusanId),
    jenjang: jenjang as Jenjang,
    kurikulumId: kurikulumId ? Number(kurikulumId) : null
  };

  return await prisma.mataKuliah.create({
    data
  });
}
