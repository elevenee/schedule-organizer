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
    jurusanId = null
}: { page?: number, limit?: number, search?: string, sort?: SortProp, jurusanId?: number | null }) {
    await requireAuth();

    const sanitizedLimit = Math.min(Math.max(1, limit), 100);
    const sanitizedPage = Math.max(1, page);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const searchKurikulum = search
        ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};

    const where = {
        ...searchKurikulum,
    };

    const [data, total] = await Promise.all([
        prisma.kurikulum.findMany({
            skip,
            take: sanitizedLimit,
            where,  
            orderBy: { status: "asc" },
        }),
        prisma.kurikulum.count({ where }),
    ]);

    return { data, total };
}

export async function GET_KURIKULUM_AKTIF({
    search = "",
    sort = { field: "nama", orderBy: "asc" },
    jurusanId = null
}: { page?: number, limit?: number, search?: string, sort?: SortProp, jurusanId?: number | null }) {
    await requireAuth();

    const ids: number[] = [];
    if (jurusanId) {
        const getKurikulumMatakul = await prisma.mataKuliah.findMany({
            where: {
                jurusanId: BigInt(jurusanId)
            },
            select: { kurikulumId: true }
        });
        getKurikulumMatakul.forEach((x) => {
            if (x.kurikulumId !== null) ids.push(x.kurikulumId);
        });
    }

    const where: Prisma.KurikulumWhereInput = {
        status: 'ACTIVE',
        ...(search ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } } : {}),
        ...(ids.length > 0 ? { id: { in: ids } } : {})
    };

    const result = await prisma.kurikulum.findMany({
        where,
        orderBy: { nama: 'asc' }
    });

    return result;
}
