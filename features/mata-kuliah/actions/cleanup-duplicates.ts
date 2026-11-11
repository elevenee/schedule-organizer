'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

function normalize(str: string | null | undefined): string {
    return (str || '')
        .replace(/['"`]/g, '')
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase();
}

export async function cleanupDuplicateMataKuliah() {
    await requireAuth([Role.ADMIN]);

    // 1. Ambil semua mata kuliah aktif yang belum di-softdelete beserta relasi kurikulum
    const matkuls = await prisma.mataKuliah.findMany({
        where: { deletedAt: null },
        include: {
            kurikulum: {
                select: { nama: true }
            },
            _count: {
                select: {
                    jadwals: true,
                    jadwalRequest: true,
                    sisaSks: true,
                }
            }
        },
        orderBy: [
            { updatedAt: 'desc' },
            { id: 'desc' }
        ]
    });

    // 2. Kelompokkan berdasarkan (normalized nama, jurusanId, normalized kurikulum nama)
    const groups = new Map<string, typeof matkuls>();

    for (const m of matkuls) {
        const matkulName = normalize(m.nama);
        const kurName = normalize(m.kurikulum?.nama);
        const jurusanId = m.jurusanId ? m.jurusanId.toString() : 'NONE';

        const key = `${matkulName}___${jurusanId}___${kurName}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(m);
    }

    const idsToSoftDelete: bigint[] = [];

    for (const [_, items] of groups.entries()) {
        if (items.length <= 1) continue;

        // Prioritas simpan: Yang memiliki relasi jadwal/request aktif, atau record paling baru
        items.sort((a, b) => {
            const aRel = a._count.jadwals + a._count.jadwalRequest + a._count.sisaSks;
            const bRel = b._count.jadwals + b._count.jadwalRequest + b._count.sisaSks;
            if (aRel !== bRel) return bRel - aRel;
            return Number(b.id - a.id);
        });

        const olderDuplicates = items.slice(1);
        for (const it of olderDuplicates) {
            idsToSoftDelete.push(it.id);
        }
    }

    if (idsToSoftDelete.length === 0) {
        return {
            success: true,
            count: 0,
            message: "Tidak ditemukan data mata kuliah duplikat untuk dihapus."
        };
    }

    // 3. Lakukan soft-delete dalam batch (updateMany)
    const now = new Date();
    const result = await prisma.mataKuliah.updateMany({
        where: {
            id: { in: idsToSoftDelete },
            deletedAt: null,
        },
        data: {
            deletedAt: now,
        }
    });

    return {
        success: true,
        count: result.count,
        message: `Berhasil melakukan soft-delete pada ${result.count} mata kuliah duplikat lama.`
    };
}
