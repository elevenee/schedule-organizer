import { z } from "zod";

export const pengaturanJadwalSchema = z.object({
    id: z.number().optional(),
    jenisDosen: z.string().min(1, "Jenis Dosen harus diisi"),
    minSks: z.number().optional().nullable(),
    maxSks: z.number().optional().nullable()
});

export type pengaturanJadwalFormValues = z.infer<typeof pengaturanJadwalSchema>;