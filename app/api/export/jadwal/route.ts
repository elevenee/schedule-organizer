import { exportDosenExcel } from "@/features/jadwal/utils/exportDosen";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { TypeDosen } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dosenTetap = await getDataDosen("TETAP");
    const dosenTidakTetap = await getDataDosen("TIDAK_TETAP");
    const buffer = await exportDosenExcel(dosenTetap, dosenTidakTetap);

    return new NextResponse(buffer, {
        headers: {
            "Content-Type":
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition":
                'attachment; filename="jadwal-dosen.xlsx"',
            "Cache-Control": "no-store"
        }
    });
}

/* eslint-disable */
async function getDataDosen(status: string): Promise<any[]> {
    const findTahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: 'ACTIVE' }
    });

    if (!findTahunAkademik) {
        return [];
    }

    const findPengaturan = await prisma.pengaturanJadwal.findFirst({
        where: { jenisDosen: status as TypeDosen }
    });

    const [dosenList, jadwalData] = await Promise.all([
        prisma.dosen.findMany({
            where: {
                status: status as TypeDosen,
                deletedAt: null,
                Jadwal: {
                    some: {
                        tahunAkademikId: findTahunAkademik.id
                    }
                }
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
                tahunAkademikId: findTahunAkademik.id,
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
    ]);

    // Group jadwal by dosenId untuk mapping
    const jadwalByDosen = jadwalData.reduce((acc, jadwal) => {
        const dosenIdStr = jadwal.dosenId.toString();
        if (!acc[dosenIdStr]) {
            acc[dosenIdStr] = [];
        }
        acc[dosenIdStr].push(jadwal);
        return acc;
    }, {} as Record<string, typeof jadwalData>);

    const tahunAkademikLabel = `${(findTahunAkademik.name || "").replace(/_/g, '/')} - SMT ${findTahunAkademik.semester || ""}`;

    const data = dosenList.map(dosen => {
        const jadwalDosen = jadwalByDosen[dosen.id.toString()] || [];
        return {
            id: dosen.id,
            nama: dosen.nama,
            nidn: dosen.nidn,
            status: dosen.status,
            homebase: dosen.Jurusan?.nama || "",
            tahunAkademik: tahunAkademikLabel,
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
