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

    if (rows) {
        for (const r of rows) {
            let nama = r?.NAMA_PRODI ?? '';
            let jenjang: string | null = null;

            const match = nama.match(/\bS[123]\b/i);
            if (match) {
                jenjang = match[0]
            } 
            await upsertProdi({
                kode: r.KODE_PRODI,
                nama,
                jenjang,
                fakultasId: r.ID_FAKULTAS,
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