'use server'

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type SortProp = {
    field: string,
    orderBy: string | "asc" | "desc"
}
export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "desc" },
    id,
}: { page?: number, limit?: number, search?: string, sort?: SortProp, id?: number }) {
    const skip = (page - 1) * limit;
    const searchFilter = search
        ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};
    const idFilter = id ? { id } : {};

    const where = {
        ...idFilter,
        ...searchFilter,
    };
    const [data, total] = await Promise.all([
        prisma.fakultas.findMany({
            skip,
            take: limit,
            where,
            orderBy: { [sort.field]: sort.orderBy },
            include: {
                Jurusan: { select: { id: true, nama: true, jenjang: true} }
            }
        }),
        prisma.fakultas.count({ where }),
    ]);

    return { data, total };
}

export default async function GET_ALL() {
    const result = await prisma.fakultas.findMany({
        include: {
            Jurusan: {
                select: {
                    id: true,
                    nama: true
                }
            },
        }
    });

    return result;
}