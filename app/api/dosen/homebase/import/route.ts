import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'File tidak ditemukan' },
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
            header: ['no', 'nip', 'nama', 'fk', 'jurusan', 'homebase', 'ni', 'prodi', 'fakultas'],
            range: 1,
        });

        const validatedData: any[] = [];
        const errors: any[] = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2;

            if (!row.nip) {
                errors.push({ row: rowNumber, error: 'NIP wajib diisi', data: row });
                continue;
            }

            if (!row.prodi) {
                errors.push({ row: rowNumber, error: 'Prodi wajib diisi', data: row });
                continue;
            }

            validatedData.push({
                nip: String(row.nip).trim(),
                fakultasId: row.fakultas ? Number(row.fakultas) : null,
                jurusanId: row.prodi ? Number(row.prodi) : null,
            });
        }

        if (validatedData.length === 0) {
            return NextResponse.json(
                { error: 'Tidak ada data valid untuk diimport' },
                { status: 400 }
            );
        }

        let successCount = 0;
        let failedCount = 0;
        const detailErrors: any[] = [];

        await prisma.$transaction(async (tx) => {
            for (const item of validatedData) {
                try {
                    const existing = await tx.dosen.findFirst({
                        where: { nip: item.nip },
                    });

                    if (!existing) {
                        throw new Error(`NIP ${item.nip} tidak ditemukan`);
                    }

                    await tx.dosen.update({
                        where: { id: existing.id },
                        data: item,
                    });

                    successCount++;
                } catch (error) {
                    failedCount++;
                    detailErrors.push({
                        nip: item.nip,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Import berhasil',
            summary: {
                totalData: validatedData.length,
                success: successCount,
                failed: failedCount,
                errors: detailErrors.length ? detailErrors : null,
            },
        });

    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat import' },
            { status: 500 }
        );
    }
}