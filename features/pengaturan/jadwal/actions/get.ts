'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { TypeDosen } from "@prisma/client";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}

export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "DESC" },
    remove_pagination = false,
    jenisDosen = ""
}: { page?: number, limit?: number, search?: string, sort?: SortProp, remove_pagination?: boolean, jenisDosen?: string }) {
    await requireAuth();

    const sanitizedLimit = Math.min(Math.max(1, limit), 50);
    const sanitizedPage = Math.max(1, page);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const jenisDosenFilter = jenisDosen
        ? { jenisDosen: jenisDosen as TypeDosen }
        : {};

    const where = {
        ...jenisDosenFilter,
        deletedAt: null
    };

    const [data, total] = await Promise.all([
        prisma.pengaturanJadwal.findMany({
            skip: remove_pagination ? undefined : skip,
            take: remove_pagination ? undefined : sanitizedLimit,
            where,
            orderBy: { createdAt: "desc" },
        }),
        prisma.pengaturanJadwal.count({ where }),
    ]);

    return { 
        data: data.map((m: any) => ({
            ...m,
            minSks: m.minSks.toFixed(0),
            maxSks: m.maxSks.toFixed(0),
        })), 
        total 
    };
}

export default async function GET_ALL() {
    await requireAuth();

    const result = await prisma.pengaturanJadwal.findMany({
        where: { deletedAt: null },
        orderBy: { jenisDosen: 'desc' }
    });

    return result;
}
