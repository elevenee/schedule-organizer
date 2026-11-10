'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Jenjang, Role } from "@prisma/client";
import { ProgramStudiFormValues, programStudiSchema } from "../validations";

export async function update(id: number, formData: ProgramStudiFormValues) {
    await requireAuth([Role.ADMIN]);

    const validated = programStudiSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Validasi program studi gagal', details: validated.error.flatten().fieldErrors };
    }

    const find = await prisma.jurusan.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'Program Studi tidak ditemukan' };

    const { nama, jenjang, fakultas, kode, singkatan } = validated.data;

    const updateData = {
        nama,
        kode,
        singkatan: singkatan || null,
        jenjang: jenjang as Jenjang,
        fakultasId: BigInt(fakultas),
    };

    const updated = await prisma.jurusan.update({
        where: { id: BigInt(id) },
        data: updateData,
    });

    return { success: true, data: updated };
}
