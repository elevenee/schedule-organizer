'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function destroy(id: number) {
    await requireAuth([Role.ADMIN]);

    if (!id) throw new Error("ID pengaturan jadwal wajib diisi");

    const pengaturan = await prisma.pengaturanJadwal.findUnique({
        where: { id: BigInt(id) }
    });
    if (!pengaturan) throw new Error("Pengaturan Jadwal tidak ditemukan");

    await prisma.pengaturanJadwal.delete({
        where: { id: BigInt(id) }
    });

    return true;
}
