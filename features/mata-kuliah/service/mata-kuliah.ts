'use server'
import { prisma } from "@/lib/prisma";
import { Jenjang } from "@prisma/client";

export async function upsertMataKuliah(data: any) {
    return prisma.mataKuliah.upsert({
        where: {
            kode_jurusanId_semester_jenjang_kurikulumId: {
                kode: data.kode,
                jurusanId: data.jurusanId,
                semester: data.semester,
                jenjang: data.jenjang as Jenjang,
                kurikulumId: data.kurikulumId
            }
        },
        update: data,
        create: data,
    });
}