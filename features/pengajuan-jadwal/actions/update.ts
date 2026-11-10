'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, StatusJadwalRequest } from "@prisma/client";
import { jadwalFormValues, jadwalSchema, statusJadwalFormValues } from "../validations";

export async function update(id: number, formData: jadwalFormValues) {
    const session = await requireAuth([Role.ADMIN, Role.FAKULTAS]);

    const find = await prisma.jadwalRequest.findUnique({ where: { id: BigInt(id) } });
    if (!find) return { error: 'Jadwal tidak ditemukan' };

    if (session.user.role === Role.FAKULTAS) {
        if (Number(find.fakultasId) !== Number(session.user.fakultasId)) {
            throw new Error("FORBIDDEN: Anda tidak memiliki akses ke pengajuan fakultas lain");
        }
        if (find.status !== StatusJadwalRequest.PENDING) {
            return { errors_message: 'Pengajuan yang sudah diproses tidak dapat diubah' };
        }
    }

    const validated = jadwalSchema.safeParse(formData);
    if (!validated.success) {
        return { errors_message: 'Data tidak valid' };
    }

    const tahunAkademik = await prisma.tahunAkademik.findFirst({
        where: { status: "ACTIVE" },
    });
    if (!tahunAkademik) {
        throw new Error("Tahun akademik aktif tidak ditemukan");
    }

    const { matakuliahId, sks, dosenId, semester, kelas, jurusanId } = validated.data;

    const findMatkul = await prisma.mataKuliah.findFirst({
        where: { id: BigInt(matakuliahId) }
    });

    const [getCurrent, getCurrentPengajuan, getDosen, isExist] = await Promise.all([
        prisma.jadwal.findMany({
            where: {
                tahunAkademikId: tahunAkademik.id,
                dosenId: BigInt(dosenId),
            },
        }),
        prisma.jadwalRequest.findMany({
            where: {
                id: { not: BigInt(id) },
                tahunAkademikId: tahunAkademik.id,
                dosenId: BigInt(dosenId),
                status: 'PENDING'
            },
        }),
        prisma.dosen.findUnique({
            where: { id: BigInt(dosenId) },
        }),
        prisma.jadwalRequest.findFirst({
            where: {
                id: { not: BigInt(id) },
                tahunAkademikId: tahunAkademik.id,
                semester: Number(semester),
                Matakuliah: { nama: findMatkul?.nama },
                jurusanId: BigInt(jurusanId),
                kelas: { hasSome: kelas }
            },
            include: {
                Jurusan: {
                    select: {
                        nama: true,
                        jenjang: true
                    }
                },
                Matakuliah: true
            }
        })
    ]);

    if (!getDosen) {
        return { errors_message: 'Dosen tidak ditemukan' };
    }

    const getPengaturanJadwal = await prisma.pengaturanJadwal.findFirst({
        where: {
            jenisDosen: getDosen.status,
        },
    });

    if (isExist && isExist.Jurusan?.jenjang === 'S1') {
        return { errors_message: `Jadwal kelas pada matakuliah ${isExist.Matakuliah.nama} semester ${semester} di prodi ${isExist.Jurusan.nama} telah terisi. Silakan periksa kembali kelas yang dipilih.` };
    }

    const addedSks = Number(sks) * kelas.length;
    const maxAllowedSks = getPengaturanJadwal?.maxSks?.toNumber() || 0;

    const totalSks = getCurrent.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + addedSks;
    if (totalSks > maxAllowedSks) {
        return { errors_message: `Total SKS terjadwal (${totalSks}) melebihi batas (${maxAllowedSks} SKS) pada semester ini.` };
    }

    const totalSksPengajuan = getCurrentPengajuan.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0) + addedSks;
    if (totalSksPengajuan > maxAllowedSks) {
        return { errors_message: `Total SKS pengajuan pending (${totalSksPengajuan}) melebihi batas (${maxAllowedSks} SKS) pada semester ini.` };
    }

    const updateData = {
        matakuliahId: BigInt(matakuliahId),
        sks: Number(sks),
        semester: Number(semester),
        dosenId: BigInt(dosenId),
        totalSks: addedSks,
        kelas
    };

    const updated = await prisma.jadwalRequest.update({
        where: { id: BigInt(id) },
        data: updateData,
    });

    return { success: true, data: updated };
}

export async function updateStatus(id: number, formData: statusJadwalFormValues) {
    await requireAuth([Role.ADMIN]);

    const targetStatus = formData.status as StatusJadwalRequest;

    return await prisma.$transaction(async (tx) => {
        const find = await tx.jadwalRequest.findUnique({ where: { id: BigInt(id) } });
        if (!find) return { error: 'Jadwal tidak ditemukan' };

        const tahunAkademik = await tx.tahunAkademik.findFirst({
            where: { status: "ACTIVE" },
        });
        if (!tahunAkademik) {
            throw new Error("Tahun akademik aktif tidak ditemukan");
        }

        if (targetStatus === 'APPROVED') {
            if (find.status !== StatusJadwalRequest.PENDING) {
                return { errors_message: `Pengajuan ini sudah berstatus ${find.status}` };
            }

            const dosen = await tx.dosen.findUnique({
                where: { id: find.dosenId },
            });
            if (!dosen) {
                return { errors_message: 'Dosen tidak ditemukan' };
            }

            const getCurrent = await tx.jadwal.findMany({
                where: {
                    tahunAkademikId: tahunAkademik.id,
                    dosenId: find.dosenId,
                },
            });

            const getPengaturanJadwal = await tx.pengaturanJadwal.findFirst({
                where: {
                    jenisDosen: dosen.status
                },
            });

            const addedSks = find.sks.toNumber() * find.kelas.length;
            const currentTotal = getCurrent.reduce((total, j) => total + (j.sks.toNumber() * j.kelas.length), 0);
            const maxAllowedSks = getPengaturanJadwal?.maxSks?.toNumber() || 0;

            if (currentTotal + addedSks > maxAllowedSks) {
                return { errors_message: `Total SKS (${currentTotal + addedSks}) melebihi batas (${maxAllowedSks} SKS) pada semester ini.` };
            }

            const created = await tx.jadwal.create({
                data: {
                    tahunAkademikId: tahunAkademik.id,
                    matakuliahId: find.matakuliahId,
                    sks: find.sks.toNumber(),
                    semester: Number(find.semester),
                    dosenId: find.dosenId,
                    fakultasId: find.fakultasId,
                    jurusanId: find.jurusanId,
                    totalSks: addedSks,
                    kelas: find.kelas
                }
            });

            const updated = await tx.jadwalRequest.update({
                where: { id: BigInt(id) },
                data: {
                    status: StatusJadwalRequest.APPROVED,
                    keteranganAdmin: (formData.keteranganAdmin as string) || null,
                },
            });

            return { 
                success: true, 
                data: { ...updated, sks: updated.sks.toNumber(), totalSks: updated.totalSks?.toNumber() }, 
                created: true 
            };
        } else {
            const updated = await tx.jadwalRequest.update({
                where: { id: BigInt(id) },
                data: {
                    status: targetStatus,
                    keteranganAdmin: (formData.keteranganAdmin as string) || null,
                },
            });
            return { success: true, data: updated };
        }
    });
}

export async function updateStatusAll(ids: number[], data: statusJadwalFormValues) {
    await requireAuth([Role.ADMIN]);

    const targetStatus = data.status as StatusJadwalRequest;

    return await prisma.$transaction(async (tx) => {
        const tahunAkademik = await tx.tahunAkademik.findFirst({
            where: { status: 'ACTIVE' },
        });

        if (!tahunAkademik) {
            throw new Error('Tahun akademik aktif tidak ditemukan');
        }

        const requests = await tx.jadwalRequest.findMany({
            where: { id: { in: ids.map(id => BigInt(id)) } },
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

        for (const req of requests) {
            if (targetStatus !== 'APPROVED') {
                await tx.jadwalRequest.update({
                    where: { id: req.id },
                    data: { status: targetStatus, keteranganAdmin: data.keteranganAdmin || null },
                });
                result.rejected.push(Number(req.id));
                continue;
            }

            if (req.status !== StatusJadwalRequest.PENDING) {
                result.skipped.push({
                    id: Number(req.id),
                    reason: `Status sudah ${req.status}`,
                });
                continue;
            }

            const currentJadwal = await tx.jadwal.findMany({
                where: {
                    tahunAkademikId: tahunAkademik.id,
                    dosenId: req.dosenId,
                },
            });

            const pengaturan = await tx.pengaturanJadwal.findFirst({
                where: { jenisDosen: req.Dosen?.status },
            });

            const addedSks = req.sks.toNumber() * req.kelas.length;
            const currentTotal = currentJadwal.reduce((t, j) => t + j.sks.toNumber() * j.kelas.length, 0);
            const maxAllowedSks = pengaturan?.maxSks?.toNumber() ?? 0;

            if (currentTotal + addedSks > maxAllowedSks) {
                result.skipped.push({
                    id: Number(req.id),
                    reason: `SKS dosen melebihi batas (${currentTotal + addedSks} > ${maxAllowedSks})`,
                });
                continue;
            }

            await tx.jadwal.create({
                data: {
                    tahunAkademikId: tahunAkademik.id,
                    matakuliahId: req.matakuliahId,
                    sks: req.sks.toNumber(),
                    semester: Number(req.semester),
                    dosenId: req.dosenId,
                    fakultasId: req.fakultasId,
                    jurusanId: req.jurusanId,
                    totalSks: addedSks,
                    kelas: req.kelas,
                },
            });

            await tx.jadwalRequest.update({
                where: { id: req.id },
                data: { status: StatusJadwalRequest.APPROVED, keteranganAdmin: data.keteranganAdmin || null },
            });

            result.approved.push(Number(req.id));
        }

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
    });
}
