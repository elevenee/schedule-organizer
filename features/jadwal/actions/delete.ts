'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function destroy(id: number) {
    await requireAuth([Role.ADMIN]);

    if (!id) throw new Error("ID jadwal wajib diisi");

    return await prisma.$transaction(async (tx) => {
        const jadwal = await tx.jadwal.findUnique({
            where: { id: BigInt(id) }
        });
        if (!jadwal) throw new Error("Jadwal tidak ditemukan");

        const findSisaSks = await tx.sisaSks.findMany({
            where: {
                fakultasId: jadwal.fakultasId,
                jurusanId: jadwal.jurusanId,
                matakuliahId: jadwal.matakuliahId,
                semester: jadwal.semester,
                tahunAkademikId: jadwal.tahunAkademikId,
                kelas: {
                    hasSome: jadwal.kelas
                }
            },
        });

        if (findSisaSks.length > 0) {
            const ids = findSisaSks.map(item => item.id);
            await tx.sisaSks.deleteMany({ where: { id: { in: ids } } });
        } else {
            await tx.sisaSks.create({
                data: {
                    tahunAkademikId: jadwal.tahunAkademikId,
                    matakuliahId: jadwal.matakuliahId,
                    sks: jadwal.sks,
                    semester: jadwal.semester,
                    fakultasId: jadwal.fakultasId,
                    jurusanId: jadwal.jurusanId,
                    kelas: jadwal.kelas
                }
            });
        }

        await tx.jadwal.delete({ where: { id: BigInt(id) } });
        return true;
    });
}
