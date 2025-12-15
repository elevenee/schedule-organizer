'use server'

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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
    tahunAkademik?: number | null;
    fakultas?: number | null;
    programStudi?: number | null;
    matakuliah?: string | null;
    dosen?: number | null,
    semester?: string | null,
    kelas?: string[]
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
    const skip = (page - 1) * limit;
    const fakultasFilter = fakultas ? {
        fakultasId: fakultas
    } : {}
    const programStudiFilter = programStudi ? {
        jurusanId: programStudi
    } : {}
    const semesterFilter = semester ? {
        semester: Number(semester)
    } : {}
    const kelasFilter = kelas.length ? {
        kelas: { hasSome: kelas}
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

    const whereSisaSks = {
        tahunAkademikId: selectedTahunAkademik,
        ...fakultasFilter,
        ...programStudiFilter,
        ...matakuliahFilter,
        ...semesterFilter,
        ...kelasFilter
    };
    const [data, total] = await Promise.all([
        prisma.sisaSks.findMany({
            skip,
            take: limit,
            where: whereSisaSks,
            include: {
                Fakultas:{
                    select:{
                        id: true,
                        nama: true
                    }
                },
                Jurusan:{
                    select:{
                        id: true,
                        nama: true
                    }
                },
                Matakuliah:{
                    select:{
                        id: true,
                        nama: true,
                        semester: true,
                        sks: true
                    }
                }
            }
        }),
        prisma.sisaSks.count({ where: whereSisaSks }),
    ]);
    const listData = data.map((d:any)=>{
        return {
            ...d,
            sks: d.sks.toNumber(),
            totalSks: d.sks.toNumber() * d.kelas.length
        }
    })
    return { data: listData, total };
}

export default async function GET_ALL() {
    const result = await prisma.jadwal.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return result;
}