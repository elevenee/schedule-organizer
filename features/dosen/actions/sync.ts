'use server'

import { requireAuth } from "@/lib/auth-guard";
import { apiFetcher } from "@/lib/api-fetcher";
import { prisma } from "@/lib/prisma";
import { getSyncProgress, setSyncProgress } from "@/lib/sync-progress";
import { Role, TypeDosen } from "@prisma/client";

export async function SYNC(filterKodeProdi?: string) {
    await requireAuth([Role.ADMIN, Role.FAKULTAS]);

    // 1. Cek apakah sinkronisasi dosen sedang berjalan
    const activeJob = await getSyncProgress("dosen");
    if (activeJob && activeJob.status === "RUNNING") {
        return {
            success: true,
            running: true,
            message: "Sinkronisasi dosen sedang berjalan di latar belakang.",
        };
    }

    const jobId = `sync-dosen-${Date.now()}`;
    const startedAt = Date.now();

    // 2. Inisialisasi status job di Redis
    await setSyncProgress({
        id: jobId,
        type: "dosen",
        title: "Dosen",
        status: "RUNNING",
        current: 0,
        total: 0,
        percent: 0,
        message: "Mengambil data dosen dari SIAKAD...",
        startedAt,
        updatedAt: startedAt,
    });

    // 3. Jalankan proses sinkronisasi di background
    runBackgroundDosenSync(jobId, startedAt, filterKodeProdi).catch(async (error) => {
        console.error("[Background Dosen Sync Error]:", error);
        await setSyncProgress({
            id: jobId,
            type: "dosen",
            title: "Dosen",
            status: "FAILED",
            current: 0,
            total: 0,
            percent: 0,
            message: "Gagal mensinkronkan dosen",
            error: error?.message || String(error),
            startedAt,
            updatedAt: Date.now(),
        });
    });

    return {
        success: true,
        background: true,
        message: "Sinkronisasi dosen dimulai di latar belakang.",
    };
}

async function runBackgroundDosenSync(jobId: string, startedAt: number, filterKodeProdi?: string) {
    const limit = 100;
    let page = 1;
    let allData: any[] = [];

    // 1. Ambil data dosen dari SIAKAD dengan paginasi
    while (true) {
        const query = new URLSearchParams();
        query.set('page', String(page));
        query.set('limit', String(limit));
        query.set('offset', String((page - 1) * limit));
        if (filterKodeProdi) {
            query.set('kode_prodi', filterKodeProdi);
        }

        const res = await apiFetcher(`/siakad/dosen?${query.toString()}`, {
            method: 'GET',
            tokenRequired: true,
        });

        const batch = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []);
        if (!batch || batch.length === 0) break;

        // Filter hanya data dosen dengan REV = 1 sebelum masuk ke allData
        const validBatch = batch.filter((item: any) => Number(item?.REV) === 1);
        allData.push(...validBatch);

        await setSyncProgress({
            id: jobId,
            type: "dosen",
            title: "Dosen",
            status: "RUNNING",
            current: 0,
            total: allData.length,
            percent: 10,
            message: `Mengunduh data dosen dari SIAKAD (${allData.length} dosen)...`,
            startedAt,
            updatedAt: Date.now(),
        });

        if (batch.length < limit || (res?.pagination?.totalPages && page >= res.pagination.totalPages)) break;
        page++;
    }

    if (!allData || allData.length === 0) {
        await setSyncProgress({
            id: jobId,
            type: "dosen",
            title: "Dosen",
            status: "COMPLETED",
            current: 0,
            total: 0,
            percent: 100,
            message: "Tidak ada data dosen dari SIAKAD",
            startedAt,
            updatedAt: Date.now(),
        });
        return;
    }

    // 2. Pre-fetch seluruh jurusan ke memori (O(1) lookup)
    const allJurusan = await prisma.jurusan.findMany({
        select: { id: true, kode: true, nama: true, fakultasId: true }
    });
    const jurusanByKode = new Map(allJurusan.map(j => [j.kode, j]));
    const jurusanByName = new Map(allJurusan.map(j => [normalizeProdiName(j.nama), j]));

    let upsertedCount = 0;
    const totalItems = allData.length;

    for (let i = 0; i < totalItems; i++) {
        const r = allData[i];
        if (!r || !r.NAMA_DOSEN) continue;
        if (String(r.NAMA_DOSEN).includes("TIM FAKULTAS")) continue;

        const nama = parseDosen(r);
        let prodi = r.KODE_PRODI ? jurusanByKode.get(String(r.KODE_PRODI)) : null;
        if (!prodi && r.NAMA_PRODI) {
            prodi = jurusanByName.get(normalizeProdiName(r.NAMA_PRODI));
        }

        const nip = r.NIP_PNS && String(r.NIP_PNS).trim() !== '' ? String(r.NIP_PNS).trim() : null;
        const nidn = r.NIDN && String(r.NIDN).trim() !== '' ? String(r.NIDN).trim() : null;

        let existingDosen = null;
        if (nip) {
            existingDosen = await prisma.dosen.findFirst({ where: { nip } });
        }
        if (!existingDosen && nidn) {
            existingDosen = await prisma.dosen.findFirst({ where: { nidn } });
        }
        if (!existingDosen && nama) {
            existingDosen = await prisma.dosen.findFirst({ where: { nama } });
        }

        const payloadData = {
            nip,
            nidn,
            nama,
            status: TypeDosen.TETAP,
            jurusanId: prodi?.id || null,
            fakultasId: prodi?.fakultasId || null,
        };

        if (existingDosen) {
            await prisma.dosen.update({
                where: { id: existingDosen.id },
                data: payloadData,
            });
        } else {
            await prisma.dosen.create({
                data: payloadData,
            });
        }

        upsertedCount++;

        if (upsertedCount % 25 === 0 || i === totalItems - 1) {
            const percent = Math.min(99, Math.round((upsertedCount / totalItems) * 85) + 15);
            await setSyncProgress({
                id: jobId,
                type: "dosen",
                title: "Dosen",
                status: "RUNNING",
                current: upsertedCount,
                total: totalItems,
                percent,
                message: `Menyimpan data dosen (${upsertedCount} / ${totalItems})...`,
                startedAt,
                updatedAt: Date.now(),
            });
        }
    }

    await setSyncProgress({
        id: jobId,
        type: "dosen",
        title: "Dosen",
        status: "COMPLETED",
        current: totalItems,
        total: totalItems,
        percent: 100,
        message: `Berhasil mensinkronkan ${upsertedCount} dosen dari SIAKAD`,
        startedAt,
        updatedAt: Date.now(),
    });
}

function isPrefixToken(token: string): boolean {
    const clean = token.replace(/[.,]/g, '').trim().toUpperCase();
    const prefixes = new Set([
        'PROF', 'PROFESSOR',
        'DR',
        'DRS',
        'DRA',
        'IR',
        'H',
        'HJ',
        'KH',
        'UST', 'USTADZ',
        'LET', 'LETKOL', 'KOL', 'MAYJEN', 'BRIGJEN'
    ]);
    return prefixes.has(clean);
}

function normalizePrefix(token: string): string {
    const clean = token.replace(/[.,]/g, '').trim().toUpperCase();
    switch (clean) {
        case 'PROF':
        case 'PROFESSOR':
            return 'Prof.';
        case 'DR':
            return 'Dr.';
        case 'DRS':
            return 'Drs.';
        case 'DRA':
            return 'Dra.';
        case 'IR':
            return 'Ir.';
        case 'H':
            return 'H.';
        case 'HJ':
            return 'Hj.';
        case 'KH':
            return 'K.H.';
        case 'UST':
        case 'USTADZ':
            return 'Ust.';
        default:
            return token.trim();
    }
}

function parseDosen(data: any): string {
    const namaDosen = (data.NAMA_DOSEN || '').trim();
    const gelar = (data.GELAR || '').trim();

    if (!gelar || typeof gelar !== 'string') return namaDosen;

    // 1. Pecah GELAR berdasarkan pemisah umum (koma, titik koma, slash, pipe)
    const chunks = gelar.split(/[,;/|]+/).map(c => c.trim()).filter(Boolean);

    const rawPrefixes: string[] = [];
    const rawSuffixes: string[] = [];

    for (const chunk of chunks) {
        // Sebuah potongan bisa memiliki kombinasi kata seperti "Prof. DR." atau "Prof. Dr. M.Pd"
        const words = chunk.split(/\s+/).map(w => w.trim()).filter(Boolean);

        let i = 0;
        // Ambil gelar depan di awal potongan kata
        while (i < words.length && isPrefixToken(words[i])) {
            rawPrefixes.push(normalizePrefix(words[i]));
            i++;
        }

        // Cek sisa kata pada potongan ini
        if (i < words.length) {
            const nonPrefixWords: string[] = [];
            while (i < words.length) {
                if (isPrefixToken(words[i])) {
                    rawPrefixes.push(normalizePrefix(words[i]));
                } else {
                    nonPrefixWords.push(words[i]);
                }
                i++;
            }
            if (nonPrefixWords.length > 0) {
                rawSuffixes.push(nonPrefixWords.join(' '));
            }
        }
    }

    // 2. Hilangkan duplikasi gelar depan berurutan (misal "Prof. Dr. Dr.")
    const uniquePrefixes: string[] = [];
    for (const p of rawPrefixes) {
        if (!uniquePrefixes.includes(p)) {
            uniquePrefixes.push(p);
        }
    }

    // 3. Normalisasi jika NAMA_DOSEN di SIAKAD sudah terlanjur diawali gelar (contoh: "DR. MUHAMMAD" atau "H. JALAL")
    let cleanNama = namaDosen;
    for (const p of ['Prof.', 'Dr.', 'Drs.', 'Dra.', 'Ir.', 'H.', 'Hj.', 'K.H.', 'Ust.']) {
        const pUpper = p.toUpperCase();
        const cleanUpper = p.replace('.', '').toUpperCase();
        const reg = new RegExp(`^(${pUpper}|${cleanUpper})\\.?\\s+`, 'i');
        if (reg.test(cleanNama)) {
            cleanNama = cleanNama.replace(reg, '').trim();
            const normP = normalizePrefix(p);
            if (!uniquePrefixes.includes(normP)) {
                uniquePrefixes.push(normP);
            }
        }
    }

    // Urutkan gelar depan sesuai hierarki akademik baku di Indonesia (Prof. -> Dr. -> Drs./Dra./Ir. -> H./Hj. -> K.H. -> Ust.)
    const PREFIX_ORDER = ['Prof.', 'Dr.', 'Drs.', 'Dra.', 'Ir.', 'H.', 'Hj.', 'K.H.', 'Ust.'];
    uniquePrefixes.sort((a, b) => {
        const idxA = PREFIX_ORDER.indexOf(a);
        const idxB = PREFIX_ORDER.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
    });

    const prefixStr = uniquePrefixes.join(' ');
    const suffixStr = rawSuffixes.join(', ');

    if (prefixStr && suffixStr) return `${prefixStr} ${cleanNama}, ${suffixStr}`;
    if (prefixStr) return `${prefixStr} ${cleanNama}`;
    if (suffixStr) return `${cleanNama}, ${suffixStr}`;

    return cleanNama;
}

function normalizeProdiName(name: string): string {
    return (name || '')
        .replace(/\b(S[123]|D[34])\b/gi, "")
        .replace(/[()]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}
