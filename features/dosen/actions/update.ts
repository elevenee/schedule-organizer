'use server';

import { prisma } from "@/lib/prisma";
import { TypeDosen } from "@prisma/client";
import { dosenFormValues, PhoneValues } from "../validations";
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
export async function updateNoHp(id: number, formData: PhoneValues) {
    const find = await prisma.dosen.findUnique({ where: { id } });
    if (!find) return { error: 'Dosen tidak ditemukan' };
    
    const { no_hp } = formData;
    const updateData = {
        no_hp,
    }

    const updated = await prisma.dosen.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}