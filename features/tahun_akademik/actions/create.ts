'use server';

import { prisma } from "@/lib/prisma";
import { tahunAkademikFormValues } from "../validations";
import { SemesterPeriode, StatusTahun } from "@prisma/client";

export async function create(formData: tahunAkademikFormValues) {
  const { name, status, semester } = formData;
  const data = {
    name: name,
    status: status as StatusTahun,
    semester: semester as SemesterPeriode
  }
  return await prisma.tahunAkademik.create({
    data: data
  });
}
