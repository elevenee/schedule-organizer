'use server';

import { prisma } from "@/lib/prisma";
import { tahunAkademikFormValues } from "../validations";
import { SemesterPeriode, StatusTahun } from "@prisma/client";

export async function update(id: number, formData: tahunAkademikFormValues) {
    const find = await prisma.tahunAkademik.findUnique({ where: { id } });
    if (!find) return { error: 'Tahun Akademik tidak ditemukan' };

    const { name, status, semester } = formData;

    let updateData = {
        name,
        status: status as StatusTahun,
        semester: semester as SemesterPeriode
    }

    const updated = await prisma.tahunAkademik.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}

export async function updateStatus(id: number) {
    const find = await prisma.tahunAkademik.findUnique({ where: { id } });
    if (!find) return { error: 'Tahun Akademik tidak ditemukan' };

    const updated = await prisma.tahunAkademik.update({
        where: { id },
        data: {
            status: find.status as StatusTahun
        },
    });

    return { success: true, data: updated };
}