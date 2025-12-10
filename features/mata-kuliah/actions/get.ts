'use server'
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type SortProp = {
    field: string,
    orderBy: string | "asc" | "desc"
}
interface PropsPaginate {
    page?: number,
    limit?: number,
    search?: string,
    sort?: SortProp,
    id?: number,
    jurusanId?: number,
    semester?: string
}
export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "desc" },
    id,
    jurusanId,
    semester
}: PropsPaginate) {
    const skip = (page - 1) * limit;
    const searchFilter = search
        ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};
    const idFilter = id ? { id } : {};
    const jurusanFilter = jurusanId ? { jurusanId } : {};
    const semesterFilter = semester ? { semester: Number(semester) } : {};

    const where = {
        ...idFilter,
        ...searchFilter,
        ...jurusanFilter,
        ...semesterFilter
    };

    const [data, total] = await Promise.all([
        prisma.mataKuliah.findMany({
            skip,
            take: limit,
            where,
            orderBy: { [sort.field]: sort.orderBy },
            include: {
                Jurusan: { select: { id: true, nama: true, jenjang: true } }
            }
        }),
        prisma.mataKuliah.count({ where }),
    ]);

    return { data, total };
}

export async function GET_STATISTIC({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "desc" },
    id,
    jurusanId,
    semester
}: PropsPaginate) {
    const searchFilter = search
    ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } }
    : {};
const idFilter = id ? { id } : {};
const jurusanFilter = jurusanId ? { jurusanId } : {};
const semesterFilter = semester ? { semester: Number(semester) } : {};

const where = {
    ...idFilter,
    ...searchFilter,
    ...jurusanFilter,
    ...semesterFilter
};

// Step 1: Ambil unique berdasarkan nama, jurusanId, dan semester
const uniqueGroups = await prisma.mataKuliah.groupBy({
    by: ['nama', 'jurusanId', 'semester'],
    _max: { id: true },
    orderBy: { _max: { id: 'desc' } },
    skip: (page - 1) * limit,
    take: limit,
    where
});

// Step 2: Ambil detail untuk ID tertinggi setiap group
const maxIds = uniqueGroups.map(item => item._max.id).filter(id => id !== null);

if (maxIds.length === 0) {
    return { 
        data: [], 
        total: 0,
        page,
        limit,
        totalPages: 0 
    };
}

const details = await prisma.mataKuliah.findMany({
    where: { 
        id: { in: maxIds },
        ...where
    },
    include: {
        Jurusan: true,
    }
});

// Step 3: Processing dengan cleaning nama
const resultMap = new Map();

for (const item of details) {
    const cleanedNama = item.nama.replace(/\s+/g, ' ').trim();
    const normalizedLabel = cleanedNama.toLowerCase();
    
    // Buat unique key berdasarkan nama (normalized), jurusanId, dan semester
    const uniqueKey = `${normalizedLabel}|${item.jurusanId}|${item.semester}`;
    
    resultMap.set(uniqueKey, {
        nama: cleanedNama,
        id: item.id,
        sks: item.sks,
        jurusanId: item.jurusanId,
        jurusan: item.Jurusan?.nama,
        semester: item.semester,
        originalNama: item.nama
    });
}

const matkulOptions = Array.from(resultMap.values());
matkulOptions.sort((a, b) => a.nama.localeCompare(b.nama));

// Total unique groups dengan filter yang sama
const totalUniqueGroups = await prisma.mataKuliah.groupBy({
    by: ['nama', 'jurusanId', 'semester'],
    where,
    _count: { _all: true }
});

const totalUnique = totalUniqueGroups.length;
const totalPages = Math.ceil(totalUnique / limit);

    return { data: matkulOptions, total: totalPages };
}