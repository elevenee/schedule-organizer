'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function destroy(id: number) {
    const session = await requireAuth([Role.ADMIN]);

    if (!id) throw new Error("ID wajib diisi");

    if (String(session.user.id) === String(id)) {
        throw new Error("Anda tidak dapat menghapus akun Anda sendiri");
    }

    const user = await prisma.user.findUnique({
        where: { id: BigInt(id) }
    });
    if (!user) throw new Error("Pengguna tidak ditemukan");

    await prisma.user.update({
        where: { id: BigInt(id) },
        data: { deletedAt: new Date() }
    });
    return true;
}
