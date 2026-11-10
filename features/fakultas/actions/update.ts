'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { FakultasFormValues, fakultasSchema } from "../validations";

export async function update(id: number, formData: FakultasFormValues) {
    await requireAuth([Role.ADMIN]);

    const validated = fakultasSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Validasi data fakultas gagal', details: validated.error.flatten().fieldErrors };
    }

    const find = await prisma.fakultas.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'Fakultas tidak ditemukan' };

    const { nama } = validated.data;

    const updated = await prisma.fakultas.update({
        where: { id: BigInt(id) },
        data: { nama },
    });

    return { success: true, data: updated };
}
