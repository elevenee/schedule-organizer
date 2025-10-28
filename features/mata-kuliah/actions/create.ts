'use server';

import { prisma } from "@/lib/prisma";
import { mataKuliahFormValues } from "../validations";

export async function create(formData: mataKuliahFormValues) {
  const { nama, kode, sks, jurusanId, semester } = formData;
  const data = {
    nama,
    kode,
    sks,
    semester: Number(semester),
    jurusanId: Number(jurusanId),
  }
  return await prisma.mataKuliah.create({
    data: data
  });
}
