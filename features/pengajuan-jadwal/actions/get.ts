'use server'

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma, StatusJadwalRequest, TypeDosen } from "@prisma/client";
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
    jenisDosen = "",
    tahunAkademik = null,
    programStudi = null,
    matakuliah = null,
    status,
}: { page?: number, limit?: number, search?: string, sort?: SortProp, remove_pagination?: boolean, jenisDosen?: string, tahunAkademik?: number | null, programStudi?: number | null, matakuliah?: string | null, status?: string | null }) {
    const skip = (page - 1) * limit;

    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");
    if (session.user?.role !== 'FAKULTAS' && session.user?.role !== 'ADMIN') throw new Error("Unauthorized");
    const fakultas = session.user?.fakultasId ?? undefined;
    const searchFilter = search
        ? {
            Dosen: {
                nama: { contains: search, mode: Prisma.QueryMode.insensitive }
            },
            matakuliah: { contains: search, mode: Prisma.QueryMode.insensitive },
        }
        : {};
    const statusFilter = status ? {
        status: status as StatusJadwalRequest
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
        ...fakultasFilter,
        ...jenisDosenFilter,
    };

    const whereJadwal = {
        tahunAkademikId: selectedTahunAkademik,
        ...fakultasFilter,
        ...programStudiFilter,
        ...matakuliahFilter,
    };

    const [jadwalData, jadwalDataRequest, total] = await Promise.all([
        prisma.jadwal.findMany({
            where: whereJadwal,
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
        prisma.jadwalRequest.findMany({
            where: { ...whereJadwal, ...statusFilter },
            select: {
                id: true,
                dosenId: true,
                matakuliah: true,
                sks: true,
                kelas: true,
                semester: true,
                keterangan: true,
                status: true,
                keteranganAdmin: true,
                Dosen: {
                    select: {
                        id: true,
                        nama: true,
                        nidn: true,
                        status: true,
                        Jurusan: {
                            select: {
                                nama: true
                            }
                        }
                    }
                },
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
    // const listDosenx = Array.from(
    //     new Map(
    //         jadwalDataRequest.map(j => [
    //             j.dosenId,
    //             {
    //                 id: j.dosenId,
    //                 nama: j.Dosen?.nama,
    //                 nidn: j.Dosen?.nidn,
    //                 status: j.Dosen?.status,
    //                 homebase: j.Dosen?.Jurusan?.nama || "-",
    //             }
    //         ])
    //     ).values()
    // );

    const uniqueDosen = jadwalDataRequest.reduce((acc, j) => {
        if (!j.dosenId || !j.Dosen) return acc;

        if (!acc.has(j.dosenId)) {
            acc.set(j.dosenId, {
                id: j.dosenId,
                nama: j.Dosen.nama,
                nidn: j.Dosen.nidn,
                status: j.Dosen.status,
                homebase: j.Dosen.Jurusan?.nama || "-",
                totalJadwal: 0,
                jadwalIds: new Set()
            });
        }

        const dosen = acc.get(j.dosenId);
        dosen.totalJadwal++;

        return acc;
    }, new Map());

    // Convert ke array
    const listDosenx = Array.from(uniqueDosen.values());

    // Group jadwal by dosenId untuk mapping
    const jadwalByDosen = jadwalData.reduce((acc, jadwal) => {
        const dosenIdStr = jadwal.dosenId.toString();
        if (!acc[dosenIdStr]) {
            acc[dosenIdStr] = [];
        }
        acc[dosenIdStr].push(jadwal);
        return acc;
    }, {} as Record<string, typeof jadwalData>);
    const jadwalRequestByDosen = jadwalDataRequest.reduce((acc, jadwal) => {
        const dosenIdStr = jadwal.dosenId.toString();
        if (!acc[dosenIdStr]) {
            acc[dosenIdStr] = [];
        }
        acc[dosenIdStr].push(jadwal);
        return acc;
    }, {} as Record<string, typeof jadwalData>);

    const data = listDosenx.map(dosen => {
        const jadwalDosen = jadwalByDosen[dosen.id.toString()] || [];
        const jadwalRequestDosen = jadwalRequestByDosen[dosen.id.toString()] || [];

        return {
            id: dosen.id,
            nama: dosen.nama,
            nidn: dosen.nidn,
            status: dosen.status,
            homebase: dosen.homebase || "-",
            tahunAkademik: findTahunAkademik?.name.replace(/_/g, '/') || "" + " - SMT " + findTahunAkademik?.semester,
            totalJadwal: jadwalDosen.length,
            totalSKS: jadwalDosen.reduce((sum: any, j: any) => sum + (j.sks?.toNumber() * j.kelas.length), 0),
            totalSKSRequest: jadwalRequestDosen.reduce((sum: any, j: any) => sum + (j.sks?.toNumber() * j.kelas.length), 0),
            jadwal: jadwalRequestDosen.map((j: any) => ({
                id: j.id,
                matakuliah: j.matakuliah,
                sks: j.sks?.toNumber(),
                kelas: j.kelas,
                semester: j.semester,
                keterangan: j.keterangan,
                fakultas: j.Fakultas?.nama,
                jurusan: j.Jurusan?.nama + ` (${j.Jurusan?.jenjang})`,
                fakultasId: j.Fakultas?.id,
                jurusanId: j.Jurusan?.id,
                dosenId: j.dosenId,
                status: j.status,
                keteranganAdmin: j.keteranganAdmin,
            }))
        };
    });
    return { data, total };
}

export default async function GET_ALL() {
    const result = await prisma.jadwalRequest.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return result;
}