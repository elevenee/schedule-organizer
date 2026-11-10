'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}

const ALLOWED_SORT_FIELDS = ["id", "nama", "kode", "singkatan", "jenjang", "createdAt", "updatedAt"];

export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    fakultas = "",
    sort = { field: "createdAt", orderBy: "DESC" },
    id,
}: { page?: number, limit?: number, search?: string, sort?: SortProp, fakultas?: string, id?: number }) {
    const session = await requireAuth();

    const sanitizedLimit = Math.min(Math.max(1, limit), 100);
    const sanitizedPage = Math.max(1, page);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const sortField = ALLOWED_SORT_FIELDS.includes(sort.field) ? sort.field : "createdAt";
    const sortOrder = String(sort.orderBy).toLowerCase() === "asc" ? "asc" : "desc";
    
    const searchFilters = {
        OR: [
            { nama: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { kode: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
    };

    let targetFakultasId: bigint | null = null;
    if (session.user.role === Role.FAKULTAS && session.user.fakultasId) {
        targetFakultasId = BigInt(session.user.fakultasId);
    } else if (fakultas && fakultas !== 'ALL' && fakultas !== '' && fakultas !== '0') {
        targetFakultasId = BigInt(fakultas);
    }

    const where: Prisma.JurusanWhereInput = {
        ...(search ? searchFilters : {}),
        ...(targetFakultasId ? { fakultasId: targetFakultasId } : {}),
        ...(id ? { id: BigInt(id) } : {}),
        deletedAt: null
    };    
    
    const [data, total] = await Promise.all([
        prisma.jurusan.findMany({
            skip,
            take: sanitizedLimit,
            where,
            orderBy: { [sortField]: sortOrder as Prisma.SortOrder },
            include: {
                Fakultas: { select: { id: true, nama: true } }
            }
        }),
        prisma.jurusan.count({ where }),
    ]);   
    
    return { data, total };
}

export default async function GET_ALL() {
    await requireAuth();

    const result = await prisma.jurusan.findMany({
        where: { deletedAt: null },
        orderBy: { nama: 'asc' },
        include: {
            Fakultas: {
                select: { id: true, nama: true }
            }
        }
    });

    return result;
}
