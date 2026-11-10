'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, TypeDosen } from "@prisma/client";
import { pengaturanJadwalFormValues, pengaturanJadwalSchema } from "../validations";

export async function update(id: number, formData: pengaturanJadwalFormValues) {
    await requireAuth([Role.ADMIN]);

    const validated = pengaturanJadwalSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Validasi pengaturan jadwal gagal', details: validated.error.flatten().fieldErrors };
    }

    const find = await prisma.pengaturanJadwal.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'Pengaturan Jadwal tidak ditemukan' };

    const { jenisDosen, minSks, maxSks } = validated.data;
    const updateData = {
        jenisDosen: jenisDosen as TypeDosen,
        minSks: Number(minSks),
        maxSks: Number(maxSks),
    };

    const updated = await prisma.pengaturanJadwal.update({
        where: { id: BigInt(id) },
        data: updateData,
    });

    return { success: true, data: updated };
}
