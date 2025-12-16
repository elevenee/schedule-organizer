import { z } from "zod";

export const kurikulumSchema = z.object({
    id: z.number().optional(),
    nama: z.string().min(1, 'Nama kurikulum harus diisi'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type kurikulumFormValues = z.infer<typeof kurikulumSchema>;