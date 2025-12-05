'use server'

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma, TypeDosen } from "@prisma/client";
import { getServerSession } from "next-auth";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}
export async function GET_PAGINATE({
    page = 1,
    limit = 100,
    search = "",
    sort = { field: "createdAt", orderBy: "DESC" },
    status = "",
    fakultasId,
    jurusanId,
    id,
}: { page?: number, limit?: number, search?: string, sort?: SortProp, status?: string, fakultasId?: number, jurusanId?: number, id?: number }) {
    const skip = (page - 1) * limit;
    const searchNama = search
        ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};
    const statusFilter = status ? { status: status as TypeDosen  } : {};
    const user = await getServerSession(authOptions);
    if (!user) throw new Error("Unauthorized");

     let withDeleted = { deletedAt: null } as any;
    if (user?.user?.role === 'ADMIN') {
        withDeleted = {  } as any;
    }

    const fakultasFilter = fakultasId ? { fakultasId } : {};
    const jurusanFilter = jurusanId ? { jurusanId } : {};
    const idFilter = id ? { id } : {};

    const where = {
        ...idFilter,
        ...searchNama,
        ...statusFilter,
        ...fakultasFilter,
        ...jurusanFilter,
        ...withDeleted
    };
    // prisma.user.findMany({ withDeleted: true })
    const [data, total] = await Promise.all([
        prisma.dosen.findMany({
            skip,
            take: limit,
            where,
            orderBy: { [sort.field]: sort.orderBy },
            include: {
                Fakultas: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            }
        }),
        prisma.dosen.count({ where }),
    ]);
    return { data, total };
}

export default async function GET_ALL() {
    const result = await prisma.dosen.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }
    });

    return result;
}