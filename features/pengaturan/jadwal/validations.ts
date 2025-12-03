import { z } from "zod";

export const pengaturanJadwalSchema = z.object({
    id: z.number().optional(),
    jenisDosen: z.string().min(1, "Jenis Dosen harus diisi"),
    minSks: z.string().min(1, "MIN SKS harus diisi"),
    maxSks: z.string().min(1, "MAX SKS harus diisi")
});

export type pengaturanJadwalFormValues = z.infer<typeof pengaturanJadwalSchema>;