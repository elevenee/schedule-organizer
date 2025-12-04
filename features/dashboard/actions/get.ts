'use server'
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

interface GetProps {
    tahunAjaranId?: number;
    fakultasId?: number;
}
export async function GET_DASHBOARD({
    tahunAjaranId,
    fakultasId,
}: GetProps) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    let withDeleted = { deletedAt: null } as any;
    if (session?.user?.role !== 'ADMIN') {
        withDeleted = {};
    }

    if (session?.user?.role === 'FAKULTAS') {
        fakultasId = session.user.fakultasId || undefined;
    }

    const tahunAjaranFilter = tahunAjaranId ? { tahunAkademikId:tahunAjaranId } : {};

    const fakultasFilter = fakultasId ? { fakultasId } : {};

    const whereDosen = {
        ...fakultasFilter
    };

    const whereJadwal = {
        ...tahunAjaranFilter,
        ...fakultasFilter
    };
    
    const [totalDosenTetap, totalDosenTidaktetap, totalFakultas, totalJurusan, totalJadwal, totalJadwalRequestPending] = await Promise.all([
        prisma.dosen.count({ where: {...whereDosen, status: "TETAP"} }),
        prisma.dosen.count({ where: {...whereDosen, status: "TIDAK_TETAP"} }),
        prisma.fakultas.count(),
        prisma.jurusan.count({where: fakultasFilter}),
        prisma.jadwal.count({ where: whereJadwal }),
        prisma.jadwalRequest.count({ where: {...whereJadwal, status: 'PENDING'} }),
    ]);

    return { totalDosenTetap, totalDosenTidaktetap, totalFakultas, totalJurusan, totalJadwal, totalJadwalRequestPending };
}