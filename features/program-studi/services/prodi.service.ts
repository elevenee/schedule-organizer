'use server'
import { prisma } from "@/lib/prisma";

export async function findByKode(kode: string) {
    return prisma.jurusan.findFirst({
        where: {
            kode: kode
        }
    })
}

export async function upsertProdi(data: any) {
    return prisma.jurusan.upsert({
        where: { kode: data.kode },
        update: data,
        create: data,
    });
}