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
}: { page?: number, limit?: number, search?: string, sort?: SortProp}) {
    const skip = (page - 1) * limit;
    const searchTahun = search
        ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};
    
    const user = await getServerSession(authOptions);
    if (!user) throw new Error("Unauthorized");

   let withDeleted = { deletedAt: null } as any;
    if (user?.user?.role === 'ADMIN') {
        withDeleted = {  } as any;
    }

    const where = {
        ...searchTahun,
        ...withDeleted
    };

    const [data, total] = await Promise.all([
        prisma.tahunAkademik.findMany({
            skip,
            take: limit,
            where,
            orderBy: { "status": "asc" },
        }),
        prisma.tahunAkademik.count({ where }),
    ]);

    return { data, total };
}

export default async function GET_ALL() {
    const result = await prisma.tahunAkademik.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }
    });

    return result;
}
export async function GET_TAHUN_AKADEMIK_AKTIF() {
    const result = await prisma.tahunAkademik.findFirst({
        where: { deletedAt: null, status:'ACTIVE' },
    });

    return result;
}