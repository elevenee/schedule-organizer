import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { Jenjang, Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

/* eslint-disable */
export async function POST(request: NextRequest) {
    try {
        await requireAuth([Role.ADMIN]);

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'File tidak ditemukan' },
                { status: 400 }
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Ukuran file melebihi batas maksimal 5MB' },
                { status: 400 }
            );
        }

        if (!file.name.match(/\.(xlsx|xls)$/)) {
            return NextResponse.json(
                { error: 'Format file harus Excel (.xlsx atau .xls)' },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, {
            header: ['NO', 'PRODI', 'KODE', 'MATAKULIAH', 'SEMESTER', 'SKS', 'KURIKULUM', 'PRODI_ID'],
            range: 1
        });

        if (data.length > 3000) {
            return NextResponse.json(
                { error: 'Jumlah baris melebihi batas maksimal 3000 baris' },
                { status: 400 }
            );
        }

        const validatedData: any[] = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2;

            if (!row.MATAKULIAH) {
                errors.push({ row: rowNumber, error: 'Nama matakuliah wajib diisi' });
                continue;
            }

            if (!row.PRODI_ID) {
                errors.push({ row: rowNumber, error: 'PRODI_ID wajib diisi' });
                continue;
            }

            validatedData.push({
                nama: String(row.MATAKULIAH).trim(),
                kode: row.KODE ? String(row.KODE).trim() : null,
                sks: Number(row.SKS) || 0,
                semester: Number(row.SEMESTER) || 1,
                jurusanId: BigInt(row.PRODI_ID),
                jenjang: Jenjang.S1,
                kurikulumId: row.KURIKULUM ? Number(row.KURIKULUM) : null,
            });
        }

        if (validatedData.length === 0) {
            return NextResponse.json(
                { error: 'Tidak ada data valid untuk diimport', errors },
                { status: 400 }
            );
        }

        let successCount = 0;
        let failedCount = 0;

        await prisma.$transaction(async (tx) => {
            for (const item of validatedData) {
                try {
                    const existing = await tx.mataKuliah.findFirst({
                        where: {
                            kode: item.kode,
                            jurusanId: item.jurusanId,
                            semester: item.semester,
                            jenjang: item.jenjang,
                            kurikulumId: item.kurikulumId,
                        }
                    });

                    if (existing) {
                        await tx.mataKuliah.update({
                            where: { id: existing.id },
                            data: {
                                nama: item.nama,
                                sks: item.sks,
                            }
                        });
                    } else {
                        await tx.mataKuliah.create({
                            data: item
                        });
                    }
                    successCount++;
                } catch {
                    failedCount++;
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Import matakuliah berhasil',
            summary: {
                totalData: validatedData.length,
                success: successCount,
                failed: failedCount,
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Terjadi kesalahan saat import' },
            { status: error?.message?.startsWith('UNAUTHORIZED') ? 401 : error?.message?.startsWith('FORBIDDEN') ? 403 : 500 }
        );
    }
}
