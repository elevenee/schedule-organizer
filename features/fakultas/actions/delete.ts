'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function destroy(id: number) {
    await requireAuth([Role.ADMIN]);

    if (!id) throw new Error("ID fakultas wajib diisi");

    const fakultas = await prisma.fakultas.findUnique({
        where: { id: BigInt(id) }
    });
    if (!fakultas) throw new Error("Fakultas tidak ditemukan");

    await prisma.fakultas.delete({
        where: { id: BigInt(id) }
    });
    return true;
}
