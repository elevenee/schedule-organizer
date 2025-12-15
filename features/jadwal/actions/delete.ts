'use server'

import { prisma } from "@/lib/prisma";
export async function destroy(id: number) {

    if (!id) throw new Error("ID is required");

    const jadwal = await prisma.jadwal.findUnique({
        where: { id }
    });
    if (!jadwal) throw new Error("Jadwal not found");

    const findSisaSks = await prisma.sisaSks.findFirst({
        where: {
            fakultasId: jadwal?.fakultasId,
            jurusanId: jadwal?.jurusanId,
            dosenId: jadwal?.dosenId,
            matakuliahId: jadwal?.matakuliahId,
            semester: jadwal?.semester,
            tahunAkademikId: jadwal?.tahunAkademikId
        },
    })
    const kelasChanges = [...new Set([...jadwal.kelas, ...findSisaSks?.kelas ?? []])]
    await prisma.jadwal.delete({
        where: { id }
    });

    if (findSisaSks) {
        await prisma.sisaSks.update({
            where: { id: findSisaSks.id },
            data: {
                tahunAkademikId: jadwal?.tahunAkademikId,
                matakuliahId: jadwal.matakuliahId,
                sks: jadwal.sks,
                semester: jadwal.semester,
                dosenId: jadwal.dosenId,
                fakultasId: jadwal.fakultasId,
                jurusanId: jadwal.jurusanId,
                kelas: kelasChanges
            }
        })
    } else {
        await prisma.sisaSks.create({
            data: {
                tahunAkademikId: jadwal?.tahunAkademikId,
                matakuliahId: jadwal.matakuliahId,
                sks: jadwal.sks,
                semester: jadwal.semester,
                dosenId: jadwal.dosenId,
                fakultasId: jadwal.fakultasId,
                jurusanId: jadwal.jurusanId,
                kelas: kelasChanges
            }
        })
    }

    return true;
}