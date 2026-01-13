'use server'

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma, TypeDosen } from "@prisma/client";
import { getServerSession } from "next-auth";

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
    jenisDosen?: string;
    tahunAkademik?: number | null;
    fakultas?: number | null;
    programStudi?: number | null;
    fakultasBase?: number | null;
    programStudiBase?: number | null;
    matakuliah?: string | null;
    dosen?: number | null,
    semester?: string | null,
    kelas?: string[],
    totalSks?: string | null
}
export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "DESC" },
    remove_pagination = false,
    jenisDosen = "",
    tahunAkademik = null,
    fakultas = null,
    programStudi = null,
    fakultasBase = null,
    programStudiBase = null,
    matakuliah = null,
    dosen = null,
    semester = null,
    kelas = [],
    totalSks = null
}: PropsPaginate) {
    const skip = (page - 1) * limit;
    const searchFilter = search
        ? {
            Dosen: {
                nama: { contains: search, mode: Prisma.QueryMode.insensitive }
            },
            matakuliah: { contains: search, mode: Prisma.QueryMode.insensitive },
        }
        : {};
    const dosenFilter = dosen ? {
        dosenId: dosen
    } : {}
    const jenisDosenFilter = jenisDosen ? {
        status: jenisDosen as TypeDosen
    } : {}
    const fakultasFilter = fakultas ? {
        fakultasId: fakultas
    } : {}
    const programStudiFilter = programStudi ? {
        jurusanId: programStudi
    } : {}
    const fakultasBaseFilter = fakultasBase ? {
        fakultasId: fakultasBase
    } : {}
    const programStudiBaseFilter = programStudiBase ? {
        jurusanId: programStudiBase
    } : {}
    const semesterFilter = semester ? {
        semester: Number(semester)
    } : {}
    const kelasFilter = kelas.length ? {
        kelas: { hasSome: kelas }
    } : {}
    const matakuliahFilter = matakuliah ? {
        Matakuliah: {
            nama: { contains: matakuliah, mode: Prisma.QueryMode.insensitive }
        }
    } : {}

    const user = await getServerSession(authOptions);
    if (!user) throw new Error("Unauthorized");
    const selectedTahunAkademik = tahunAkademik ?? undefined;
    const findTahunAkademik = selectedTahunAkademik
        ? await prisma.tahunAkademik.findUnique({
            where: { id: selectedTahunAkademik }
        })
        : null;

    const where = {
        ...searchFilter,
        ...jenisDosenFilter,
        ...fakultasBaseFilter,
        ...programStudiBaseFilter,
        isActive: true,
        id: dosen ? dosen : {}
    };
    const whereJadwal = {
        tahunAkademikId: selectedTahunAkademik,
        ...fakultasFilter,
        ...programStudiFilter,
        ...matakuliahFilter,
        ...dosenFilter,
        ...semesterFilter,
        ...kelasFilter
    };

    const [pengaturan, dosenList, jadwalData, total] = await Promise.all([
        prisma.pengaturanJadwal.findMany(),
        prisma.dosen.findMany({
            where: where,
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
            },
            orderBy: { nama: 'asc' },
        }),
        prisma.jadwal.findMany({
            where: whereJadwal,
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
                Matakuliah: {
                    select: {
                        id: true,
                        nama: true,
                        semester: true,
                        sks: true,
                        kurikulumId: true
                    }
                }
            },
            orderBy: [
                { semester: 'asc' },
                { Matakuliah: { id: 'asc' } }
            ]
        }),
        prisma.dosen.count(),
    ]);

    // Group jadwal by dosenId untuk mapping
    const jadwalByDosen = jadwalData.reduce((acc, jadwal) => {
        const dosenIdStr = jadwal.dosenId.toString(); // Convert bigint to string
        if (!acc[dosenIdStr]) {
            acc[dosenIdStr] = [];
        }
        acc[dosenIdStr].push(jadwal);
        return acc;
    }, {} as Record<string, typeof jadwalData>);

    let data = dosenList.map(dosen => {
        const jadwalDosen = jadwalByDosen[dosen.id.toString()] || [];

        return {
            id: dosen.id,
            nama: dosen.nama,
            nidn: dosen.nidn,
            status: dosen.status,
            homebase: dosen.Jurusan?.nama || "-",
            tahunAkademik: findTahunAkademik?.name.replace(/_/g, '/') || "" + " - SMT " + findTahunAkademik?.semester,
            totalJadwal: jadwalDosen.length,
            totalSKS: jadwalDosen.reduce((sum: any, j: any) => sum + (j.sks?.toNumber() * j.kelas.length), 0),
            jadwal: jadwalDosen.map((j: any) => ({
                id: j.id,
                matakuliah: j.Matakuliah?.nama?.toUpperCase(),
                sks: j.sks?.toString(),
                kelas: j.kelas.sort(),
                semester: j.semester,
                keterangan: j.keterangan,
                fakultas: j.Fakultas?.nama,
                jurusan: j.Jurusan?.nama,
                fakultasId: j.Fakultas?.id,
                jurusanId: j.Jurusan?.id,
                dosenId: j.dosenId,
                matakuliahId: j.matakuliahId,
                kurikulumId: j.Matakuliah?.kurikulumId,
            }))
        };
    });
    if (fakultasFilter || programStudiFilter || matakuliahFilter) {
        data = data.filter((x) => x.jadwal.length > 0);
    }

    if (!totalSks) return { data, total };

    return {
        data: data.filter((d) => {
            const pengaturanMap = new Map<TypeDosen, number>(
                pengaturan.map(p => [
                    p.jenisDosen,
                    p.maxSks?.toNumber() ?? 0
                ])
            );
            const maxSks = pengaturanMap.get(d.status) ?? 0;

            if (totalSks === 'TERPENUHI') {
                return d.totalSKS <= maxSks;
            }

            if (totalSks === 'MELEBIHI_BATAS') {
                return d.totalSKS > maxSks;
            }
            if (totalSks === 'BELUM_ADA') {
                return d.totalSKS === 0;
            }

            return true;
        }),
        total
    };
}

export default async function GET_ALL() {
    const result = await prisma.jadwal.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return result;
}