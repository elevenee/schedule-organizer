'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma, Role, StatusUser } from "@prisma/client";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}

const ALLOWED_SORT_FIELDS = ["id", "name", "username", "role", "status", "createdAt", "updatedAt"];

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
    await requireAuth([Role.ADMIN]);

    const sanitizedLimit = Math.min(Math.max(1, limit), 100);
    const sanitizedPage = Math.max(1, page);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const sortField = ALLOWED_SORT_FIELDS.includes(sort.field) ? sort.field : "createdAt";
    const sortOrder = String(sort.orderBy).toLowerCase() === "asc" ? "asc" : "desc";

    const searchName = search
        ? {
            OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ]
        }
        : {};

    const statusFilter = status && status !== ''
        ? { status: status as StatusUser } : {};
    const roleFilter = role && role !== ''
        ? { role: role as Role } : {};
    const fakultasFilter = fakultasId
        ? { fakultasId: BigInt(fakultasId) } : {};

    const where: Prisma.UserWhereInput = {
        ...searchName,
        ...statusFilter,
        ...roleFilter,
        ...fakultasFilter,
    };

    const userSelect = {
        id: true,
        name: true,
        username: true,
        role: true,
        status: true,
        fakultasId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        Fakultas: {
            select: {
                id: true,
                nama: true
            }
        }
    };

    const [data, total] = await Promise.all([
        prisma.user.findMany({
            skip: remove_pagination ? undefined : skip,
            take: remove_pagination ? undefined : sanitizedLimit,
            where,
            orderBy: { [sortField]: sortOrder },
            select: userSelect
        }),
        prisma.user.count({ where }),
    ]);

    return { data, total };
}

export default async function GET_ALL() {
    await requireAuth([Role.ADMIN]);

    const result = await prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            username: true,
            role: true,
            status: true,
            fakultasId: true,
            createdAt: true,
            Fakultas: {
                select: {
                    id: true,
                    nama: true
                }
            }
        }
    });

    return result;
}
