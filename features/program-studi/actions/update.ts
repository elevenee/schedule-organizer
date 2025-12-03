'use server';

import { prisma } from "@/lib/prisma";
import { ProgramStudiFormValues } from "../validations";

export async function update(id: number, formData: ProgramStudiFormValues) {
    const find = await prisma.jurusan.findUnique({ where: { id } });
    if (!find) return { error: 'Program Studi tidak ditemukan' };

    const { nama, jenjang, fakultas } = formData;

    let updateData = {
        name: nama,
        jenjang: jenjang as any,
        fakultasId: fakultas
    }

    const updated = await prisma.jurusan.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}