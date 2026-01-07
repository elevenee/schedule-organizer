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
    semester?: string,
    kurikulumId: number,
    kelas?: string[]
}
export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "desc" },
    id,
    jurusanId,
    kurikulumId,
    semester,
}: PropsPaginate) {
    const skip = (page - 1) * limit;
    const searchFilter = search
        ? { nama: { contains: search, mode: Prisma.QueryMode.insensitive } }
        : {};
    const idFilter = id ? { id } : {};
    const jurusanFilter = jurusanId ? { jurusanId } : {};

    const semesterFilter = semester ? (Number(semester) === 6 || Number(semester) === 7) ? { semester: { in: [Number(semester), 99] } } : { semester: Number(semester) } : {};
    
    const activeCuriculums = await prisma.kurikulum.findMany({
        where: {
            status: "ACTIVE"
        },
        select: {
            id: true
        }
    })
    const kurikulumFilter = kurikulumId ? { kurikulumId: Number(kurikulumId) }
        : { kurikulumId: { in: activeCuriculums.map((m) => m.id) } };

    const where = {
        ...idFilter,
        ...searchFilter,
        ...jurusanFilter,
        // ...semesterFilter,
        ...kurikulumFilter
    };

    const tahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: "ACTIVE" },
    })
    if (!tahunAkademik) {
        throw new Error("Tahun akademik tidak ditemukan")
    }

    const [data, total] = await Promise.all([
        prisma.mataKuliah.findMany({
            skip,
            take: limit,
            where,
            orderBy: { [sort.field]: sort.orderBy },
            include: {
                kurikulum: {
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
        prisma.mataKuliah.count({
            where
        })
    ])

    return {
        data: data?.map((d: any) => {
            const cleanedNama = d.nama.replace(/\s+/g, ' ').trim();
            return {
                nama: cleanedNama?.toUpperCase(),
                id: d.id,
                sks: d.sks,
                jurusanId: d.jurusanId,
                jurusan: d.Jurusan?.nama,
                semester: d.semester,
                originalNama: d.nama,
                kurikulum: d.kurikulum?.nama
            }
        }), total
    };
}

export async function GET_STATISTIC({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "desc" },
    id,
    jurusanId,
    semester,
    kelas = [],
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

    const tahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: "ACTIVE" },
    })
    if (!tahunAkademik) {
        throw new Error("Tahun akademik tidak ditemukan")
    }

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

    const kelasFilter = kelas.length ? {
        kelas: { hasSome: kelas }
    } : {}

    const jadwalData = await prisma.jadwal.findMany({
        where: {
            ...searchFilter,
            ...jurusanFilter,
            ...semesterFilter,
            ...kelasFilter
        },
        select: {
            id: true,
            dosenId: true,
            matakuliahId: true,
            sks: true,
            kelas: true,
            semester: true,
            keterangan: true,
            Fakultas: {
                select: {
                    id: true,
                    nama: true
                }
            },
            Jurusan: {
                select: {
                    id: true,
                    nama: true,
                    jenjang: true
                }
            },
            Matakuliah: true
        },
        orderBy: [
            { semester: 'asc' },
            { Matakuliah: { nama: 'asc' } }
        ]
    })

    const jadwalByMatkul = jadwalData.reduce((acc, jadwal) => {
        const matkuls = jadwal.matakuliahId.toString();
        if (!acc[matkuls]) {
            acc[matkuls] = [];
        }
        acc[matkuls].push(jadwal);
        return acc;
    }, {} as Record<string, typeof jadwalData>);

    const data = matkulOptions.map((matkul: any) => {
        const jadwalMatkul = jadwalByMatkul[matkul.id] || [];
        const listJadwal = jadwalMatkul.map((j: any) => ({
            id: j.id,
            matakuliah: j.matakuliah,
            sks: j.sks?.toNumber(),
            kelas: j.kelas,
            semester: j.semester,
            keterangan: j.keterangan,
            fakultas: j.Fakultas?.nama,
            jurusan: j.Jurusan?.nama,
            fakultasId: j.Fakultas?.id,
            jurusanId: j.Jurusan?.id,
            dosenId: j.dosenId,
            keteranganAdmin: j.keteranganAdmin,
        }));

        return {
            id: matkul.id,
            nama: matkul.nama,
            totalJadwal: jadwalMatkul.length,
            totalSKS: jadwalMatkul.reduce((sum: any, j: any) => sum + (j.sks?.toNumber() * j.kelas.length), 0),
            totalSKSRequest: jadwalMatkul.reduce((sum: any, j: any) => sum + (j.sks?.toNumber() * j.kelas.length), 0),
            jadwal: jadwalByMatkul
        };
    })
}