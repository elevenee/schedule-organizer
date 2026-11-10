'use server';

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Role, StatusJadwalRequest } from "@prisma/client";

export async function approveRequest(id: number, formData: any) {
    await requireAuth([Role.ADMIN]);

    const { matakuliahId, sks, dosenId, semester, kelas, fakultasId, jurusanId, keteranganAdmin } = formData;

    return await prisma.$transaction(async (tx) => {
        const find = await tx.jadwalRequest.findUnique({ where: { id: BigInt(id) } });
        if (!find) return { error: 'Jadwal request tidak ditemukan' };

        if (find.status !== StatusJadwalRequest.PENDING) {
            return { errors_message: `Pengajuan jadwal sudah diproses sebelumnya (Status: ${find.status}).` };
        }

        const tahunAkademik = await tx.tahunAkademik.findFirst({
            where: { status: "ACTIVE" },
        });
        if (!tahunAkademik) {
            throw new Error("Tahun akademik aktif tidak ditemukan");
        }

        const dosen = await tx.dosen.findUnique({
            where: { id: BigInt(dosenId) },
        });
        if (!dosen) {
            return { errors_message: 'Dosen tidak ditemukan' };
        }

        const getCurrent = await tx.jadwal.findMany({
            where: {
                tahunAkademikId: tahunAkademik.id,
                dosenId: BigInt(dosenId),
            },
        });

        const getPengaturanJadwal = await tx.pengaturanJadwal.findFirst({
            where: {
                jenisDosen: dosen.status
            },
        });

        const currentSksTotal = getCurrent.reduce((total, jadwal) => total + (jadwal.sks.toNumber() * jadwal.kelas.length), 0);
        const addedSks = Number(sks) * kelas.length;
        const maxAllowedSks = getPengaturanJadwal?.maxSks?.toNumber() || 0;

        if (currentSksTotal + addedSks > maxAllowedSks) {
            return { errors_message: `Total SKS yang dibebankan (${currentSksTotal + addedSks}) melebihi batas (${maxAllowedSks} SKS) pada semester ini.` };
        }

        const created = await tx.jadwal.create({
            data: {
                tahunAkademikId: tahunAkademik.id,
                matakuliahId: BigInt(matakuliahId),
                sks: Number(sks),
                semester: Number(semester),
                dosenId: BigInt(dosenId),
                fakultasId: BigInt(fakultasId),
                jurusanId: BigInt(jurusanId),
                totalSks: addedSks,
                kelas
            }
        });

        const updated = await tx.jadwalRequest.update({
            where: { id: BigInt(id) },
            data: {
                status: StatusJadwalRequest.APPROVED,
                keteranganAdmin: (keteranganAdmin as string) || null,
            },
        });

        const isSame =
            find.kelas.length === kelas.length &&
            new Set(find.kelas).size === new Set(kelas).size &&
            find.kelas.every(item => new Set(kelas).has(item));

        if (!isSame) {
            const findSisaSks = await tx.sisaSks.findFirst({
                where: {
                    fakultasId: find.fakultasId,
                    jurusanId: find.jurusanId,
                    matakuliahId: find.matakuliahId,
                    semester: find.semester,
                    tahunAkademikId: find.tahunAkademikId,
                    kelas: {
                        hasSome: find.kelas
                    }
                },
            });

            const kelasFind = find.kelas.length ? find.kelas : [];
            let kelasChanges: string[] = [];

            if (kelas.length < kelasFind.length) {
                const set1 = new Set(kelas);
                kelasChanges = kelasFind.filter(item => !set1.has(item));
            } else {
                const set1 = new Set(kelasFind);
                kelasChanges = kelas.filter((item: any) => !set1.has(item));
            }

            if (findSisaSks) {
                await tx.sisaSks.update({
                    where: { id: findSisaSks.id },
                    data: {
                        kelas: kelasChanges
                    }
                });
            } else if (kelasChanges.length > 0) {
                await tx.sisaSks.create({
                    data: {
                        tahunAkademikId: find.tahunAkademikId,
                        matakuliahId: find.matakuliahId,
                        sks: find.sks,
                        semester: find.semester,
                        fakultasId: find.fakultasId,
                        jurusanId: find.jurusanId,
                        kelas: kelasChanges
                    }
                });
            }
        }

        return { 
            success: true, 
            data: { 
                ...updated, 
                sks: updated.sks.toNumber(), 
                totalSks: updated.totalSks?.toNumber() 
            }, 
            created: true 
        };
    });
}
