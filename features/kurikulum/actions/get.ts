'use server'

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";

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
    const skip = (page - 1) * limit;
    const searchKurikulum = search
        ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};

    const user = await getServerSession(authOptions);
    if (!user) throw new Error("Unauthorized");

    let withDeleted = { deletedAt: null } as any;
    if (user?.user?.role === 'ADMIN') {
        withDeleted = {} as any;
    }

    const getKurikulumMatakul = await prisma.mataKuliah.findMany({
        where: {
            jurusanId: jurusanId ? Number(jurusanId) : 99999999
        }
    })

    const where = {
        ...searchKurikulum,
        ...withDeleted,
        id: { in: getKurikulumMatakul.map((x) => x.kurikulumId) }
    };
    const [data, total] = await Promise.all([
        prisma.kurikulum.findMany({
            skip,
            take: limit,
            where,
            orderBy: { "status": "asc" },
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
    const getKurikulumMatakul = await prisma.mataKuliah.findMany({
        where: {
            jurusanId: jurusanId ? Number(jurusanId) : 99999999
        }
    })
    const ids = getKurikulumMatakul
        ?.map((x) => x.kurikulumId)
        ?.filter((id): id is number => id !== null) ?? [];
    

    const result = await prisma.kurikulum.findMany({
        where: {
            id: { in: ids },
            status: 'ACTIVE',
            nama: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
        orderBy: { [sort.field]: sort.orderBy }
    });

    return result;
}