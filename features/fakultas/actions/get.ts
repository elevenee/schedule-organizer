'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type SortProp = {
    field: string,
    orderBy: string | "asc" | "desc"
}

const ALLOWED_SORT_FIELDS = ["id", "nama", "kode", "createdAt", "updatedAt"];

export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "desc" },
    id,
}: { page?: number, limit?: number, search?: string, sort?: SortProp, id?: number }) {
    await requireAuth();

    const sanitizedLimit = Math.min(Math.max(1, limit), 100);
    const sanitizedPage = Math.max(1, page);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const sortField = ALLOWED_SORT_FIELDS.includes(sort.field) ? sort.field : "createdAt";
    const sortOrder = String(sort.orderBy).toLowerCase() === "asc" ? "asc" : "desc";

    const searchFilter = search
        ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};
    const idFilter = id ? { id: BigInt(id) } : {};

    const where = {
        ...idFilter,
        ...searchFilter,
    };
    const [data, total] = await Promise.all([
        prisma.fakultas.findMany({
            skip,
            take: sanitizedLimit,
            where,
            orderBy: { [sortField]: sortOrder },
            include: {
                Jurusan: { select: { id: true, nama: true, jenjang: true} }
            }
        }),
        prisma.fakultas.count({ where }),
    ]);

    return { data, total };
}

export default async function GET_ALL() {
    await requireAuth();

    const result = await prisma.fakultas.findMany({
        orderBy: { nama: 'asc' },
        include: {
            Jurusan: {
                select: {
                    id: true,
                    nama: true,
                    jenjang: true
                }
            },
        }
    });

    return result;
}
