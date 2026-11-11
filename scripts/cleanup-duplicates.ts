import { prisma } from '../lib/prisma';

function normalize(str: string | null | undefined): string {
    return (str || '').trim().replace(/\s+/g, ' ').toUpperCase();
}

async function runCleanup() {
    console.log('[CLEANUP] Memulai proses identifikasi mata kuliah duplikat...');

    // Ambil semua mata kuliah aktif yang belum di-softdelete beserta relasi
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

    console.log(`[CLEANUP] Ditemukan ${matkuls.length} mata kuliah aktif di database.`);

    // Kelompokkan berdasarkan (normalized nama + jurusanId + normalized kurikulum nama)
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

    console.log(`[CLEANUP] Ditemukan ${idsToSoftDelete.length} data duplikat lama untuk di-softdelete.`);

    if (idsToSoftDelete.length === 0) {
        console.log('[CLEANUP] Tidak ada data duplikat. Database sudah bersih!');
        return;
    }

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

    console.log(`[CLEANUP] SUKSES! Berhasil melakukan soft-delete pada ${result.count} data mata kuliah duplikat lama.`);
}

runCleanup()
    .catch((err) => {
        console.error('[CLEANUP] Terjadi kesalahan:', err);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });

