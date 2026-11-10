'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, StatusTahun } from "@prisma/client";
import { kurikulumFormValues, kurikulumSchema } from "../validations";

export async function update(id: number, formData: kurikulumFormValues) {
    await requireAuth([Role.ADMIN]);

    const validated = kurikulumSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Validasi kurikulum gagal', details: validated.error.flatten().fieldErrors };
    }

    const find = await prisma.kurikulum.findUnique({ where: { id: Number(id) } });
    if (!find) return { error: 'Kurikulum tidak ditemukan' };

    const { nama, status } = validated.data;

    const updated = await prisma.kurikulum.update({
        where: { id: Number(id) },
        data: {
            nama,
            status: status as StatusTahun,
        },
    });

    return { success: true, data: updated };
}

export async function updateStatus(id: number) {
    await requireAuth([Role.ADMIN]);

    const find = await prisma.kurikulum.findUnique({ where: { id: Number(id) } });
    if (!find) return { error: 'Kurikulum tidak ditemukan' };

    const newStatus = find.status === StatusTahun.ACTIVE ? StatusTahun.INACTIVE : StatusTahun.ACTIVE;

    const updated = await prisma.kurikulum.update({
        where: { id: Number(id) },
        data: {
            status: newStatus
        },
    });

    return { success: true, data: updated };
}
