'use server'

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma, Role, StatusUser } from "@prisma/client";
import { getServerSession } from "next-auth";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}
export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    status,
    role,
    sort = { field: "createdAt", orderBy: "DESC" },
    remove_pagination = false,
    fakultasId,
}: { page?: number, limit?: number, search?: string, sort?: SortProp, remove_pagination?: boolean, status?: string, role?: string, fakultasId?: number }) {
    const skip = (page - 1) * limit;
    const searchName = search
        ? {
            OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ]
        }
        : {};

    const statusFilter = status && status !== ''
        ? { status: status as StatusUser } : {};
    const roleFilter = role && role !== ''
        ? { role: role as Role } : {};
    const fakultasFilter = fakultasId
        ? { fakultasId: fakultasId } : {};

    const user = await getServerSession(authOptions);
    if (!user) throw new Error("Unauthorized");

    let withDeleted = {deletedAt: null} as any;
    if (user?.user?.role === 'ADMIN') {
        withDeleted = {};
    }

    const where = {
        ...searchName,
        ...statusFilter,
        ...roleFilter,
        ...fakultasFilter,
        ...withDeleted
    };

    const [data, total] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: limit,
            where,
            orderBy: { [sort.field]: sort.orderBy },
            include: {
                Fakultas: {
                    select:{
                        id: true,
                        nama: true
                    }
                }
            }
        }),
        prisma.user.count({ where }),
    ]);

    return { data, total };
}

export default async function GET_ALL() {
    const result = await prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }
    });

    return result;
}