'use server';

import { prisma } from "@/lib/prisma";
import { sisaSksFormValues } from "../validations";
import { create as CreateJadwal } from "@/features/jadwal/actions/create"

export async function create(formData: sisaSksFormValues) {
  try {
    const addJadwal = await CreateJadwal(formData);
    if (addJadwal) {
      await prisma.sisaSks.delete({
        where: {
          id: formData.id
        }
      })
    }

  } catch (error: any) {
    console.error("Error creating jadwal:", error.code);
    return { errors_message: 'Gagal membuat jadwal. Mungkin jadwal dengan data yang sama sudah ada.' };
  }
}
