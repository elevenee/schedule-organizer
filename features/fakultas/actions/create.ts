'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { FakultasFormValues, fakultasSchema } from "../validations";

export async function create(formData: FakultasFormValues) {
  await requireAuth([Role.ADMIN]);

  const validated = fakultasSchema.safeParse(formData);
  if (!validated.success) {
    return { error: 'Validasi data fakultas gagal', details: validated.error.flatten().fieldErrors };
  }

  const { nama } = validated.data;
  return await prisma.fakultas.create({
    data: { nama }
  });
}
