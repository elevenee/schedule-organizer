import { findByKode } from "@/features/program-studi/services/prodi.service";
import { upsertMataKuliah } from "../service/mata-kuliah";

export async function SYNC() {
    const limit = 100;
    let offset = 0;

    let allData: any[] = [];

    while (true) {
        const res = await fetch(`/api/matakuliah`, {
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
        const listKurikulum = [130, 79, 108, 116, 123, 119, 160, 155, 128, 75, 81, 82, 121, 124, 134, 109, 113, 112, 125, 122, 132, 164, 77, 78, 76, 107, 106, 114, 110, 118, 126, 120, 149, 154, 163, 131, 58, 89, 83, 87, 91, 92, 93, 96, 102, 105, 129, 145, 146, 147, 151, 137, 148, 139, 143, 161, 162, 133, 135, 94, 98, 85, 86, 101, 90, 88, 84, 103, 104, 115, 100, 117, 127, 138, 141, 140, 142, 144, 152, 153, 156, 159, 157, 150, 97, 95, 99, 158, 136];
        const texts = ['ujian', 'tesis', 'skripsi'];
        allData = allData.filter((v) => listKurikulum.includes(Number(v.KURIKULUM_ID)))
            .filter((s)=> s.SEMESTER > 0)
            .filter((item) => {
                const itemName = item.NAMA_MATAKULIAH.toLowerCase();
                return !texts.some(keyword => itemName.includes(keyword.toLowerCase()));
            });
        if (allData) {
            for (const r of allData) {
                const prodi = await findByKode(r.KODE_PRODI);

                await upsertMataKuliah({
                    jenjang: r.JENJANG_STUDI.replace("-", ""),
                    nama: r.NAMA_MATAKULIAH,
                    kode: r.KODE_MATAKULIAH,
                    sks: r.SKS_TOTAL,
                    semester: r.SEMESTER,
                    jurusanId: prodi?.id,
                    kurikulumId: r.KURIKULUM_ID,
                });
            }
        }

        return allData;
    } catch (error) {
        console.error("Error mengambil data matkul:", error);
        throw new Error("Gagal mengambil data matkul: " + (error as Error).message);
    }
}