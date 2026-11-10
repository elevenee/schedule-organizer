'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function destroy(id: number) {
    await requireAuth([Role.ADMIN]);

    if (!id) throw new Error("ID mata kuliah wajib diisi");

    const mataKuliah = await prisma.mataKuliah.findUnique({
        where: { id: BigInt(id) }
    });
    if (!mataKuliah) throw new Error("Mata kuliah tidak ditemukan");

    if (mataKuliah.deletedAt) {
        await prisma.mataKuliah.delete({
            where: { id: BigInt(id) }
        });
    } else {
        await prisma.mataKuliah.update({
            where: { id: BigInt(id) },
            data: { deletedAt: new Date() }
        });
    }

    return true;
}
