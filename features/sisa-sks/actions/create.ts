'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { sisaSksFormValues } from "../validations";

export async function create(formData: sisaSksFormValues) {
  await requireAuth([Role.ADMIN]);

  return await prisma.$transaction(async (tx) => {
    const tahunAkademik = await tx.tahunAkademik.findFirst({
      where: { status: "ACTIVE" },
    });
    if (!tahunAkademik) {
      throw new Error("Tahun akademik aktif tidak ditemukan");
    }

    const findSisaSks = await tx.sisaSks.findUnique({
      where: {
        id: formData.id ? BigInt(formData.id) : undefined
      }
    });
    if (!findSisaSks) {
      throw new Error("Sisa SKS tidak ditemukan");
    }

    const { matakuliahId, sks, dosenId, semester, kelas, fakultasId, jurusanId } = formData;

    const isExists = await tx.jadwal.findFirst({
      where: {
        tahunAkademikId: tahunAkademik.id,
        jurusanId: BigInt(jurusanId),
        fakultasId: BigInt(fakultasId),
        semester: Number(semester),
        matakuliahId: BigInt(matakuliahId),
        kelas: {
          hasSome: kelas
        }
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
      return { errors_message: `Jadwal kelas pada matakuliah ${isExists.Matakuliah.nama} semester ${semester} di prodi ${isExists.Jurusan.nama} telah terisi.` };
    }

    const dosen = await tx.dosen.findUnique({
      where: { id: BigInt(dosenId) },
    });
    if (!dosen) {
      return { errors_message: 'Dosen tidak ditemukan' };
    }

    const getCurrent = await tx.jadwal.findMany({
      where: {
        tahunAkademikId: tahunAkademik.id,
        dosenId: BigInt(dosenId),
      },
    });

    const getPengaturanJadwal = await tx.pengaturanJadwal.findFirst({
      where: {
        jenisDosen: dosen.status
      },
    });

    const totalSks = getCurrent.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + (Number(sks) * kelas.length);
    const maxAllowedSks = getPengaturanJadwal?.maxSks?.toNumber() || 0;
    if (totalSks > maxAllowedSks) {
      return { errors_message: `Total SKS (${totalSks}) melebihi batas (${maxAllowedSks} SKS) pada semester ini.` };
    }

    const isExistsMatkul = await tx.jadwal.findFirst({
      where: {
        tahunAkademikId: tahunAkademik.id,
        jurusanId: BigInt(jurusanId),
        fakultasId: BigInt(fakultasId),
        semester: Number(semester),
        matakuliahId: BigInt(matakuliahId),
        dosenId: BigInt(dosenId),
      }
    });

    let mergedClasses = [...kelas];
    if (isExists) {
      mergedClasses = Array.from(new Set([...kelas, ...isExists.kelas])).sort();
    } else if (isExistsMatkul) {
      mergedClasses = Array.from(new Set([...kelas, ...isExistsMatkul.kelas])).sort();
    }

    let scheduleRecord;
    if (isExistsMatkul) {
      scheduleRecord = await tx.jadwal.update({
        where: { id: isExistsMatkul.id },
        data: {
          kelas: mergedClasses,
          totalSks: Number(sks) * mergedClasses.length
        }
      });
    } else {
      scheduleRecord = await tx.jadwal.create({
        data: {
          tahunAkademikId: tahunAkademik.id,
          sks: Number(sks),
          semester: Number(semester),
          dosenId: BigInt(dosenId),
          fakultasId: BigInt(fakultasId),
          jurusanId: BigInt(jurusanId),
          matakuliahId: BigInt(matakuliahId),
          totalSks: Number(sks) * mergedClasses.length,
          kelas: mergedClasses
        }
      });
    }

    const remainingClasses = findSisaSks.kelas.filter(item => !kelas.includes(item));
    if (remainingClasses.length > 0) {
      await tx.sisaSks.update({
        where: { id: findSisaSks.id },
        data: {
          kelas: remainingClasses
        }
      });
    } else {
      await tx.sisaSks.delete({
        where: { id: findSisaSks.id }
      });
    }

    return { 
      success: true, 
      data: { 
        ...scheduleRecord, 
        sks: scheduleRecord.sks.toNumber(), 
        totalSks: scheduleRecord.totalSks?.toNumber() 
      } 
    };
  });
}
