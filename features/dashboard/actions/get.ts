'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

interface GetProps {
    tahunAjaranId?: number;
    fakultasId?: number;
}

export async function GET_DASHBOARD({
    tahunAjaranId,
    fakultasId,
}: GetProps) {
    const session = await requireAuth();

    let targetFakultasId = fakultasId;
    if (session.user.role === Role.FAKULTAS) {
        targetFakultasId = session.user.fakultasId ? Number(session.user.fakultasId) : undefined;
    }

    const tahunAjaranFilter = tahunAjaranId ? { tahunAkademikId: BigInt(tahunAjaranId) } : {};
    const fakultasFilter = targetFakultasId ? { fakultasId: BigInt(targetFakultasId) } : {};

    const whereDosen = {
        ...fakultasFilter,
        deletedAt: null,
        isActive: true,
    };

    const whereJadwal = {
        ...tahunAjaranFilter,
        ...fakultasFilter,
    };
    
    const [totalDosenTetap, totalDosenTidaktetap, totalFakultas, totalJurusan, totalJadwal, totalJadwalRequestPending] = await Promise.all([
        prisma.dosen.count({ where: { ...whereDosen, status: "TETAP" } }),
        prisma.dosen.count({ where: { ...whereDosen, status: "TIDAK_TETAP" } }),
        prisma.fakultas.count(),
        prisma.jurusan.count({ where: { ...fakultasFilter, deletedAt: null } }),
        prisma.jadwal.count({ where: whereJadwal }),
        prisma.jadwalRequest.count({ where: { ...whereJadwal, status: 'PENDING' } }),
    ]);

    return { totalDosenTetap, totalDosenTidaktetap, totalFakultas, totalJurusan, totalJadwal, totalJadwalRequestPending };
}
