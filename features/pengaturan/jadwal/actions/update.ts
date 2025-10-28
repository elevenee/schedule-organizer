'use server';

import { prisma } from "@/lib/prisma";
import { dosenFormValues } from "../validations";
export async function update(id: number, formData: dosenFormValues) {
    const find = await prisma.dosen.findUnique({ where: { id } });
    if (!find) return { error: 'Dosen tidak ditemukan' };

    const { nama, nidn, fakultasId } = formData;
    const updateData = {
        nama,
        nidn,
        fakultasId: Number(fakultasId),
    }

    const updated = await prisma.dosen.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}