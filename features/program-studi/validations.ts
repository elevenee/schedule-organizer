import { z } from "zod";

export const programStudiSchema = z.object({
    id: z.number().optional(),
    nama: z.string().min(1, 'Nama Program Studi harus diisi').max(100),
    fakultas: z.number(),
    jenjang: z.string().min(1, 'Jenjang harus diisi').max(100),
    kode: z.string().min(1, 'kode harus diisi').max(100),
    singkatan: z.string().optional(),
});

export type ProgramStudiFormValues = z.infer<typeof programStudiSchema>;