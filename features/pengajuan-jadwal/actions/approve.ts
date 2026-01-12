'use server';

import { prisma } from "@/lib/prisma";
import { StatusJadwalRequest } from "@prisma/client";

export async function approveRequest(id: number, formData: any) {
    const find = await prisma.jadwalRequest.findUnique({ where: { id } });
    if (!find) return { error: 'Jadwal tidak ditemukan' };

    const tahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: "ACTIVE" },
    })
    if (!tahunAkademik) {
        throw new Error("Tahun akademik tidak ditemukan")
    }

    const { matakuliahId, sks, dosenId, semester, kelas, fakultasId, jurusanId } = formData;
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
        sks: Number(sks),
        semester: Number(semester),
        dosenId: Number(dosenId),
        fakultasId: Number(fakultasId),
        jurusanId: Number(jurusanId),
        totalSks: Number(sks) * kelas.length,
        kelas
    }

    const [updated, created] = await Promise.all([
        await prisma.jadwalRequest.update({
            where: { id },
            data: {
                status: StatusJadwalRequest.APPROVED,
                keteranganAdmin: formData.keteranganAdmin as string || null,
            },
        }),
        await prisma.jadwal.create({
            data: data
        }),
    ]);

    const isSame =
        find.kelas.length === kelas.length &&
        new Set(find.kelas).size === new Set(kelas).size &&
        find.kelas.every(item => new Set(kelas).has(item));

    if (isSame === false) {
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
            kelasChanges = kelas.filter((item: any) => !set1.has(item));
        }

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
    }

    return { success: true, data: { ...updated, sks: updated.sks.toNumber(), totalSks: updated.totalSks?.toNumber() }, created: created ? true : false };
}