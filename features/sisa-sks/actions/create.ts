'use server';

import { prisma } from "@/lib/prisma";
import { sisaSksFormValues } from "../validations";

export async function create(formData: sisaSksFormValues) {
  const tahunAkademik = await prisma.tahunAkademik.findFirst({
    where: { status: "ACTIVE" },
  })
  if (!tahunAkademik) {
    throw new Error("Tahun akademik tidak ditemukan")
  }
  const findSisaSks = await prisma.sisaSks.findUnique({
    where: {
      id: formData.id ?? undefined
    }
  })
  if (!findSisaSks) {
    throw new Error("Sisa SKS tidak ditemukan")
  }

  const isExists = await prisma.jadwal.findFirst({
    where: {
      tahunAkademikId: tahunAkademik?.id,
      jurusanId: formData.jurusanId,
      fakultasId: formData.fakultasId,
      semester: Number(formData.semester),
      matakuliahId: Number(formData.matakuliahId),
      kelas: {
        hasSome: formData.kelas
      }
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
  const { matakuliahId, sks, dosenId, semester, kelas, fakultasId, jurusanId } = formData;

  if (isExists) {
    if (isExists.Jurusan?.jenjang == 'S1') {
      return { errors_message: `Jadwal kelas pada matakuliah ${isExists?.Matakuliah.nama} semester ${semester} di prodi ${isExists?.Jurusan?.nama} telah terisi. \n silahkan cek kembali kelas yang dipilih` };
    }
    // else if(parseFloat(formData.sks) === isExists.Matakuliah.sks){

    // }
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

  const isExistsMatkul = await prisma.jadwal.findFirst({
    where: {
      tahunAkademikId: tahunAkademik?.id,
      jurusanId: formData.jurusanId,
      fakultasId: formData.fakultasId,
      semester: Number(formData.semester),
      matakuliahId: Number(formData.matakuliahId),
      dosenId: Number(formData.dosenId),
    }
  })
  let data = {
    tahunAkademikId: BigInt(tahunAkademik?.id || 0),
    sks: Number(sks),
    semester: Number(semester),
    dosenId: Number(dosenId),
    fakultasId: Number(fakultasId),
    jurusanId: Number(jurusanId),
    matakuliahId: Number(matakuliahId),
    kelas: formData.kelas
  }
  if (isExists) {
    data = {
      ...data,
      kelas: isExists ? [...formData.kelas, ...isExists.kelas] : formData.kelas
    }
  } else if (isExistsMatkul) {
    data = {
      ...data,
      kelas: [...formData.kelas, ...isExistsMatkul.kelas].sort()
    }
  }

  try {
    let create;
    if (isExistsMatkul) {
      create = await prisma.jadwal.update({
        where: { id: isExistsMatkul.id },
        data: {
          kelas: data.kelas
        }
      })
    } else {
      create = await prisma.jadwal.create({
        data
      })
    }

    if (findSisaSks.kelas.length !== formData.kelas.length) {
      await prisma.sisaSks.update({
        where: { id: findSisaSks.id },
        data: {
          kelas: findSisaSks?.kelas.filter(item => !formData.kelas.includes(item))
        }
      })
    } else {
      await prisma.sisaSks.delete({
        where: { id: formData.id }
      })
    }
    return { success: true, data: { ...create, sks: create.sks.toNumber(), totalSks: create.totalSks?.toNumber() } };
  } catch (error) {
    console.log(error);
  }

}
