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
    fakultas = "",
    sort = { field: "createdAt", orderBy: "DESC" },
}: { page?: number, limit?: number, search?: string, sort?: SortProp, fakultas?: string }) {
    const skip = (page - 1) * limit;

    const searchFilters = {
        OR: [
            { nama: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
    };
    const fakultasFilter = fakultas && fakultas !== 'ALL' && fakultas !== '' && fakultas !== '0' ? {
        fakultasId: Number(fakultas)
    } : {}
    
    const user = await getServerSession(authOptions);
    if (!user) throw new Error("Unauthorized");

    let withDeleted = { deletedAcreatedAt: null } as any;
    if (user?.user?.role !== 'SUPER_ADMIN') {
        withDeleted = {};
    }

    const where = {
        ...(search ? searchFilters : {}),
        ...fakultasFilter,
        ...withDeleted
    };    

    const [data, total] = await Promise.all([
        prisma.jurusan.findMany({
            skip,
            take: limit,
            where: where,
            orderBy: { createdAt: "desc" },
            include: {
                Fakultas: { select: { id: true, nama: true } }
            }
        }),
        prisma.jurusan.count({ where }),
    ]);    

    return { data, total };
}

export default async function GET_ALL() {
    const result = await prisma.jurusan.findMany({
        include: {
            Fakultas: {
                select: { id: true, nama: true }
            }
        }
    });

    return result;
}