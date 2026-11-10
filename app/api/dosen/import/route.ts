import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { Role, TypeDosen } from '@prisma/client';
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

        // Validasi ukuran file (maksimal 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Ukuran file melebihi batas maksimal 5MB' },
                { status: 400 }
            );
        }

        // Validasi file type
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            return NextResponse.json(
                { error: 'Format file harus Excel (.xlsx atau .xls)' },
                { status: 400 }
            );
        }

        // Baca file Excel
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, {
            header: ['nama', 'status', 'nidn', 'nip', 'fakultas', 'prodi'],
            range: 1 // Skip header
        });

        if (data.length > 2000) {
            return NextResponse.json(
                { error: 'Jumlah baris melebihi batas maksimal 2000 baris per unggahan' },
                { status: 400 }
            );
        }

        // Validasi data
        const validatedData: any[] = [];
        const errors = [];
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2;

            if (!row.nama || String(row.nama).trim() === '') {
                errors.push({
                    row: rowNumber,
                    error: 'Nama wajib diisi'
                });
                continue;
            }

            const rawStatus = String(row.status || '').trim().toUpperCase();
            const statusVal = rawStatus.includes('TIDAK') ? TypeDosen.TIDAK_TETAP : TypeDosen.TETAP;

            validatedData.push({
                nama: String(row.nama).trim(),
                status: statusVal,
                nip: row.nip ? String(row.nip).trim() : null,
                nidn: row.nidn ? String(row.nidn).trim() : null,
                fakultasId: row.fakultas ? BigInt(row.fakultas) : null,
                jurusanId: row.prodi ? BigInt(row.prodi) : null,
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
        const detailErrors: any[] = [];

        await prisma.$transaction(async (tx) => {
            for (const item of validatedData) {
                try {
                    let existing = null;
                    if (item.nip) {
                        existing = await tx.dosen.findFirst({ where: { nip: item.nip } });
                    }

                    if (existing) {
                        await tx.dosen.update({
                            where: { id: existing.id },
                            data: {
                                nama: item.nama,
                                status: item.status,
                                nidn: item.nidn || existing.nidn,
                                ...(item.fakultasId ? { fakultasId: item.fakultasId } : {}),
                                ...(item.jurusanId ? { jurusanId: item.jurusanId } : {}),
                            }
                        });
                    } else {
                        await tx.dosen.create({
                            data: item
                        });
                    }
                    successCount++;
                } catch (err: any) {
                    failedCount++;
                    detailErrors.push({
                        nama: item.nama,
                        error: err?.message || 'Error processing row'
                    });
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Import berhasil`,
            summary: {
                totalData: validatedData.length,
                success: successCount,
                failed: failedCount,
                errors: detailErrors.length > 0 ? detailErrors : null
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Terjadi kesalahan saat import' },
            { status: error?.message?.startsWith('UNAUTHORIZED') ? 401 : error?.message?.startsWith('FORBIDDEN') ? 403 : 500 }
        );
    }
}
