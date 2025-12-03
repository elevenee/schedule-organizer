import { z } from "zod";

export const tahunAkademikSchema = z.object({
    id: z.number().optional(),
    name: z.string()
        .min(9, 'Format tahun tidak sesuai eg:f2024/2025')
        .max(9, 'Format tahun tidak sesuai eg:f2024/2025')
        .regex(/^\d{4}\/\d{4}$/, 'Format tahun harus 2024/2025'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    semester: z.enum(['GANJIL', 'GENAP']),
});

export type tahunAkademikFormValues = z.infer<typeof tahunAkademikSchema>;