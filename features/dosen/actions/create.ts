'use server';

import { prisma } from "@/lib/prisma";
import { TypeDosen } from "@prisma/client";
import { dosenFormValues } from "../validations";

export async function create(formData: dosenFormValues) {
  const { nama, nidn, fakultasId, jurusanId, status } = formData;
  const data = {
    nama,
    nidn,
    fakultasId: fakultasId ? Number(fakultasId) : null,
    jurusanId: jurusanId ? Number(jurusanId) : null,
    status: status as TypeDosen
  }
  return await prisma.dosen.create({
    data: data
  });
}
