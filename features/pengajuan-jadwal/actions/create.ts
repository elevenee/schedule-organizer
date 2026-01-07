'use server';

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { jadwalFormValues } from "../validations";

export async function create(formData: jadwalFormValues) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (session.user?.role !== 'FAKULTAS') throw new Error("Unauthorized");
  const fakultas = session.user?.fakultasId;

  const tahunAkademik = await prisma.tahunAkademik.findFirst({
    where: { status: "ACTIVE" },
  })
  if (!tahunAkademik) {
    throw new Error("Tahun akademik tidak ditemukan")
  }

  const { matakuliahId, sks, dosenId, semester, kelas, jurusanId } = formData;

  const getCurrent = await prisma.jadwal.findMany({
    where: {
      tahunAkademikId: BigInt(tahunAkademik?.id || 0),
      dosenId: Number(dosenId),
    },
    include: { Dosen: true }
  });
  const getCurrentPengajuan = await prisma.jadwalRequest.findMany({
    where: {
      tahunAkademikId: BigInt(tahunAkademik?.id || 0),
      dosenId: Number(dosenId),
      status: {
        in: ['PENDING']
      }
    },
    include: { Dosen: true }
  });

  const getDosen = await prisma.dosen.findUnique({
    where: {
      id: Number(dosenId),
    },
  }); 

  const getPengaturanJadwal = await prisma.pengaturanJadwal.findFirst({
    where: {
      jenisDosen: getDosen?.status,
    },
  });

  const totalSks = getCurrent.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + (Number(sks) * kelas.length);
  if (totalSks > (getPengaturanJadwal?.maxSks?.toNumber() || 0)) {
    return { errors_message: 'Total SKS yang dibebankan melebihi batas pada semester ini.' };
  }
  const totalSksPengajuan = getCurrentPengajuan.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + (Number(sks) * kelas.length);
  if (totalSksPengajuan > (getPengaturanJadwal?.maxSks?.toNumber() || 0)) {
    return { errors_message: 'Total SKS yang dibebankan melebihi batas pada semester ini.' };
  }
  const data = {
    tahunAkademikId: BigInt(tahunAkademik?.id || 0),
    matakuliahId,
    sks: Number(sks),
    semester: Number(semester),
    dosenId: Number(dosenId),
    fakultasId: Number(fakultas),
    jurusanId: Number(jurusanId),
    totalSks: Number(sks) * kelas.length,
    kelas
  }
  try {
    const create = await prisma.jadwalRequest.create({
      data: data
    });
    return {...create, sks: create.sks.toNumber(), totalSks: create.totalSks?.toNumber()}
  } catch (error: any) {
    console.error("Error creating jadwal:", error.code);
    return { errors_message: 'Gagal membuat jadwal. Mungkin jadwal dengan data yang sama sudah ada.' };
  }
}
