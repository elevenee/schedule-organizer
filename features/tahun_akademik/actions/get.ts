'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}

export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "DESC" },
}: { page?: number, limit?: number, search?: string, sort?: SortProp}) {
    await requireAuth();

    const sanitizedLimit = Math.min(Math.max(1, limit), 100);
    const sanitizedPage = Math.max(1, page);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const searchTahun = search
        ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};

    const where: Prisma.TahunAkademikWhereInput = {
        ...searchTahun,
        deletedAt: null
    };

    const [data, total] = await Promise.all([
        prisma.tahunAkademik.findMany({
            skip,
            take: sanitizedLimit,
            where,
            orderBy: { status: "asc" },
        }),
        prisma.tahunAkademik.count({ where }),
    ]);

    return { data, total };
}

export default async function GET_ALL() {
    await requireAuth();

    const result = await prisma.tahunAkademik.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }
    });

    return result;
}

export async function GET_TAHUN_AKADEMIK_AKTIF() {
    await requireAuth();

    const result = await prisma.tahunAkademik.findFirst({
        where: { deletedAt: null, status: 'ACTIVE' },
    });

    return result;
}
