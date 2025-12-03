'use server';

import { prisma } from "@/lib/prisma";
import { pengaturanJadwalFormValues } from "../validations";
import { TypeDosen } from "@prisma/client";
export async function update(id: number, formData: pengaturanJadwalFormValues) {
    const find = await prisma.pengaturanJadwal.findUnique({ where: { id } });
    if (!find) return { error: 'Pengaturan Jadwal tidak ditemukan' };

    const { jenisDosen, minSks, maxSks } = formData;
    const updateData = {
        jenisDosen: jenisDosen as TypeDosen,
        minSks: Number(minSks),
        maxSks: Number(maxSks),
    }

    const updated = await prisma.pengaturanJadwal.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}