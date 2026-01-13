'use server';

import { prisma } from "@/lib/prisma";
import { jadwalFormValues } from "../validations";
export async function update(id: number, formData: jadwalFormValues) {
    const find = await prisma.jadwal.findUnique({ where: { id } });
    if (!find) return { error: 'Jadwal tidak ditemukan' };

    const { matakuliahId, sks, dosenId, semester, kelas } = formData;
    const isExists = await prisma.jadwal.findFirst({
        where: {
            tahunAkademikId: find.tahunAkademikId,
            jurusanId: find.jurusanId,
            fakultasId: find.fakultasId,
            semester: Number(semester),
            matakuliahId: matakuliahId,
            dosenId: { notIn: [dosenId] },
            kelas: { hasSome: kelas },
        },
        include: {
            Jurusan: {
                select: {
                    id: true,
                    nama: true,
                    jenjang: true
                }
            },
            Matakuliah: true
        }
    });

    if (isExists) {
        if (isExists.Jurusan?.jenjang == 'S1') {
            return { errors_message: `Jadwal kelas pada matakuliah ${isExists?.Matakuliah?.nama} semester ${semester} di prodi ${isExists?.Jurusan?.nama} telah terisi. \n silahkan cek kembali kelas yang dipilih` };
        }
    }
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
            tahunAkademikId: find?.tahunAkademikId,
            kelas: {
                hasSome: find.kelas
            }
        },
    });

    let kelasChanges = [];
    const kelasFind = find.kelas.length ? find.kelas : [];

    if (kelas.length < kelasFind.length) {
        const set1 = new Set(kelas);
        kelasChanges = kelasFind.filter(item => !set1.has(item));
    } else {
        const set1 = new Set(kelasFind);
        kelasChanges = kelas.filter(item => !set1.has(item));
    }

    let updated = null;
    if (findSisaSks) {
        const [upjadwal, upsks] = await prisma.$transaction([
            prisma.jadwal.update({
                where: { id },
                data: updateData,
            }),
            prisma.sisaSks.update({
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
        ]);
        updated = upjadwal;
    } else {
        const [upjadwal, crsisa] = await prisma.$transaction([
            prisma.jadwal.update({
                where: { id },
                data: updateData,
            }),
            prisma.sisaSks.create({
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
        ]);
        updated = upjadwal;
    }

    return { success: true, data: { ...updated, sks: updated.sks.toNumber(), totalSks: updated.totalSks?.toNumber() } };
}