'use server';

import { prisma } from "@/lib/prisma";
import { jadwalFormValues } from "../validations";

export async function create(formData: jadwalFormValues) {
  const tahunAkademik = await prisma.tahunAkademik.findFirst({
    where: { status: "ACTIVE" },
  })
  const { matakuliah, sks, dosenId, semester, kelas, fakultasId, jurusanId } = formData;
  const data = {
    tahunAkademik: tahunAkademik?.name ?? "",
    matakuliah,
    sks,
    semester: Number(semester),
    dosenId: Number(dosenId),
    fakultasId: Number(fakultasId),
    jurusanId: Number(jurusanId),
    kelas
  }
  return await prisma.jadwal.create({
    data: data
  });
}
