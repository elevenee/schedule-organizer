'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function destroy(id: number) {
    await requireAuth([Role.ADMIN]);

    if (!id) throw new Error("ID tahun akademik wajib diisi");

    const tahunAkademik = await prisma.tahunAkademik.findUnique({
        where: { id: BigInt(id) }
    });
    if (!tahunAkademik) throw new Error("Tahun Akademik tidak ditemukan");

    if (tahunAkademik.deletedAt) {
        await prisma.tahunAkademik.delete({
            where: { id: BigInt(id) }
        });
    } else {
        await prisma.tahunAkademik.update({
            where: { id: BigInt(id) },
            data: { deletedAt: new Date() }
        });
    }

    return true;
}
