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