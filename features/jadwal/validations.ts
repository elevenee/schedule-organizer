import { z } from "zod";

export const jadwalSchema = z.object({
    id: z.number().optional(),
    matakuliah: z.string().min(1, "Matakuliah harus diisi"),
    sks: z.number().min(1, "SKS harus diisi"),
    semester: z.number().min(1, "Semester harus diisi"),
    kelas: z.array(z.string()),
    dosenId: z.number().min(1, "Dosen harus diisi"),
    fakultasId: z.number().min(1, "Fakultas harus diisi"),
    jurusanId: z.number().min(1, "Jurusan harus diisi"),
    keterangan: z.string().optional().nullable(),
});

export type jadwalFormValues = z.infer<typeof jadwalSchema>;