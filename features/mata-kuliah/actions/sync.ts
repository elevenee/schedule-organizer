'use server'

import { requireAuth } from "@/lib/auth-guard";
import { apiFetcher } from "@/lib/api-fetcher";
import { prisma } from "@/lib/prisma";
import { getSyncProgress, setSyncProgress } from "@/lib/sync-progress";
import { Jenjang, Role, StatusTahun } from "@prisma/client";

export async function SYNC(filterKodeProdi?: string) {
    await requireAuth([Role.ADMIN, Role.FAKULTAS]);

    // 1. Cek apakah sinkronisasi mata kuliah sedang berjalan
    const activeJob = await getSyncProgress("mata-kuliah");
    if (activeJob && activeJob.status === "RUNNING") {
        return {
            success: true,
            running: true,
            message: "Sinkronisasi mata kuliah sedang berjalan di latar belakang.",
        };
    }

    const jobId = `sync-matkul-${Date.now()}`;
    const startedAt = Date.now();

    // 2. Inisialisasi status job di Redis
    await setSyncProgress({
        id: jobId,
        type: "mata-kuliah",
        title: "Mata Kuliah",
        status: "RUNNING",
        current: 0,
        total: 0,
        percent: 0,
        message: "Mengambil data mata kuliah dari SIAKAD...",
        startedAt,
        updatedAt: startedAt,
    });

    // 3. Jalankan proses sinkronisasi di background (tidak menahan response pengguna)
    runBackgroundSync(jobId, startedAt, filterKodeProdi).catch(async (error) => {
        console.error("[Background Matkul Sync Error]:", error);
        await setSyncProgress({
            id: jobId,
            type: "mata-kuliah",
            title: "Mata Kuliah",
            status: "FAILED",
            current: 0,
            total: 0,
            percent: 0,
            message: "Gagal mensinkronkan mata kuliah",
            error: error?.message || String(error),
            startedAt,
            updatedAt: Date.now(),
        });
    });

    return {
        success: true,
        background: true,
        message: "Sinkronisasi mata kuliah dimulai di latar belakang.",
    };
}

async function runBackgroundSync(jobId: string, startedAt: number, filterKodeProdi?: string) {
    const limit = 100;
    let page = 1;
    let allData: any[] = [];

    // 1. Ambil data matakuliah dari SIAKAD dengan paginasi
    while (true) {
        const query = new URLSearchParams();
        query.set('page', String(page));
        query.set('limit', String(limit));
        query.set('offset', String((page - 1) * limit));
        if (filterKodeProdi) {
            query.set('kode_prodi', filterKodeProdi);
        }

        const res = await apiFetcher(`/siakad/matakuliah?${query.toString()}`, {
            method: 'GET',
            tokenRequired: true,
        });

        const batch = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []);
        if (!batch || batch.length === 0) break;

        allData.push(...batch);

        await setSyncProgress({
            id: jobId,
            type: "mata-kuliah",
            title: "Mata Kuliah",
            status: "RUNNING",
            current: 0,
            total: allData.length,
            percent: 5,
            message: `Mengunduh data dari SIAKAD (${allData.length.toLocaleString('id-ID')} data terunduh)...`,
            startedAt,
            updatedAt: Date.now(),
        });

        if (batch.length < limit || (res?.pagination?.totalPages && page >= res.pagination.totalPages)) break;
        page++;
    }

    if (!allData || allData.length === 0) {
        await setSyncProgress({
            id: jobId,
            type: "mata-kuliah",
            title: "Mata Kuliah",
            status: "COMPLETED",
            current: 0,
            total: 0,
            percent: 100,
            message: "Tidak ada data mata kuliah dari SIAKAD",
            startedAt,
            updatedAt: Date.now(),
        });
        return;
    }

    // 2. Pre-fetch seluruh jurusan ke memori (O(1) lookup by kode & nama)
    const allJurusan = await prisma.jurusan.findMany({
        select: { id: true, kode: true, nama: true }
    });
    const jurusanByKode = new Map(allJurusan.map(j => [j.kode, j]));
    const jurusanByName = new Map(allJurusan.map(j => [normalizeProdiName(j.nama), j]));

    // 3. Pre-fetch seluruh kurikulum ke memori
    const allKurikulum = await prisma.kurikulum.findMany({
        select: { id: true }
    });
    const kurikulumSet = new Set(allKurikulum.map(k => k.id));

    // 4. Pre-fetch seluruh kunci unik mata kuliah yang ada di database ke memori (O(1) in-memory lookup)
    const allExistingMatkul = await prisma.mataKuliah.findMany({
        select: {
            id: true,
            kode: true,
            jurusanId: true,
            semester: true,
            jenjang: true,
            kurikulumId: true,
        }
    });

    const matkulMap = new Map<string, bigint>();
    for (const m of allExistingMatkul) {
        const key = `${m.kode}__${m.jurusanId}__${m.semester}__${m.jenjang}__${m.kurikulumId}`;
        matkulMap.set(key, m.id);
    }

    let upsertedCount = 0;
    const totalItems = allData.length;

    for (let i = 0; i < totalItems; i++) {
        const r = allData[i];
        if (!r || !r.KODE_MATAKULIAH) continue;

        let prodi = r.KODE_PRODI ? jurusanByKode.get(String(r.KODE_PRODI)) : null;
        if (!prodi && r.NAMA_PRODI) {
            prodi = jurusanByName.get(normalizeProdiName(r.NAMA_PRODI));
        }
        if (!prodi) continue;

        // Kurikulum handling
        const rawKurikulumId = r.KURIKULUM_ID || r.ID_KURIKULUM;
        let validKurikulumId: number | null = null;

        if (rawKurikulumId) {
            const kId = Number(rawKurikulumId);
            if (!isNaN(kId)) {
                validKurikulumId = kId;
                if (!kurikulumSet.has(kId)) {
                    await prisma.kurikulum.upsert({
                        where: { id: kId },
                        update: {
                            nama: r.NAMA_KURIKULUM || `Kurikulum ${kId}`,
                        },
                        create: {
                            id: kId,
                            nama: r.NAMA_KURIKULUM || `Kurikulum ${kId}`,
                            status: StatusTahun.ACTIVE,
                        },
                    });
                    kurikulumSet.add(kId);
                }
            }
        }

        // Jenjang parsing
        let cleanJenjang: Jenjang = Jenjang.S1;
        if (r.JENJANG_STUDI) {
            const parsed = String(r.JENJANG_STUDI).replace("-", "").toUpperCase();
            if (["D3", "D4", "S1", "S2", "S3"].includes(parsed)) {
                cleanJenjang = parsed as Jenjang;
            }
        }

        const sks = Number(r.SKS_TOTAL) || 2;
        const semester = Number(r.SEMESTER) || 1;
        const kode = String(r.KODE_MATAKULIAH).trim();
        const cleanNama = String(r.NAMA_MATAKULIAH).trim();

        const uniqueKey = `${kode}__${prodi.id}__${semester}__${cleanJenjang}__${validKurikulumId}`;
        const existingId = matkulMap.get(uniqueKey);

        if (existingId) {
            await prisma.mataKuliah.update({
                where: { id: existingId },
                data: {
                    nama: cleanNama,
                    sks,
                    deletedAt: null,
                },
            });
        } else {
            const created = await prisma.mataKuliah.create({
                data: {
                    kode,
                    nama: cleanNama,
                    jenjang: cleanJenjang,
                    sks,
                    semester,
                    jurusanId: prodi.id,
                    kurikulumId: validKurikulumId,
                },
            });
            matkulMap.set(uniqueKey, created.id);
        }
        upsertedCount++;

        // Update progress ke Redis setiap 150 baris atau di akhir
        if (upsertedCount % 150 === 0 || i === totalItems - 1) {
            const percent = Math.min(99, Math.round((upsertedCount / totalItems) * 90) + 10);
            await setSyncProgress({
                id: jobId,
                type: "mata-kuliah",
                title: "Mata Kuliah",
                status: "RUNNING",
                current: upsertedCount,
                total: totalItems,
                percent,
                message: `Menyimpan mata kuliah (${upsertedCount.toLocaleString('id-ID')} / ${totalItems.toLocaleString('id-ID')})...`,
                startedAt,
                updatedAt: Date.now(),
            });
        }
    }

    // 5. Tandai Selesai di Redis
    await setSyncProgress({
        id: jobId,
        type: "mata-kuliah",
        title: "Mata Kuliah",
        status: "COMPLETED",
        current: totalItems,
        total: totalItems,
        percent: 100,
        message: `Berhasil mensinkronkan ${upsertedCount.toLocaleString('id-ID')} mata kuliah`,
        startedAt,
        updatedAt: Date.now(),
    });
}

function normalizeProdiName(name: string): string {
    return (name || '')
        .replace(/\b(S[123]|D[34])\b/gi, "")
        .replace(/[()]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}
