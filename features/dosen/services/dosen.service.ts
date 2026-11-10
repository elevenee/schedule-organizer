'use server'
import { prisma } from "@/lib/prisma";

export async function upsertDosen(data: any) {
  let existingDosen = null;

  if (data.id) {
    existingDosen = await prisma.dosen.findUnique({ where: { id: data.id } });
  } else if (data.nip && typeof data.nip === 'string' && data.nip.trim() !== '') {
    existingDosen = await prisma.dosen.findFirst({ where: { nip: data.nip.trim() } });
  } else if (data.nidn && typeof data.nidn === 'string' && data.nidn.trim() !== '') {
    existingDosen = await prisma.dosen.findFirst({ where: { nidn: data.nidn.trim() } });
  } else if (data.nama) {
    existingDosen = await prisma.dosen.findFirst({ where: { nama: data.nama } });
  }

  if (existingDosen) {
    const { id, ...updateData } = data;
    return prisma.dosen.update({
      where: { id: existingDosen.id },
      data: updateData,
    });
  }

  return prisma.dosen.create({
    data,
  });
}
