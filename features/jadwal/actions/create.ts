'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { jadwalFormValues, jadwalSchema } from "../validations";

export async function create(formData: jadwalFormValues) {
  await requireAuth([Role.ADMIN]);

  const validated = jadwalSchema.safeParse(formData);
  if (!validated.success) {
    return { errors_message: 'Data jadwal tidak valid' };
  }

  const { matakuliahId, sks, dosenId, semester, kelas, fakultasId, jurusanId } = validated.data;

  return await prisma.$transaction(async (tx) => {
    const tahunAkademik = await tx.tahunAkademik.findFirst({
      where: { status: "ACTIVE" },
    });
    if (!tahunAkademik) {
      throw new Error("Tahun akademik aktif tidak ditemukan");
    }

    const dosen = await tx.dosen.findUnique({
      where: { id: BigInt(dosenId) },
    });
    if (!dosen) {
      return { errors_message: 'Dosen tidak ditemukan' };
    }

    const isExists = await tx.jadwal.findFirst({
      where: {
        tahunAkademikId: tahunAkademik.id,
        jurusanId: BigInt(jurusanId),
        fakultasId: BigInt(fakultasId),
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
      return { errors_message: `Jadwal kelas pada matakuliah ${isExists.Matakuliah.nama} semester ${semester} di prodi ${isExists.Jurusan.nama} telah terisi. Silakan cek kembali kelas yang dipilih.` };
    }

    const currentJadwal = await tx.jadwal.findMany({
      where: {
        tahunAkademikId: tahunAkademik.id,
        dosenId: BigInt(dosenId),
      },
    });

    const pengaturanJadwal = await tx.pengaturanJadwal.findFirst({
      where: {
        jenisDosen: dosen.status
      },
    });

    const currentSksTotal = currentJadwal.reduce((total, j) => total + (j.sks.toNumber() * j.kelas.length), 0);
    const addedSks = Number(sks) * kelas.length;
    const maxAllowedSks = pengaturanJadwal?.maxSks?.toNumber() || 0;

    if (currentSksTotal + addedSks > maxAllowedSks) {
      return { errors_message: `Total SKS (${currentSksTotal + addedSks}) yang dibebankan melebihi batas (${maxAllowedSks} SKS) pada semester ini.` };
    }

    const created = await tx.jadwal.create({
      data: {
        tahunAkademikId: tahunAkademik.id,
        sks: Number(sks),
        semester: Number(semester),
        dosenId: BigInt(dosenId),
        fakultasId: BigInt(fakultasId),
        jurusanId: BigInt(jurusanId),
        matakuliahId: BigInt(matakuliahId),
        totalSks: addedSks,
        kelas
      }
    });

    return { ...created, sks: created.sks.toNumber(), totalSks: created.totalSks?.toNumber() };
  });
}
