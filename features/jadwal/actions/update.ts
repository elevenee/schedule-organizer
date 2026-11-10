'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { jadwalFormValues, jadwalSchema } from "../validations";

export async function update(id: number, formData: jadwalFormValues) {
    await requireAuth([Role.ADMIN]);

    const validated = jadwalSchema.safeParse(formData);
    if (!validated.success) {
        return { errors_message: 'Data jadwal tidak valid' };
    }

    const { matakuliahId, sks, dosenId, semester, kelas } = validated.data;

    return await prisma.$transaction(async (tx) => {
        const find = await tx.jadwal.findUnique({
            where: { id: BigInt(id) },
            include: {
                Matakuliah: true
            }
        });
        if (!find) return { error: 'Jadwal tidak ditemukan' };

        const isExists = await tx.jadwal.findFirst({
            where: {
                id: { not: BigInt(id) },
                tahunAkademikId: find.tahunAkademikId,
                jurusanId: find.jurusanId,
                fakultasId: find.fakultasId,
                semester: Number(semester),
                matakuliahId: BigInt(matakuliahId),
                kelas: { hasSome: kelas },
            },
            include: {
                Jurusan: {
                    select: {
                        nama: true,
                        jenjang: true
                    }
                },
                Matakuliah: true
            }
        });

        if (isExists && isExists.Jurusan?.jenjang === 'S1') {
            return { errors_message: `Jadwal kelas pada matakuliah ${isExists?.Matakuliah?.nama} semester ${semester} di prodi ${isExists?.Jurusan?.nama} telah terisi. Silakan cek kembali kelas yang dipilih.` };
        }

        const updateData = {
            matakuliahId: BigInt(matakuliahId),
            sks: Number(sks),
            semester: Number(semester),
            dosenId: BigInt(dosenId),
            totalSks: Number(sks) * kelas.length,
            kelas
        };

        const updated = await tx.jadwal.update({
            where: { id: BigInt(id) },
            data: updateData,
        });

        return { success: true, data: updated };
    });
}
