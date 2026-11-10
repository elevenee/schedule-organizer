'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, SemesterPeriode, StatusTahun } from "@prisma/client";
import { tahunAkademikFormValues, tahunAkademikSchema } from "../validations";

export async function create(formData: tahunAkademikFormValues) {
  await requireAuth([Role.ADMIN]);

  const validated = tahunAkademikSchema.safeParse(formData);
  if (!validated.success) {
    return { error: 'Validasi tahun akademik gagal', details: validated.error.flatten().fieldErrors };
  }

  const { name, status, semester } = validated.data;
  const targetStatus = (status as StatusTahun) || StatusTahun.INACTIVE;

  return await prisma.$transaction(async (tx) => {
    if (targetStatus === StatusTahun.ACTIVE) {
      await tx.tahunAkademik.updateMany({
        where: { status: StatusTahun.ACTIVE },
        data: { status: StatusTahun.INACTIVE }
      });
    }

    return await tx.tahunAkademik.create({
      data: {
        name,
        status: targetStatus,
        semester: semester as SemesterPeriode
      }
    });
  });
}
