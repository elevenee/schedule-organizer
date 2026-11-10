'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function destroy(id: number) {
    await requireAuth([Role.ADMIN]);

    if (!id) throw new Error("ID program studi wajib diisi");

    const program_studi = await prisma.jurusan.findUnique({
        where: { id: BigInt(id) }
    });
    if (!program_studi) throw new Error("Program studi tidak ditemukan");

    await prisma.jurusan.update({
        where: { id: BigInt(id) },
        data: { deletedAt: new Date() }
    });
    return true;
}
