'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function destroy(id: number) {
    await requireAuth([Role.ADMIN]);

    if (!id) throw new Error("ID kurikulum wajib diisi");

    const kurikulum = await prisma.kurikulum.findUnique({
        where: { id: Number(id) }
    });

    if (!kurikulum) throw new Error("Kurikulum tidak ditemukan");

    await prisma.kurikulum.delete({
        where: { id: Number(id) }
    });

    return true;
}
