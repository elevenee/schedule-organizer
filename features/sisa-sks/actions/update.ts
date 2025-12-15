'use server';

import { prisma } from "@/lib/prisma";
import { sisaSksFormValues } from "../validations";
export async function update(id: number, formData: sisaSksFormValues) {
    const tahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: "ACTIVE" },
    })
    if (!tahunAkademik) {
        throw new Error("Tahun akademik tidak ditemukan")
    }
    const isExists = await prisma.jadwal.findFirst({
        where: {
            tahunAkademikId: tahunAkademik?.id,
            jurusanId: formData.jurusanId,
            fakultasId: formData.fakultasId,
            semester: Number(formData),
            matakuliahId: Number(formData.matakuliahId),
            dosenId: Number(formData.dosenId),
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
    if (!isExists) return { error: 'Jadwal tidak ditemukan' };

    const { matakuliahId, sks, dosenId, semester, kelas, fakultasId, jurusanId } = formData;

    if (isExists) {
        if (isExists.Jurusan?.jenjang == 'S1') {
            return { errors_message: `Jadwal kelas pada matakuliah ${isExists?.Matakuliah.nama} semester ${semester} di prodi ${isExists?.Jurusan?.nama} telah terisi. \n silahkan cek kembali kelas yang dipilih` };
        }
    }
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
        sks: Number(sks),
        semester: Number(semester),
        dosenId: Number(dosenId),
        fakultasId: Number(fakultasId),
        jurusanId: Number(jurusanId),
        matakuliahId: Number(matakuliahId),
        kelas: [...formData.kelas, ...isExists.kelas]
    }

    const create = await prisma.jadwal.create({
        data
    })

    return { success: true, data: { ...create, sks: create.sks.toNumber(), totalSks: create.totalSks?.toNumber() } };
}