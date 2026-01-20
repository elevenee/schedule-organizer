import { z } from "zod";

export const dosenSchema = z.object({
    id: z.number().optional(),
    nama: z.string().min(1, "Nama dosen harus diisi"),
    nidn: z.string().optional().nullable(),
    fakultasId: z.number().optional().nullable(),
    jurusanId: z.number().optional().nullable(),
    status: z.enum(["TETAP", "TIDAK_TETAP"]).optional().nullable(),
});

export type dosenFormValues = z.infer<typeof dosenSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

export const importDosenScheme = z.object({
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

export type ImportDosenValues = z.infer<typeof importDosenScheme>;

export const phoneSchema = z.object({
    id: z.number(),
    no_hp: z
        .string()
        .min(1, "No HP harus diisi")
        .regex(/^(\+62|62|0)[1-9][0-9]{7,11}$/, "Format nomor HP Indonesia tidak valid")
    // Penjelasan regex:
    // ^(\+62|62|0) : mulai dengan +62, 62, atau 0
    // [1-9]        : digit pertama setelah kode negara tidak boleh 0
    // [0-9]{7,11}$ : 7-11 digit sisanya
});

export type PhoneValues = z.infer<typeof phoneSchema>;