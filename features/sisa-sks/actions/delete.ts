'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function destroy(id: number) {
    await requireAuth([Role.ADMIN]);

    if (!id) throw new Error("ID sisa SKS wajib diisi");

    const sisaSks = await prisma.sisaSks.findUnique({
        where: { id: BigInt(id) }
    });
    if (!sisaSks) throw new Error("Sisa SKS tidak ditemukan");

    await prisma.sisaSks.delete({
        where: { id: BigInt(id) }
    });

    return true;
}
