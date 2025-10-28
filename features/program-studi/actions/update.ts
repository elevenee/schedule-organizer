'use server';

import { prisma } from "@/lib/prisma";
import { ProgramStudiFormValues } from "../validations";

export async function update(id: number, formData: ProgramStudiFormValues) {
    const find = await prisma.programStudi.findUnique({ where: { id } });
    if (!find) return { error: 'Program Studi tidak ditemukan' };

    const { name, jenjang, fakultas } = formData;

    let updateData = {
        name: name,
        jenjang: jenjang as any,
        fakultasId: fakultas
    }

    const updated = await prisma.programStudi.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}