'use server';

import { prisma } from "@/lib/prisma";
import { jadwalFormValues } from "../validations";
export async function update(id: number, formData: jadwalFormValues) {
    const find = await prisma.jadwal.findUnique({ where: { id } });
    if (!find) return { error: 'Jadwal tidak ditemukan' };
    
    const { matakuliah, sks, dosenId, semester, kelas } = formData;
    const updateData = {
        matakuliah,
        sks: Number(sks),
        semester: Number(semester),
        dosenId: Number(dosenId),
        kelas
    }
    const updated = await prisma.jadwal.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}