'use server'

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma, Role, StatusJadwalRequest, TypeDosen } from "@prisma/client";

type SortProp = {
    field: string,
    orderBy: string | "ASC" | "DESC"
}
interface PaginateProps {
    page?: number,
    limit?: number,
    search?: string,
    sort?: SortProp,
    remove_pagination?: boolean,
    jenisDosen?: string,
    tahunAkademik?: number | null,
    programStudi?: number | null,
    matakuliah?: string | null,
    status?: string | null,
    dosen?: number | null,
    fakultas?: number | null,
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
    dosen = null,
    status,
    fakultas = null,
    remove_pagination = false,
}: PaginateProps) {
    const skip = (page - 1) * limit;

    const session = await requireAuth([Role.ADMIN, Role.FAKULTAS]);
    let targetFakultas = fakultas;
    if (session.user.role === Role.FAKULTAS) {
        if (!session.user.fakultasId) throw new Error("Akun Anda tidak terikat dengan fakultas mana pun");
        targetFakultas = Number(session.user.fakultasId);
    }
    const searchFilter = search
        ? {
            Dosen: {
                nama: { contains: search, mode: Prisma.QueryMode.insensitive }
            },
            Matakuliah: { contains: search, mode: Prisma.QueryMode.insensitive },
        }
        : {};
    const dosenFilter = dosen ? {
        dosenId: dosen
    } : {}
    const statusFilter = status ? {
        status: status as StatusJadwalRequest
    } : {}
    const jenisDosenFilter = jenisDosen ? {
        Dosen: { status: jenisDosen as TypeDosen }
    } : {}
    const fakultasFilter = targetFakultas ? {
        fakultasId: targetFakultas
    } : {}

    const programStudiFilter = programStudi ? {
        jurusanId: programStudi
    } : {}
    const matakuliahFilter = matakuliah ? {
        Matakuliah: {
            nama: { contains: matakuliah, mode: Prisma.QueryMode.insensitive }
        }
    } : {}

    const selectedTahunAkademik = tahunAkademik ?? undefined;
    const findTahunAkademik = selectedTahunAkademik
        ? await prisma.tahunAkademik.findUnique({
            where: { id: selectedTahunAkademik }
        })
        : null;

    const whereJadwal = {
        tahunAkademikId: selectedTahunAkademik,
        ...programStudiFilter,
        ...matakuliahFilter,
        ...dosenFilter,
        ...jenisDosenFilter
    };
    const whereJadwalRequest = {
        tahunAkademikId: selectedTahunAkademik,
        ...fakultasFilter,
        ...programStudiFilter,
        ...matakuliahFilter,
        ...dosenFilter,
        ...jenisDosenFilter
    };

    const [jadwalData, jadwalDataRequest, total] = await Promise.all([
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
                { Matakuliah: {nama: 'asc'} }
            ]
        }),
        prisma.jadwalRequest.findMany({
            where: { ...whereJadwalRequest, ...statusFilter },
            select: {
                id: true,
                dosenId: true,
                matakuliahId: true,
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
                { Matakuliah: {nama: 'asc'} }
            ]
        }),
        prisma.dosen.count(),
    ]);

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
    const listDosenx = Array.from(uniqueDosen.values()).sort((a, b) => a.nama.localeCompare(b.nama));

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

        const listRequest = jadwalRequestDosen.map((j: any) => ({
            id: Number(j.id),
            matakuliah: j.Matakuliah?.nama?.toUpperCase(),
            sks: j.sks?.toNumber(),
            kelas: j.kelas,
            semester: j.semester,
            keterangan: j.keterangan,
            fakultas: j.Fakultas?.nama,
            jurusan: j.Jurusan?.nama,
            fakultasId: j.Fakultas?.id,
            jurusanId: j.Jurusan?.id,
            dosenId: j.dosenId,
            status: j.status,
            keteranganAdmin: j.keteranganAdmin,
            matakuliahId: j.matakuliahId,
            kurikulumId: j.Matakuliah?.kurikulumId,
        }));
        const listJadwal = jadwalDosen.map((j: any) => ({
            id: Number(j.id),
            matakuliah: j.Matakuliah?.nama?.toUpperCase(),
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
            matakuliahId: j.matakuliahId,
            kurikulumId: j.Matakuliah?.kurikulumId,
        }));
        const merged = mergeJadwalLists(listRequest, listJadwal);

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
            jadwal: merged
        };
    });
        const totalFiltered = data?.length ?? 0;
        const paginatedData = remove_pagination ? data : data?.slice(skip, skip + limit);
        return { data: paginatedData, total: totalFiltered };
}

function mergeJadwalLists(requests: any, jadwals: any) {
    const createKey = (item: any) =>
        `${item.fakultasId}|${item.jurusanId}|${item.matakuliah?.trim().toLowerCase()}|${item.dosenId}|${item.semester}`;

    const jadwalMap = new Map();
    const mergedMap = new Map();

    // Build index of jadwal items
    for (const item of jadwals) {
        jadwalMap.set(createKey(item), item);
    }

    // Merge requests into jadwals
    for (const request of requests) {
        const key = createKey(request);
        const existing = jadwalMap.get(key);

        if (existing) {
            // Merge with request taking precedence
            mergedMap.set(key, {
                ...existing,
                ...request,
                status: request.status,
                totalKelasDiterima: existing.kelas,
                semesterDiterima: existing.semester,
            });
            jadwalMap.delete(key);
        } else {
            mergedMap.set(key, request);
        }
    }

    // Add remaining jadwal items
    for (const [key, item] of jadwalMap) {
        mergedMap.set(key, item);
    }

    return Array.from(mergedMap.values());
}

export default async function GET_ALL() {
    const result = await prisma.jadwalRequest.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return result;
}