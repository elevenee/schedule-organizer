import { upsertProdi } from "../services/prodi.service";

export async function SYNC() {
    try {
        const res = await fetch(`/api/prodi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ offset: 0, limit: 100 }),
        });
        const data = await res.json();
        const rows = data?.data?.data ?? null;

        if (rows && Array.isArray(rows)) {
            for (const r of rows) {
                const nama = r?.NAMA_PRODI ?? '';
                let jenjang = "S1";

                if (r?.JENJANG_STUDI) {
                    const clean = r.JENJANG_STUDI.replace("-", "").toUpperCase();
                    if (["D3", "D4", "S1", "S2", "S3"].includes(clean)) {
                        jenjang = clean;
                    }
                } else {
                    const match = nama.match(/\b(S[123]|D[34])\b/i);
                    if (match) {
                        jenjang = match[0].toUpperCase();
                    }
                }

                await upsertProdi({
                    kode: String(r.KODE_PRODI),
                    nama,
                    jenjang,
                    fakultasId: BigInt(r.ID_FAKULTAS || 1),
                    singkatan: ''
                });
            }
        }

        return data;
    } catch (error) {
        console.error("Error mengambil data prodi:", error);
        throw new Error("Gagal mengambil data prodi: " + (error as Error).message);
    }
}
