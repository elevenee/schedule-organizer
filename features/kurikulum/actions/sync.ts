'use server'

import { requireAuth } from "@/lib/auth-guard";
import { apiFetcher } from "@/lib/api-fetcher";
import { prisma } from "@/lib/prisma";
import { Role, StatusTahun } from "@prisma/client";

export async function SYNC(filter?: { prodi_id?: string; search?: string; na?: string }) {
    await requireAuth([Role.ADMIN, Role.FAKULTAS]);

    try {
        const query = new URLSearchParams();
        if (filter?.prodi_id) query.set('prodi_id', filter.prodi_id);
        if (filter?.search) query.set('search', filter.search);
        if (filter?.na) query.set('na', filter.na);

        const queryString = query.toString() ? `?${query.toString()}` : '';
        const response = await apiFetcher(`/siakad/kurikulum${queryString}`, {
            method: 'GET',
            tokenRequired: true,
        });

        const rows = response?.data ?? (Array.isArray(response) ? response : []);

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return { success: true, count: 0, message: "Tidak ada data kurikulum dari SIAKAD" };
        }

        let upsertedCount = 0;

        for (const r of rows) {
            const kurikulumId = Number(r.KurikulumID || r.id);
            if (!kurikulumId || isNaN(kurikulumId)) continue;

            const nama = r.NAMA_KURIKULUM || r.Nama || `Kurikulum ${kurikulumId}`;
            const isInactive = r.STATUS_NONAKTIF === 'Y' || r.na === 'Y';
            const status = isInactive ? StatusTahun.INACTIVE : StatusTahun.ACTIVE;

            await prisma.kurikulum.upsert({
                where: { id: kurikulumId },
                update: {
                    nama,
                    status,
                },
                create: {
                    id: kurikulumId,
                    nama,
                    status,
                },
            });
            upsertedCount++;
        }

        return {
            success: true,
            count: upsertedCount,
            message: `Berhasil mensinkronkan ${upsertedCount} kurikulum dari SIAKAD`
        };
    } catch (error: any) {
        console.error("Error mensinkronkan data kurikulum:", error);
        throw new Error(error.message || "Gagal mensinkronkan data kurikulum");
    }
}

