'use server';

import { prisma } from "@/lib/prisma";
import { StatusTahun } from "@prisma/client";
import { kurikulumFormValues } from "../validations";

export async function create(formData: kurikulumFormValues) {
  const { nama, status } = formData;
  const data = {
    nama: nama,
    status: status as StatusTahun
  }
  return await prisma.kurikulum.create({
    data: data
  });
}
