import { z } from "zod";

export const mataKuliahSchema = z.object({
    id: z.number().optional(),
    nama: z.string().min(1, "Nama matakulihan harus diisi"),
    kode: z.string().min(1, "Kode matakuliah harus diisi"),
    sks: z.number().min(1, "Jumlah SKS harus diisi"),
    semester: z.number().min(1, "Semester harus diisi"),
    jurusanId: z.number().min(1, "Jurusan harus diisi"),
    jenjang: z.string().optional()
});

export type mataKuliahFormValues = z.infer<typeof mataKuliahSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

export const importMataKuliahScheme = z.object({
    file: z
        .any()
        .refine(
            (files) => {
                if (!files) return true;
                if (!(files instanceof File)) return false;
                return (
                    files.size <= MAX_FILE_SIZE &&
                    ACCEPTED_FILE_TYPES.includes(files.type)
                );
            },
            {
                message: 'Setiap file harus bertipe XLS, atau XLSX dan maksimal 5MB',
            }
        )
});

export type ImportMataKuliahValues = z.infer<typeof importMataKuliahScheme>;