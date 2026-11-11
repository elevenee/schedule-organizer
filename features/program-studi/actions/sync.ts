'use server'

import { requireAuth } from "@/lib/auth-guard";
import { apiFetcher } from "@/lib/api-fetcher";
import { prisma } from "@/lib/prisma";
import { Jenjang, Role } from "@prisma/client";

export async function SYNC(filter?: { id_fakultas?: number; kode_jenjang?: string; search?: string; status?: string }) {
    await requireAuth([Role.ADMIN, Role.FAKULTAS]);

    try {
        const query = new URLSearchParams();
        if (filter?.id_fakultas !== undefined && filter?.id_fakultas !== null && String(filter.id_fakultas).trim() !== '') {
            query.set('id_fakultas', String(filter.id_fakultas));
        }
        if (filter?.kode_jenjang) query.set('kode_jenjang', filter.kode_jenjang);
        if (filter?.search) query.set('search', filter.search);
        if (filter?.status) query.set('status', filter.status);

        const queryString = query.toString() ? `?${query.toString()}` : '';
        const response = await apiFetcher(`/siakad/program-studi${queryString}`, {
            method: 'GET',
            tokenRequired: true,
        });

        const rows = response?.data ?? (Array.isArray(response) ? response : null);

        if (!rows || !Array.isArray(rows)) {
            return { success: true, count: 0, message: "Tidak ada data program studi ditemukan dari SIAKAD" };
        }

        // Ambil data fakultas yang ada untuk referensi foreign key
        const fakultasList = await prisma.fakultas.findMany({
            select: { id: true, nama: true }
        });
        const fakultasMap = new Map(fakultasList.map(f => [Number(f.id), f.id]));
        const defaultFakultasId = fakultasList[0]?.id || BigInt(1);

        let upsertedCount = 0;

        for (const r of rows) {
            if (!r || !r.KODE_PRODI) continue;

            const nama = r.NAMA_PRODI ?? '';
            let jenjang: Jenjang = Jenjang.S1;

            if (r.JENJANG_STUDI) {
                const clean = String(r.JENJANG_STUDI).replace("-", "").toUpperCase();
                if (["D3", "D4", "S1", "S2", "S3"].includes(clean)) {
                    jenjang = clean as Jenjang;
                }
            } else {
                const match = nama.match(/\b(S[123]|D[34])\b/i);
                if (match && ["D3", "D4", "S1", "S2", "S3"].includes(match[0].toUpperCase())) {
                    jenjang = match[0].toUpperCase() as Jenjang;
                }
            }

            // Tentukan fakultasId yang valid
            let targetFakultasId = defaultFakultasId;
            const apiFakultasId = Number(r.ID_FAKULTAS);
            if (fakultasMap.has(apiFakultasId)) {
                targetFakultasId = fakultasMap.get(apiFakultasId)!;
            } else if (r.NAMA_FAKULTAS) {
                const matched = fakultasList.find(f =>
                    f.nama.toLowerCase().includes(String(r.NAMA_FAKULTAS).trim().toLowerCase()) ||
                    String(r.NAMA_FAKULTAS).trim().toLowerCase().includes(f.nama.toLowerCase())
                );
                if (matched) {
                    targetFakultasId = matched.id;
                }
            }

            await prisma.jurusan.upsert({
                where: { kode: String(r.KODE_PRODI) },
                update: {
                    nama,
                    jenjang,
                    fakultasId: targetFakultasId,
                    singkatan: r.SINGKATAN || '',
                },
                create: {
                    kode: String(r.KODE_PRODI),
                    nama,
                    jenjang,
                    fakultasId: targetFakultasId,
                    singkatan: r.SINGKATAN || '',
                },
            });
            upsertedCount++;
        }

        return {
            success: true,
            count: upsertedCount,
            message: `Berhasil mensinkronkan ${upsertedCount} program studi dari SIAKAD`
        };
    } catch (error: any) {
        console.error("Error mensinkronkan data prodi:", error);
        throw new Error(error.message || "Gagal mensinkronkan data program studi");
    }
}
