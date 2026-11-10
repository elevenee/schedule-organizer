'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma, Role, TypeDosen } from "@prisma/client";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}

const ALLOWED_SORT_FIELDS = ["id", "nama", "nidn", "nip", "status", "createdAt", "updatedAt"];

export async function GET_PAGINATE({
    page = 1,
    limit = 100,
    search = "",
    sort = { field: "createdAt", orderBy: "DESC" },
    status = "",
    fakultasId,
    jurusanId,
    id,
    isActive = true,
    deleted = false
}: { page?: number, limit?: number, search?: string, sort?: SortProp, status?: string, fakultasId?: number, jurusanId?: number, id?: number, isActive?: boolean, deleted?: boolean }) {
    const session = await requireAuth();

    const sanitizedLimit = Math.min(Math.max(1, limit), 200);
    const sanitizedPage = Math.max(1, page);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const sortField = ALLOWED_SORT_FIELDS.includes(sort.field) ? sort.field : "createdAt";
    const sortOrder = String(sort.orderBy).toLowerCase() === "asc" ? "asc" : "desc";

    const searchNama = search
        ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};
    const statusFilter = status ? { status: status as TypeDosen } : {};

    const where: Prisma.DosenWhereInput = {
        ...searchNama,
        ...statusFilter,
        ...(id ? { id: BigInt(id) } : {}),
        ...(fakultasId ? { fakultasId: BigInt(fakultasId) } : {}),
        ...(jurusanId ? { jurusanId: BigInt(jurusanId) } : {}),
        ...(session.user.role === Role.ADMIN ? (deleted ? {} : { deletedAt: null }) : { deletedAt: null, isActive: true }),
    };

    const [data, total] = await Promise.all([
        prisma.dosen.findMany({
            skip,
            take: sanitizedLimit,
            where,
            orderBy: { [sortField]: sortOrder },
            include: {
                Fakultas: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                Jurusan: {
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
    await requireAuth();

    const result = await prisma.dosen.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: { nama: 'asc' }
    });

    return result;
}
