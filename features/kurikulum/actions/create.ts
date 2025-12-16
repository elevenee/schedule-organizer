'use server';

import { prisma } from "@/lib/prisma";
import { kurikulumFormValues } from "../validations";
import { SemesterPeriode, StatusTahun } from "@prisma/client";

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
