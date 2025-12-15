'use server';

import { prisma } from "@/lib/prisma";
import { jadwalFormValues, statusJadwalFormValues } from "../validations";
import { StatusJadwalRequest } from "@prisma/client";
export async function update(id: number, formData: jadwalFormValues) {

    const find = await prisma.jadwalRequest.findUnique({ where: { id } });
    if (!find) return { error: 'Jadwal tidak ditemukan' };

    const { matakuliahId, sks, dosenId, semester, kelas } = formData;
    const updateData = {
        matakuliahId,
        sks: Number(sks),
        semester: Number(semester),
        dosenId: Number(dosenId),
        kelas
    }
    const updated = await prisma.jadwalRequest.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}

export async function updateStatus(id: number, formData: statusJadwalFormValues) {
    const find = await prisma.jadwalRequest.findUnique({ where: { id } });
    if (!find) return { error: 'Jadwal tidak ditemukan' };

    const tahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: "ACTIVE" },
    })
    if (!tahunAkademik) {
        throw new Error("Tahun akademik tidak ditemukan")
    }

    if (formData.status === 'APPROVED') {
        const { matakuliahId, sks, dosenId, semester, kelas, fakultasId, jurusanId } = find;
        const getCurrent = await prisma.jadwal.findMany({
            where: {
                tahunAkademikId: BigInt(tahunAkademik?.id || 0),
                dosenId: Number(dosenId),
            },
            include: { Dosen: true }
        });

        const getPengaturanJadwal = await prisma.pengaturanJadwal.findFirst({
            where: {
                jenisDosen: getCurrent[0]?.Dosen?.status
            },
        });

        const totalSks = getCurrent.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + (Number(sks) * kelas.length);
        if (totalSks > (getPengaturanJadwal?.maxSks?.toNumber() || 0)) {
            return { errors_message: 'Total SKS yang dibebankan melebihi batas pada semester ini.' };
        }

        const data = {
            tahunAkademikId: BigInt(tahunAkademik?.id || 0),
            matakuliahId,
            sks: sks.toNumber(),
            semester: Number(semester),
            dosenId: Number(dosenId),
            fakultasId: Number(fakultasId),
            jurusanId: Number(jurusanId),
            totalSks: sks.toNumber() * kelas.length,
            kelas
        }
        const [updated, created] = await Promise.all([
            await prisma.jadwalRequest.update({
                where: { id },
                data: {
                    status: formData.status as StatusJadwalRequest,
                    keteranganAdmin: formData.keteranganAdmin as string || null,
                },
            }),
            await prisma.jadwal.create({
                data: data
            })
        ]);

        return { success: true, data: { ...updated, sks: updated.sks.toNumber(), totalSks: updated.totalSks?.toNumber() }, created: created ? true : false };
    } else {
        const updated = await prisma.jadwalRequest.update({
            where: { id },
            data: {
                status: formData.status as StatusJadwalRequest,
                keteranganAdmin: formData.keteranganAdmin as string || null,
            },
        });
        return { success: true, data: updated };
    }
}