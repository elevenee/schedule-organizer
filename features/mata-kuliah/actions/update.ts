'use server';

import { prisma } from "@/lib/prisma";
import { mataKuliahFormValues } from "../validations";
export async function update(id: number, formData: mataKuliahFormValues) {
    const find = await prisma.mataKuliah.findUnique({ where: { id } });
    if (!find) return { error: 'Tahun Akademik tidak ditemukan' };

    const { nama, kode, sks, jurusanId, semester, kurikulumId } = formData;
    const updateData = {
        nama,
        kode,
        sks: Number(sks),
        semester: Number(semester),
        jurusanId: Number(jurusanId),
        kurikulumId: Number(kurikulumId) || null
    }

    const updated = await prisma.mataKuliah.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}