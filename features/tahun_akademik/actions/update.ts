'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, SemesterPeriode, StatusTahun } from "@prisma/client";
import { tahunAkademikFormValues, tahunAkademikSchema } from "../validations";

export async function update(id: number, formData: tahunAkademikFormValues) {
    await requireAuth([Role.ADMIN]);

    const validated = tahunAkademikSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Validasi tahun akademik gagal', details: validated.error.flatten().fieldErrors };
    }

    const find = await prisma.tahunAkademik.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'Tahun Akademik tidak ditemukan' };

    const { name, status, semester } = validated.data;
    const targetStatus = status as StatusTahun;

    const updated = await prisma.$transaction(async (tx) => {
        if (targetStatus === StatusTahun.ACTIVE) {
            await tx.tahunAkademik.updateMany({
                where: {
                    id: { not: BigInt(id) },
                    status: StatusTahun.ACTIVE
                },
                data: { status: StatusTahun.INACTIVE }
            });
        }

        return await tx.tahunAkademik.update({
            where: { id: BigInt(id) },
            data: {
                name,
                status: targetStatus,
                semester: semester as SemesterPeriode
            },
        });
    });

    return { success: true, data: updated };
}

export async function updateStatus(id: number) {
    await requireAuth([Role.ADMIN]);

    const find = await prisma.tahunAkademik.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'Tahun Akademik tidak ditemukan' };

    const newStatus = find.status === StatusTahun.ACTIVE ? StatusTahun.INACTIVE : StatusTahun.ACTIVE;

    const updated = await prisma.$transaction(async (tx) => {
        if (newStatus === StatusTahun.ACTIVE) {
            await tx.tahunAkademik.updateMany({
                where: {
                    id: { not: BigInt(id) },
                    status: StatusTahun.ACTIVE
                },
                data: { status: StatusTahun.INACTIVE }
            });
        }

        return await tx.tahunAkademik.update({
            where: { id: BigInt(id) },
            data: {
                status: newStatus
            },
        });
    });

    return { success: true, data: updated };
}
