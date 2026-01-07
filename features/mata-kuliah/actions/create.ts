'use server';

import { prisma } from "@/lib/prisma";
import { Jenjang } from "@prisma/client";
import { mataKuliahFormValues } from "../validations";

export async function create(formData: mataKuliahFormValues) {
  const { nama, kode, sks, jurusanId, semester, jenjang , kurikulumId} = formData;
  const data = {
    nama,
    kode,
    sks: Number(sks),
    semester: Number(semester),
    jurusanId: Number(jurusanId),
    jenjang: jenjang as Jenjang,
    kurikulumId: Number(kurikulumId) || null
  }
  return await prisma.mataKuliah.create({
    data: data
  });
}
