import { z } from "zod";

export const dosenSchema = z.object({
    id: z.number().optional(),
    nama: z.string().min(1, "Nama dosen harus diisi"),
    nidn: z.string().optional().nullable(),
    fakultasId: z.number().optional().nullable()
});

export type dosenFormValues = z.infer<typeof dosenSchema>;