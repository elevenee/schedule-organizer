'use server';

import { prisma } from "@/lib/prisma";
import { sisaSksFormValues } from "../validations";
export async function update(id: number, formData: sisaSksFormValues) {
    const find = await prisma.jadwal.findUnique({ where: { id } });
    if (!find) return { error: 'Jadwal tidak ditemukan' };

    const { matakuliahId, sks, dosenId, semester, kelas } = formData;
    const updateData = {
        matakuliahId,
        sks: Number(sks),
        semester: Number(semester),
        dosenId: Number(dosenId),
        kelas
    }
    const findSisaSks = await prisma.sisaSks.findFirst({
        where: {
            fakultasId: find?.fakultasId,
            jurusanId: find?.jurusanId,
            matakuliahId: find?.matakuliahId,
            semester: find?.semester,
            tahunAkademikId: find?.tahunAkademikId
        },
    })
    let kelasChanges = [...new Set([...kelas, ...findSisaSks?.kelas ?? []])];
    const updated = await prisma.jadwal.update({
        where: { id },
        data: updateData,
    });

    if (findSisaSks) {
        await prisma.sisaSks.update({
            where: { id: findSisaSks.id },
            data: {
                tahunAkademikId: find?.tahunAkademikId,
                matakuliahId: find.matakuliahId,
                sks: find.sks,
                semester: find.semester,
                fakultasId: find.fakultasId,
                jurusanId: find.jurusanId,
                kelas: kelasChanges
            }
        })
    } else {
        await prisma.sisaSks.create({
            data: {
                tahunAkademikId: find?.tahunAkademikId,
                matakuliahId: find.matakuliahId,
                sks: find.sks,
                semester: find.semester,
                fakultasId: find.fakultasId,
                jurusanId: find.jurusanId,
                kelas: kelasChanges
            }
        })
    }

    return { success: true, data: { ...updated, sks: updated.sks.toNumber(), totalSks: updated.totalSks?.toNumber() } };
}