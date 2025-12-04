import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

export const userSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { error: "Nama harus diisi" }),
    username: z.string().min(1, { error: "Username harus diisi" }),
    password: z.string().nullable().optional(),
    status: z.string(),
    role: z.enum([
        'ADMIN',
        'FAKULTAS',
        'PRODI',
        'DOSEN',
    ]),
    fakultasId: z.string().nullable().optional(),
});

export type userFormValues = z.infer<typeof userSchema>;

export const importUserScheme = z.object({
    file: z
        .any()
        .refine(
            (file) => {
                if (!file) return true;
                if (!(file instanceof File)) return false;
                return (
                    file.size <= MAX_FILE_SIZE &&
                    ACCEPTED_FILE_TYPES.includes(file.type)
                );
            },
            {
                message: 'file harus bertipe XLS atau XLSX dan maksimal 5MB',
            }
        )
});

export type ImportUserFormValues = z.infer<typeof importUserScheme>