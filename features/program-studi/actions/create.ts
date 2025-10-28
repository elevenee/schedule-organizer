'use server';

import { prisma } from "@/lib/prisma";
import { ProgramStudiFormValues } from "../validations";
import { Jenjang } from "@prisma/client";

export async function create(formData: ProgramStudiFormValues) {
  const { nama, jenjang, fakultas, kode, singkatan } = formData;
  const data = {
    nama: nama,
    kode,
    singkatan,
    jenjang: jenjang as Jenjang,
    fakultasId: BigInt(fakultas),
  }
  
  return await prisma.jurusan.create({
    data: data
  });
}
