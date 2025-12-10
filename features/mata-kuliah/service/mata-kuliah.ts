'use server'
import { prisma } from "@/lib/prisma";
import { Jenjang } from "@prisma/client";

export async function upsertMataKuliah(data: any) {
    return prisma.mataKuliah.upsert({
        where: {
            kode_jurusanId_semester_jenjang: {
                kode: data.kode,
                jurusanId: data.jurusanId,
                semester: data.semester,
                jenjang: data.jenjang as Jenjang,
            }
        },
        update: data,
        create: data,
    });
}