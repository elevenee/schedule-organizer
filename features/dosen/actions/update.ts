'use server';

import { prisma } from "@/lib/prisma";
import { TypeDosen } from "@prisma/client";
import { dosenFormValues } from "../validations";
export async function update(id: number, formData: dosenFormValues) {
    const find = await prisma.dosen.findUnique({ where: { id } });
    if (!find) return { error: 'Dosen tidak ditemukan' };

    const { nama, nidn, fakultasId, jurusanId, status } = formData;
    const updateData = {
        nama,
        nidn,
        fakultasId: Number(fakultasId),
        jurusanId: jurusanId ? Number(jurusanId) : null,
        status: status as TypeDosen
    }

    const updated = await prisma.dosen.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}