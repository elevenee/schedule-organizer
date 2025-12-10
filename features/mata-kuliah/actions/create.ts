'use server';

import { prisma } from "@/lib/prisma";
import { mataKuliahFormValues } from "../validations";
import { Jenjang } from "@prisma/client";

export async function create(formData: mataKuliahFormValues) {
  const { nama, kode, sks, jurusanId, semester, jenjang } = formData;
  const data = {
    nama,
    kode,
    sks,
    semester: Number(semester),
    jurusanId: Number(jurusanId),
    jenjang: jenjang as Jenjang,
    kurikulumId: null
  }
  return await prisma.mataKuliah.create({
    data: data
  });
}
