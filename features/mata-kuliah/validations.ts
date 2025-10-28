import { z } from "zod";

export const mataKuliahSchema = z.object({
    id: z.number().optional(),
    nama: z.string().min(1, "Nama matakulihan harus diisi"),
    kode: z.string().min(1, "Kode matakuliah harus diisi"),
    sks: z.number().min(1, "Jumlah SKS harus diisi"),
    semester: z.number().min(1, "Semester harus diisi"),
    jurusanId: z.number().min(1, "Jurusan harus diisi")
});

export type mataKuliahFormValues = z.infer<typeof mataKuliahSchema>;