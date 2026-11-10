'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, StatusTahun } from "@prisma/client";
import { kurikulumFormValues, kurikulumSchema } from "../validations";

export async function create(formData: kurikulumFormValues) {
  await requireAuth([Role.ADMIN]);

  const validated = kurikulumSchema.safeParse(formData);
  if (!validated.success) {
    return { error: 'Validasi kurikulum gagal', details: validated.error.flatten().fieldErrors };
  }

  const { nama, status } = validated.data;
  return await prisma.kurikulum.create({
    data: {
      nama,
      status: (status as StatusTahun) || StatusTahun.ACTIVE
    }
  });
}
