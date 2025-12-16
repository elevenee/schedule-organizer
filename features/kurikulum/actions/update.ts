'use server';

import { prisma } from "@/lib/prisma";
import { kurikulumFormValues } from "../validations";
import { SemesterPeriode, StatusTahun } from "@prisma/client";

export async function update(id: number, formData: kurikulumFormValues) {
    const find = await prisma.kurikulum.findUnique({ where: { id } });
    if (!find) return { error: 'Tahun Akademik tidak ditemukan' };

    const { nama, status } = formData;

    let updateData = {
        nama,
        status: status as StatusTahun,
    }

    const updated = await prisma.kurikulum.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}

export async function updateStatus(id: number) {
    const find = await prisma.kurikulum.findUnique({ where: { id } });
    if (!find) return { error: 'Kurikulum tidak ditemukan' };

    const updated = await prisma.kurikulum.update({
        where: { id },
        data: {
            status: find.status as StatusTahun
        },
    });

    return { success: true, data: updated };
}