'use server';

import { prisma } from "@/lib/prisma";
import { StatusJadwalRequest } from "@prisma/client";
import { jadwalFormValues, statusJadwalFormValues } from "../validations";
export async function update(id: number, formData: jadwalFormValues) {

    const tahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: "ACTIVE" },
    })
    if (!tahunAkademik) {
        throw new Error("Tahun akademik tidak ditemukan")
    }

    const find = await prisma.jadwalRequest.findUnique({ where: { id } });
    if (!find) return { error: 'Jadwal tidak ditemukan' };

    const { matakuliahId, sks, dosenId, semester, kelas, jurusanId } = formData;

    const findMatkul = await prisma.mataKuliah.findFirst({
        where: {
            id: matakuliahId
        }
    })
    const [getCurrent, getCurrentPengajuan, getDosen, isExist] = await Promise.all([
        prisma.jadwal.findMany({
            where: {
                tahunAkademikId: BigInt(tahunAkademik?.id || 0),
                dosenId: Number(dosenId),
            },
            include: { Dosen: true }
        }),
        prisma.jadwalRequest.findMany({
            where: {
                id: {not: find.id},
                tahunAkademikId: BigInt(tahunAkademik?.id || 0),
                dosenId: Number(dosenId),
                status: {
                    in: ['PENDING']
                }
            },
            include: { Dosen: true }
        }),
        prisma.dosen.findUnique({
            where: {
                id: Number(dosenId),
            },
        }),
        prisma.jadwalRequest.findFirst({
            where: {
                id: {not: find.id},
                tahunAkademikId: BigInt(tahunAkademik?.id || 0),
                semester: Number(semester),
                Matakuliah: { nama: findMatkul?.nama },
                jurusanId: jurusanId,
                kelas: { hasSome: kelas }
            },
            include: {
                Jurusan: {
                    select: {
                        id: true,
                        nama: true,
                        jenjang: true
                    }
                },
                Matakuliah: true
            }
        })
    ])

    const getPengaturanJadwal = await prisma.pengaturanJadwal.findFirst({
        where: {
            jenisDosen: getDosen?.status,
        },
    });


    if (isExist) {
        if (isExist.Jurusan?.jenjang == 'S1') {
            return { errors_message: `Jadwal kelas pada matakuliah ${isExist?.Matakuliah.nama} semester ${semester} di prodi ${isExist?.Jurusan?.nama} telah terisi. \n silahkan cek kembali kelas yang dipilih` };
        }
    }
    const totalSks = getCurrent.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + (Number(sks) * kelas.length);
    if (totalSks > (getPengaturanJadwal?.maxSks?.toNumber() || 0)) {
        return { errors_message: 'Total SKS yang dibebankan melebihi batas pada semester ini.' };
    }
    const totalSksPengajuan = getCurrentPengajuan.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + (Number(sks) * kelas.length);
    if (totalSksPengajuan > (getPengaturanJadwal?.maxSks?.toNumber() || 0)) {
        return { errors_message: 'Total SKS yang dibebankan melebihi batas pada semester ini.' };
    }
    const updateData = {
        matakuliahId,
        sks: Number(sks),
        semester: Number(semester),
        dosenId: Number(dosenId),
        kelas
    }
    const updated = await prisma.jadwalRequest.update({
        where: { id },
        data: updateData,
    });

    return { success: true, data: updated };
}

export async function updateStatus(id: number, formData: statusJadwalFormValues) {
    const find = await prisma.jadwalRequest.findUnique({ where: { id } });
    if (!find) return { error: 'Jadwal tidak ditemukan' };

    const tahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: "ACTIVE" },
    })
    if (!tahunAkademik) {
        throw new Error("Tahun akademik tidak ditemukan")
    }

    if (formData.status === 'APPROVED') {
        const { matakuliahId, sks, dosenId, semester, kelas, fakultasId, jurusanId } = find;
        const getCurrent = await prisma.jadwal.findMany({
            where: {
                tahunAkademikId: BigInt(tahunAkademik?.id || 0),
                dosenId: Number(dosenId),
            },
            include: { Dosen: true }
        });

        const getPengaturanJadwal = await prisma.pengaturanJadwal.findFirst({
            where: {
                jenisDosen: getCurrent[0]?.Dosen?.status
            },
        });

        const totalSks = getCurrent.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + (Number(sks) * kelas.length);
        if (totalSks > (getPengaturanJadwal?.maxSks?.toNumber() || 0)) {
            return { errors_message: 'Total SKS yang dibebankan melebihi batas pada semester ini.' };
        }

        const data = {
            tahunAkademikId: BigInt(tahunAkademik?.id || 0),
            matakuliahId,
            sks: sks.toNumber(),
            semester: Number(semester),
            dosenId: Number(dosenId),
            fakultasId: Number(fakultasId),
            jurusanId: Number(jurusanId),
            totalSks: sks.toNumber() * kelas.length,
            kelas
        }
        const [updated, created] = await Promise.all([
            await prisma.jadwalRequest.update({
                where: { id },
                data: {
                    status: formData.status as StatusJadwalRequest,
                    keteranganAdmin: formData.keteranganAdmin as string || null,
                },
            }),
            await prisma.jadwal.create({
                data: data
            })
        ]);

        return { success: true, data: { ...updated, sks: updated.sks.toNumber(), totalSks: updated.totalSks?.toNumber() }, created: created ? true : false };
    } else {
        const updated = await prisma.jadwalRequest.update({
            where: { id },
            data: {
                status: formData.status as StatusJadwalRequest,
                keteranganAdmin: formData.keteranganAdmin as string || null,
            },
        });
        return { success: true, data: updated };
    }
}

export async function updateStatusAll(ids: number[], data: statusJadwalFormValues) {
    const tahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: 'ACTIVE' },
    });

    if (!tahunAkademik) {
        throw new Error('Tahun akademik tidak ditemukan');
    }

    const requests = await prisma.jadwalRequest.findMany({
        where: { id: { in: ids } },
        include: { Dosen: true },
    });

    if (!requests.length) {
        return { success: false, message: 'Data tidak ditemukan' };
    }

    const result = {
        approved: [] as number[],
        skipped: [] as { id: number; reason: string }[],
        rejected: [] as number[],
    };

    await prisma.$transaction(async (tx) => {
        for (const req of requests) {
            if (data.status !== 'APPROVED') {
                await tx.jadwalRequest.update({
                    where: { id: req.id },
                    data: { status: data.status as StatusJadwalRequest },
                });
                result.rejected.push(Number(req.id));
                continue;
            }

            const currentJadwal = await tx.jadwal.findMany({
                where: {
                    tahunAkademikId: BigInt(tahunAkademik.id),
                    dosenId: Number(req.dosenId),
                },
            });

            const pengaturan = await tx.pengaturanJadwal.findFirst({
                where: { jenisDosen: req.Dosen?.status },
            });

            const totalSks =
                currentJadwal.reduce(
                    (t, j) => t + j.sks.toNumber() * j.kelas.length,
                    0
                ) + req.sks.toNumber() * req.kelas.length;

            if (totalSks > (pengaturan?.maxSks?.toNumber() ?? 0)) {
                result.skipped.push({
                    id: Number(req.id),
                    reason: 'SKS dosen melebihi batas',
                });
                continue;
            }

            await tx.jadwal.create({
                data: {
                    tahunAkademikId: BigInt(tahunAkademik.id),
                    matakuliahId: req.matakuliahId,
                    sks: req.sks.toNumber(),
                    semester: Number(req.semester),
                    dosenId: Number(req.dosenId),
                    fakultasId: Number(req.fakultasId),
                    jurusanId: Number(req.jurusanId),
                    totalSks: req.sks.toNumber() * req.kelas.length,
                    kelas: req.kelas,
                },
            });

            await tx.jadwalRequest.update({
                where: { id: req.id },
                data: { status: data.status as StatusJadwalRequest, keteranganAdmin: data.keteranganAdmin },
            });

            result.approved.push(Number(req.id));
        }
    });

    return {
        success: true,
        summary: {
            total: ids.length,
            approved: result.approved.length,
            skipped: result.skipped.length,
            rejected: result.rejected.length,
        },
        detail: result,
    };
}