import { z } from "zod";

export const jadwalSchema = z.object({
    id: z.number().optional(),
    matakuliah: z.string().min(1, "Matakuliah harus diisi"),
    sks: z.string().min(1, "SKS harus diisi"),
    semester: z.string().min(1, "Semester harus diisi"),
    kelas: z.array(z.string()).min(1, "Minimal satu kelas harus diisi"),
    dosenId: z.number().min(1, "Dosen harus diisi"),
    fakultasId: z.number().min(1, "Fakultas harus diisi"),
    jurusanId: z.number().min(1, "Jurusan harus diisi"),
    keterangan: z.string().optional().nullable(),
});

export type jadwalFormValues = z.infer<typeof jadwalSchema>;

export const statusJadwalSchema = z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    keteranganAdmin: z.string().optional().nullable(),
});

export type statusJadwalFormValues = z.infer<typeof statusJadwalSchema>;