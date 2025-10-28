'use server';

import { prisma } from "@/lib/prisma";
import { tahunAkademikFormValues } from "../validations";
import { StatusTahun } from "@prisma/client";

export async function create(formData: tahunAkademikFormValues) {
  const { name, status } = formData;
  const data = {
    name: name,
    status: status as StatusTahun,
  }
  return await prisma.tahunAkademik.create({
    data: data
  });
}
