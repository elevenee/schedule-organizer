import { z } from "zod";

export const fakultasSchema = z.object({
    id: z.number().optional(),
    nama: z.string().min(1, 'Nama Fakultas harus diisi').max(100),
});

export type FakultasFormValues = z.infer<typeof fakultasSchema>;