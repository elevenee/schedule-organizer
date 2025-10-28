'use server';

import { prisma } from "@/lib/prisma";
import { dosenFormValues } from "../validations";

export async function create(formData: dosenFormValues) {
  const { nama, nidn, fakultasId } = formData;
  const data = {
    nama,
    nidn,
    fakultasId: Number(fakultasId),
  }
  return await prisma.dosen.create({
    data: data
  });
}
