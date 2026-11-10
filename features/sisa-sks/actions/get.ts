'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}

interface PropsPaginate {
    page?: number;
    limit?: number;
    search?: string;
    sort?: SortProp;
    remove_pagination?: boolean;
    tahunAkademik?: number | null;
    fakultas?: number | null;
    programStudi?: number | null;
    matakuliah?: string | null;
    dosen?: number | null;
    semester?: string | null;
    kelas?: string[];
}

export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "DESC" },
    remove_pagination = false,
    tahunAkademik = null,
    fakultas = null,
    programStudi = null,
    matakuliah = null,
    semester = null,
    kelas = []
}: PropsPaginate) {
    const session = await requireAuth();

    const sanitizedLimit = Math.min(Math.max(1, limit), 100);
    const sanitizedPage = Math.max(1, page);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    let targetFakultasId = fakultas;
    if (session.user.role === Role.FAKULTAS && session.user.fakultasId) {
        targetFakultasId = Number(session.user.fakultasId);
    }

    const fakultasFilter = targetFakultasId ? {
        fakultasId: BigInt(targetFakultasId)
    } : {};
    const programStudiFilter = programStudi ? {
        jurusanId: BigInt(programStudi)
    } : {};
    const semesterFilter = semester ? {
        semester: Number(semester)
    } : {};
    const kelasFilter = kelas.length ? {
        kelas: { hasSome: kelas }
    } : {};
    const matakuliahFilter = matakuliah ? {
        Matakuliah: { nama: { contains: matakuliah, mode: Prisma.QueryMode.insensitive } }
    } : {};

    const whereSisaSks: Prisma.SisaSksWhereInput = {
        ...(tahunAkademik ? { tahunAkademikId: BigInt(tahunAkademik) } : {}),
        ...fakultasFilter,
        ...programStudiFilter,
        ...matakuliahFilter,
        ...semesterFilter,
        ...kelasFilter
    };

    const [data, total] = await Promise.all([
        prisma.sisaSks.findMany({
            skip: remove_pagination ? undefined : skip,
            take: remove_pagination ? undefined : sanitizedLimit,
            where: whereSisaSks,
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
                },
                Matakuliah: {
                    select: {
                        id: true,
                        nama: true,
                        semester: true,
                        sks: true,
                        kurikulumId: true
                    }
                }
            }
        }),
        prisma.sisaSks.count({ where: whereSisaSks }),
    ]);

    const listData = data.map((d: any) => ({
        ...d,
        sks: d.sks.toNumber(),
        totalSks: d.sks.toNumber() * d.kelas.length
    }));

    return { data: listData, total };
}

export default async function GET_ALL() {
    await requireAuth();

    const result = await prisma.sisaSks.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return result;
}
