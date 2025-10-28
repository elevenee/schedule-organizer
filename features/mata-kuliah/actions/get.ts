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
    remove_pagination = false
}: { page?: number, limit?: number, search?: string, sort?: SortProp, remove_pagination?: boolean }) {
    const skip = (page - 1) * limit;
    const searchNama = search
        ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};
    
    const user = await getServerSession(authOptions);
    if (!user) throw new Error("Unauthorized");

    let withDeleted = { deletedAt: null } as any;
    if (user?.user?.role !== 'ADMIN') {
        withDeleted = {};
    }

    const where = {
        ...searchNama,
        ...withDeleted
    };

    const [data, total] = await Promise.all([
        prisma.mataKuliah.findMany({
            skip,
            take: limit,
            where,
            orderBy: { [sort.field]: sort.orderBy },
        }),
        prisma.mataKuliah.count({ where }),
    ]);

    return { data, total };
}

export default async function GET_ALL() {
    const result = await prisma.mataKuliah.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }
    });

    return result;
}