'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { jadwalFormValues, jadwalSchema } from "../validations";

export async function create(formData: jadwalFormValues) {
  const session = await requireAuth([Role.FAKULTAS, Role.ADMIN]);

  const validated = jadwalSchema.safeParse(formData);
  if (!validated.success) {
    return { errors_message: 'Data pengajuan jadwal tidak valid' };
  }

  const { matakuliahId, sks, dosenId, semester, kelas, jurusanId } = validated.data;

  let fakultasId: number | null = null;
  if (session.user.role === Role.FAKULTAS) {
    if (!session.user.fakultasId) {
      throw new Error("Akun Anda tidak terasosiasi dengan fakultas mana pun");
    }
    fakultasId = Number(session.user.fakultasId);

    // Verify jurusanId belongs to this fakultas
    const jurusan = await prisma.jurusan.findUnique({
      where: { id: BigInt(jurusanId) }
    });
    if (!jurusan || Number(jurusan.fakultasId) !== fakultasId) {
      return { errors_message: 'Program studi yang dipilih tidak berada di bawah wewenang fakultas Anda' };
    }
  } else {
    fakultasId = formData.fakultasId ? Number(formData.fakultasId) : null;
    if (!fakultasId) {
      return { errors_message: 'Fakultas wajib dipilih' };
    }
  }

  const tahunAkademik = await prisma.tahunAkademik.findFirst({
    where: { status: "ACTIVE" },
  });
  if (!tahunAkademik) {
    throw new Error("Tahun akademik aktif tidak ditemukan");
  }

  const findMatkul = await prisma.mataKuliah.findFirst({
    where: { id: BigInt(matakuliahId) }
  });

  const [getCurrent, getCurrentPengajuan, getDosen, isExist] = await Promise.all([
    prisma.jadwal.findMany({
      where: {
        tahunAkademikId: tahunAkademik.id,
        dosenId: BigInt(dosenId),
      },
    }),
    prisma.jadwalRequest.findMany({
      where: {
        tahunAkademikId: tahunAkademik.id,
        dosenId: BigInt(dosenId),
        status: 'PENDING'
      },
    }),
    prisma.dosen.findUnique({
      where: { id: BigInt(dosenId) },
    }),
    prisma.jadwalRequest.findFirst({
      where: {
        tahunAkademikId: tahunAkademik.id,
        semester: Number(semester),
        Matakuliah: { nama: findMatkul?.nama },
        jurusanId: BigInt(jurusanId),
        kelas: { hasSome: kelas }
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
    })
  ]);

  if (!getDosen) {
    return { errors_message: 'Dosen tidak ditemukan' };
  }

  const getPengaturanJadwal = await prisma.pengaturanJadwal.findFirst({
    where: {
      jenisDosen: getDosen.status,
    },
  });

  if (isExist && isExist.Jurusan?.jenjang === 'S1') {
    return { errors_message: `Jadwal kelas pada matakuliah ${isExist.Matakuliah.nama} semester ${semester} di prodi ${isExist.Jurusan.nama} telah terisi. Silakan periksa kembali kelas yang dipilih.` };
  }

  const addedSks = Number(sks) * kelas.length;
  const maxAllowedSks = getPengaturanJadwal?.maxSks?.toNumber() || 0;

  const totalSksJadwal = getCurrent.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + addedSks;
  if (totalSksJadwal > maxAllowedSks) {
    return { errors_message: `Total SKS terjadwal (${totalSksJadwal}) melebihi batas (${maxAllowedSks} SKS) pada semester ini.` };
  }

  const totalSksPengajuan = getCurrentPengajuan.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + addedSks;
  if (totalSksPengajuan > maxAllowedSks) {
    return { errors_message: `Total SKS pengajuan pending (${totalSksPengajuan}) melebihi batas (${maxAllowedSks} SKS) pada semester ini.` };
  }

  const data = {
    tahunAkademikId: tahunAkademik.id,
    matakuliahId: BigInt(matakuliahId),
    sks: Number(sks),
    semester: Number(semester),
    dosenId: BigInt(dosenId),
    fakultasId: BigInt(fakultasId),
    jurusanId: BigInt(jurusanId),
    totalSks: addedSks,
    kelas
  };

  try {
    const created = await prisma.jadwalRequest.create({
      data
    });
    return { ...created, sks: created.sks.toNumber(), totalSks: created.totalSks?.toNumber() };
  } catch (error: any) {
    console.error("Error creating jadwalRequest:", error?.code || error);
    return { errors_message: 'Gagal membuat pengajuan jadwal. Mungkin jadwal dengan data yang sama sudah ada.' };
  }
}
