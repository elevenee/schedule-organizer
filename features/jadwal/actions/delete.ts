'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const jadwal = await prisma.jadwal.findUnique({
        where: { id }
    });
    if (!jadwal) throw new Error("Jadwal not found");

    const findSisaSks = await prisma.sisaSks.findMany({
        where: {
            fakultasId: jadwal?.fakultasId,
            jurusanId: jadwal?.jurusanId,
            matakuliahId: jadwal?.matakuliahId,
            semester: jadwal?.semester,
            tahunAkademikId: jadwal?.tahunAkademikId,
            kelas: {
                hasSome: jadwal.kelas
            }
        },
    })

    if (findSisaSks.length > 0) {
        const ids = findSisaSks.map(item => item.id);
        await prisma.$transaction([
            prisma.sisaSks.deleteMany({ where: { id: { in: ids } } }),
            prisma.jadwal.delete({ where: { id } })
        ])
    } else {
        await prisma.$transaction([
            prisma.sisaSks.create({
                data: {
                    tahunAkademikId: jadwal?.tahunAkademikId,
                    matakuliahId: jadwal.matakuliahId,
                    sks: jadwal.sks,
                    semester: jadwal.semester,
                    fakultasId: jadwal.fakultasId,
                    jurusanId: jadwal.jurusanId,
                    kelas: jadwal.kelas
                }
            }),
            prisma.jadwal.delete({ where: { id } })
        ])
    }

    return true;
}