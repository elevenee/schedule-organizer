'use server'

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Jadwal, Prisma, TypeDosen } from "@prisma/client";
import { getServerSession } from "next-auth";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}
export async function GET_PAGINATE({
    page = 1,
    limit = 10,
    search = "",
    sort = { field: "createdAt", orderBy: "DESC" },
    remove_pagination = false,
    jenisDosen = ""
}: { page?: number, limit?: number, search?: string, sort?: SortProp, remove_pagination?: boolean, jenisDosen?: string }) {
    const skip = (page - 1) * limit;
    const searchFilter = search
        ? {
            Dosen: {
                nama: { contains: search, mode: Prisma.QueryMode.insensitive }
            },
            matakuliah: { contains: search, mode: Prisma.QueryMode.insensitive }
        }
        : {};
    const jenisDosenFilter = jenisDosen ? {
        status: jenisDosen as TypeDosen
    }:{}
    const user = await getServerSession(authOptions);
    if (!user) throw new Error("Unauthorized");

    const where = {
        ...searchFilter,
        ...jenisDosenFilter
    };

    // const [data, total] = await Promise.all([
    //     prisma.jadwal.findMany({
    //         where,
    //         include: {
    //             Dosen: {
    //                 select: {
    //                     id: true,
    //                     nama: true,
    //                     nidn: true,
    //                 }
    //             }
    //         },
    //         orderBy: [
    //             { tahunAkademik: 'desc' },
    //             { Dosen: { nama: 'asc' } },
    //             { semester: 'asc' }
    //         ],
    //         skip,
    //         take: limit,
    //     }),
    //     prisma.jadwal.count({ where }),
    // ]);

    // // Single pass grouping - most efficient
    // const groupedData = data.reduce((acc:any, jadwal:any) => {
    //     const key = `${jadwal.dosenId}-${jadwal.tahunAkademik}`;

    //     if (!acc[key]) {
    //         acc[key] = {
    //             id: jadwal.Dosen.id,
    //             nama: jadwal.Dosen.nama,
    //             nidn: jadwal.Dosen.nidn,
    //             tahunAkademik: jadwal.tahunAkademik.replace(/_/g, '/'),
    //             jadwal: [],
    //             totalJadwal: 0,
    //             totalSKS: 0
    //         };
    //     }

    //     acc[key].jadwal.push({
    //         matakuliah: jadwal.matakuliah,
    //         sks: jadwal.sks,
    //         kelas: jadwal.kelas,
    //         semester: jadwal.semester,
    //         keterangan: jadwal.keterangan
    //     });
    //     acc[key].totalJadwal += 1;
    //     acc[key].totalSKS += jadwal.sks;

    //     return acc;
    // }, {});

    // const resultData = Object.values(groupedData);
    // return { data:resultData, total };
    const selectedTahunAkademik = "2026/2027";

    const [dosenList, jadwalData, total] = await Promise.all([
        prisma.dosen.findMany({
            where: where,
            select: {
                id: true,
                nama: true,
                nidn: true,
                status: true
            },
            orderBy: { nama: 'asc' },
            skip,
            take: limit,
        }),
        prisma.jadwal.findMany({
            where: {
                tahunAkademik: selectedTahunAkademik,
                ...where
            },
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
                        nama: true
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
    const jadwalByDosen = jadwalData.reduce((acc, jadwal) => {
        const dosenIdStr = jadwal.dosenId.toString(); // Convert bigint to string
        if (!acc[dosenIdStr]) {
            acc[dosenIdStr] = [];
        }
        acc[dosenIdStr].push(jadwal);
        return acc;
    }, {} as Record<string, typeof jadwalData>);

    const data = dosenList.map(dosen => {
        const jadwalDosen = jadwalByDosen[dosen.id.toString()] || [];
        
        return {
            id: dosen.id,
            nama: dosen.nama,
            nidn: dosen.nidn,
            status: dosen.status,
            tahunAkademik: selectedTahunAkademik.replace(/_/g, '/'),
            totalJadwal: jadwalDosen.length,
            totalSKS: jadwalDosen.reduce((sum: any, j: any) => sum + j.sks, 0),
            jadwal: jadwalDosen.map((j: any) => ({
                matakuliah: j.matakuliah,
                sks: j.sks,
                kelas: j.kelas,
                semester: j.semester,
                keterangan: j.keterangan,
                fakultas: j.Fakultas?.nama,
                jurusan: j.Jurusan?.nama,
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