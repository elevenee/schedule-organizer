'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, StatusJadwalRequest } from "@prisma/client";

export async function destroy(id: number) {
    const session = await requireAuth([Role.ADMIN, Role.FAKULTAS]);

    if (!id) throw new Error("ID pengajuan wajib diisi");

    const jadwal = await prisma.jadwalRequest.findUnique({
        where: { id: BigInt(id) }
    });
    
    if (!jadwal) throw new Error("Pengajuan jadwal tidak ditemukan");

    if (session.user.role === Role.FAKULTAS) {
        if (Number(jadwal.fakultasId) !== Number(session.user.fakultasId)) {
            throw new Error("FORBIDDEN: Anda tidak dapat menghapus pengajuan fakultas lain");
        }
        if (jadwal.status !== StatusJadwalRequest.PENDING) {
            throw new Error("Pengajuan yang sudah diproses tidak dapat dihapus");
        }
    }

    await prisma.jadwalRequest.delete({
        where: { id: BigInt(id) }
    });

    return true;
}

