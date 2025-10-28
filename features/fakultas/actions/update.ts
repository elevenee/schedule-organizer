'use server';

import { prisma } from "@/lib/prisma";
import { FakultasFormValues } from "../validations";

export async function update(id: number, formData: FakultasFormValues) {
    const find = await prisma.fakultas.findUnique({ where: { id } });
    if (!find) return { error: 'Fakultas tidak ditemukan' };

    const { nama } = formData;

    let updateData = {
        nama,
    }

    const updated = await prisma.fakultas.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}