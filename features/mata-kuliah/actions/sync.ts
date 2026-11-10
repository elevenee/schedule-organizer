import { findByKode } from "@/features/program-studi/services/prodi.service";
import { upsertKurikulum, upsertMataKuliah } from "../service/mata-kuliah";

export async function SYNC(filterKodeProdi?: string) {
    const limit = 100;
    let offset = 0;

    let allData: any[] = [];

    while (true) {
        const bodyPayload: any = {
            offset: offset,
            limit: limit,
        };

        if (filterKodeProdi) {
            bodyPayload.kode_prodi = filterKodeProdi;
        }

        const res = await fetch(`/api/matakuliah`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyPayload),
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
                if (!r || !r.KODE_PRODI || !r.KODE_MATAKULIAH) continue;

                const prodi = await findByKode(r.KODE_PRODI);
                if (!prodi) continue;

                const kurikulumId = r.KURIKULUM_ID || r.ID_KURIKULUM;
                if (kurikulumId) {
                    await upsertKurikulum({
                        id: Number(kurikulumId),
                        nama: r.NAMA_KURIKULUM || `Kurikulum ${kurikulumId}`,
                    });
                }

                let cleanJenjang = "S1";
                if (r.JENJANG_STUDI) {
                    const parsed = r.JENJANG_STUDI.replace("-", "").toUpperCase();
                    if (["D3", "D4", "S1", "S2", "S3"].includes(parsed)) {
                        cleanJenjang = parsed;
                    }
                }

                await upsertMataKuliah({
                    jenjang: cleanJenjang,
                    nama: r.NAMA_MATAKULIAH,
                    kode: r.KODE_MATAKULIAH,
                    sks: Number(r.SKS_TOTAL) || 2,
                    semester: Number(r.SEMESTER) || 1,
                    jurusanId: prodi.id,
                    kurikulumId: kurikulumId ? Number(kurikulumId) : null,
                });
            }
        }

        return allData;
    } catch (error) {
        console.error("Error mengambil data matkul:", error);
        throw new Error("Gagal mengambil data matkul: " + (error as Error).message);
    }
}
