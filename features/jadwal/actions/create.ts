'use server';

import { prisma } from "@/lib/prisma";
import { jadwalFormValues } from "../validations";

export async function create(formData: jadwalFormValues) {
  const tahunAkademik = await prisma.tahunAkademik.findFirst({
    where: { status: "ACTIVE" },
  })
  if (!tahunAkademik) {
    throw new Error("Tahun akademik tidak ditemukan")
  }

  const { matakuliah, sks, dosenId, semester, kelas, fakultasId, jurusanId } = formData;

  const isExists = await prisma.jadwal.findFirst({
    where: {
      tahunAkademikId: BigInt(tahunAkademik?.id || 0),
      jurusanId: jurusanId,
      fakultasId: fakultasId,
      semester: Number(semester),
      matakuliah: matakuliah,
      kelas: { hasSome: kelas },
    },
    include:{
      Jurusan: {
        select:{
          id: true,
          nama: true,
          jenjang: true
        }
      }
    }
  });

  if (isExists) {
    if (isExists.Jurusan?.jenjang == 'S1') {
      return { errors_message: `Jadwal kelas pada matakuliah ${matakuliah} semester ${semester} di prodi ${isExists?.Jurusan?.nama} telah terisi. \n silahkan cek kembali kelas yang dipilih` };
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
    matakuliah,
    sks: Number(sks),
    semester: Number(semester),
    dosenId: Number(dosenId),
    fakultasId: Number(fakultasId),
    jurusanId: Number(jurusanId),
    kelas
  }
  try {
    const create = await prisma.jadwal.create({
      data: data
    });
    return { ...create, sks: create.sks.toNumber(), totalSks: create.totalSks?.toNumber() }

  } catch (error: any) {
    console.error("Error creating jadwal:", error.code);
    return { errors_message: 'Gagal membuat jadwal. Mungkin jadwal dengan data yang sama sudah ada.' };
  }
}
