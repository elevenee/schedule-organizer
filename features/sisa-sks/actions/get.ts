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
    matakuliah?: string | null;
    dosen?: number | null
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
    matakuliah = null,
    dosen = null
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
    const matakuliahFilter = matakuliah ? {
        matakuliah: { contains: matakuliah, mode: Prisma.QueryMode.insensitive }
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
        id: dosen ? dosen : {}
    };

    const whereSisaSks = {
        tahunAkademikId: selectedTahunAkademik,
        ...fakultasFilter,
        ...programStudiFilter,
        ...matakuliahFilter,
        ...dosenFilter
    };

    const [dosenList, sisaSksData, total] = await Promise.all([
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
        prisma.sisaSks.findMany({
            where: whereSisaSks,
            select: {
                id: true,
                dosenId: true,
                matakuliah: true,
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
                }
            },
            orderBy: [
                { semester: 'asc' },
                { matakuliah: 'asc' }
            ]
        }),
        prisma.dosen.count(),
    ]);

    // Group jadwal by dosenId untuk mapping
    const sisaSksByDosen = sisaSksData.reduce((acc, jadwal) => {
        const dosenIdStr = jadwal.dosenId.toString(); // Convert bigint to string
        if (!acc[dosenIdStr]) {
            acc[dosenIdStr] = [];
        }
        acc[dosenIdStr].push(jadwal);
        return acc;
    }, {} as Record<string, typeof sisaSksData>);

    const data = dosenList.map(dosen => {
        const jadwalDosen = sisaSksByDosen[dosen.id.toString()] || [];

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
                matakuliah: j.matakuliah,
                sks: j.sks?.toString(),
                kelas: j.kelas,
                semester: j.semester,
                keterangan: j.keterangan,
                fakultas: j.Fakultas?.nama,
                jurusan: j.Jurusan?.nama,
                fakultasId: j.Fakultas?.id,
                jurusanId: j.Jurusan?.id,
                dosenId: j.dosenId
            }))
        };
    });
    return { data, total };
}

export default async function GET_ALL() {
    const result = await prisma.jadwal.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return result;
}