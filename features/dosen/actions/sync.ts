import { findByKode } from "@/features/program-studi/services/prodi.service";
import { upsertDosen } from "../services/dosen.service";

export async function SYNC() {
    const limit = 100;
    let offset = 0;

    let allData: any[] = [];

    while (true) {
        const res = await fetch(`/api/dosen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ offset: offset, limit: limit }),
        });

        const data = await res.json();
        const batch = data?.data?.data ?? [];

        if (batch.length === 0) break;

        allData.push(...batch);

        // Jika data yang diterima kurang dari limit → berarti sudah halaman terakhir
        if (batch.length < limit) break;

        offset += limit; // lanjut ke halaman berikutnya
    }
    try {
        if (allData && allData.length > 0) {
            for (const r of allData) {
                if (!r || !r.NAMA_DOSEN) continue;
                if (r.NAMA_DOSEN.includes("TIM FAKULTAS")) continue;

                const nama = parseDosen(r);
                const prodi = r.KODE_PRODI ? await findByKode(r.KODE_PRODI) : null;

                const nip = r.NIP_PNS && String(r.NIP_PNS).trim() !== '' ? String(r.NIP_PNS).trim() : null;
                const nidn = r.NIDN && String(r.NIDN).trim() !== '' ? String(r.NIDN).trim() : null;

                await upsertDosen({
                    nip,
                    nidn,
                    nama,
                    status: 'TETAP',
                    jurusanId: prodi?.id || null,
                    fakultasId: prodi?.fakultasId || null,
                });
            }
        }

        return allData;
    } catch (error) {
        console.error("Error mensinkronkan data dosen:", error);
        throw new Error("Gagal mensinkronkan data dosen: " + (error as Error).message);
    }
}

function parseDosen(data: any) {
    const { NAMA_DOSEN, GELAR } = data;

    if (!GELAR || typeof GELAR !== "string") return NAMA_DOSEN;

    // --- DAFTAR GELAR DEPAN LENGKAP ---
    const prefixList = [
        "PROF.", "PROF",
        "DR.", "DR",
        "DR. H.",
        "DRS.", "DRS",
        "IR.", "IR",
        "H.", "HJ.", "KH.",
        "UST.", "UST",
        // Militer (opsional)
        "LET.", "LETKOL", "KOL.", "MAYJEN", "BRIGJEN"
    ].map(v => v.toUpperCase());

    // --- NORMALISASI GELAR ---
    const parts = GELAR
        .replace(/[,;/|]+/g, ",")          // ganti ; / | menjadi koma
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);

    let prefixes: string[] = [];
    let suffixes: string[] = [];

    for (const raw of parts) {
        const g = raw.trim();
        const upper = g.toUpperCase();

        // Jika ditemukan dalam prefixList → prefix
        if (prefixList.includes(upper)) {
            prefixes.push(g);
        } else {
            // Jika tidak ada di prefix → semua masuk suffix
            suffixes.push(g);
        }
    }

    // Rapi penyusunan output
    const prefixStr = prefixes.join(" ");
    const suffixStr = suffixes.join(", ");

    if (prefixStr && suffixStr) return `${prefixStr} ${NAMA_DOSEN}, ${suffixStr}`;
    if (prefixStr) return `${prefixStr} ${NAMA_DOSEN}`;
    if (suffixStr) return `${NAMA_DOSEN}, ${suffixStr}`;

    return NAMA_DOSEN;
}
