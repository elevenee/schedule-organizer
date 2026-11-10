'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function destroy(id: number) {
    await requireAuth([Role.ADMIN]);

    if (!id) throw new Error("ID dosen wajib diisi");

    const dosen = await prisma.dosen.findUnique({
        where: { id: BigInt(id) }
    });
    if (!dosen) throw new Error("Dosen tidak ditemukan");

    if (dosen.deletedAt) {
        await prisma.dosen.delete({
            where: { id: BigInt(id) }
        });
    } else {
        await prisma.dosen.update({
            where: { id: BigInt(id) },
            data: { deletedAt: new Date() }
        });
    }

    return true;
}
