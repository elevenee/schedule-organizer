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

  const totalSks = getCurrent.reduce((total, jadwal) => total + (jadwal.sks * jadwal.kelas.length), 0) + (Number(sks) * kelas.length);
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
    return await prisma.jadwal.create({
      data: data
    });
  } catch (error: any) {
    console.error("Error creating jadwal:", error.code);
    return { errors_message: 'Gagal membuat jadwal. Mungkin jadwal dengan data yang sama sudah ada.' };
  }
}
