
import { exportDosenExcel } from "@/features/jadwal/utils/exportDosen";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { TypeDosen } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const user = await getServerSession(authOptions);
    if (!user) throw new Error("Unauthorized");
    const dosenTetap = await getDataDosen("TETAP");
    const dosenTidakTetap = await getDataDosen("TIDAK_TETAP");
    const buffer = await exportDosenExcel(dosenTetap, dosenTidakTetap)

    return new NextResponse(buffer, {
        headers: {
            "Content-Type":
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition":
                'attachment; filename="jadwal-dosen.xlsx"',
            "Cache-Control": "no-store"
        }
    })
}

/* eslint-disable */
async function getDataDosen(status: string): Promise<any[]> {
    const findTahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: 'ACTIVE' }
    })
    const findPengaturan = await prisma.pengaturanJadwal.findFirst({
        where: { jenisDosen: status as TypeDosen }
    })

    const [dosenList, jadwalData, total] = await Promise.all([
        prisma.dosen.findMany({
            where: {
                status: status as TypeDosen
            },
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
            where: {
                tahunAkademikId: findTahunAkademik?.id
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
                Matakuliah: {
                    select: {
                        id: true,
                        nama: true,
                        semester: true,
                        sks: true
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

    const data = dosenList.map(dosen => {
        const jadwalDosen = jadwalByDosen[dosen.id.toString()] || [];

        return {
            id: dosen.id,
            nama: dosen.nama,
            nidn: dosen.nidn,
            status: dosen.status,
            homebase: dosen.Jurusan?.nama || "",
            tahunAkademik: findTahunAkademik?.name.replace(/_/g, '/') || "" + " - SMT " + findTahunAkademik?.semester,
            totalJadwal: jadwalDosen.length,
            pengaturan: findPengaturan,
            totalSKS: jadwalDosen.reduce((sum: any, j: any) => sum + (j.sks?.toNumber() * j.kelas.length), 0),
            jadwal: jadwalDosen.map((j: any) => ({
                id: j.id,
                matakuliah: j.Matakuliah?.nama,
                sks: j.sks?.toString(),
                kelas: j.kelas,
                semester: j.semester,
                keterangan: j.keterangan,
                fakultas: j.Fakultas?.nama,
                jurusan: j.Jurusan?.nama,
                fakultasId: j.Fakultas?.id,
                jurusanId: j.Jurusan?.id,
                dosenId: j.dosenId,
                matakuliahId: j.matakuliahId
            }))
        };
    });

    return data;
}