'use server';

import { prisma } from "@/lib/prisma";
import { pengaturanJadwalFormValues } from "../validations";
import { TypeDosen } from "@prisma/client";

export async function create(formData: pengaturanJadwalFormValues) {
  const { jenisDosen, minSks, maxSks } = formData;
  const data = {
    jenisDosen: jenisDosen as TypeDosen,
    minSks: Number(minSks),
    maxSks: Number(maxSks),
  }
  return await prisma.pengaturanJadwal.create({
    data: data
  });
}
