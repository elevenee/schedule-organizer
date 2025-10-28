'use server';

import { prisma } from "@/lib/prisma";
import { FakultasFormValues } from "../validations";

export async function create(formData: FakultasFormValues) {
  const { nama } = formData;
  const data = {
    nama: nama
  }
  return await prisma.fakultas.create({
    data: data
  });
}
