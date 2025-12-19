import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, TypeDosen } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

/* eslint-disable */
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
            header: ['id', 'nip', 'nama','fakultasId','jurusanId'],
            range: 1 // Skip header
        });

        // Validasi data
        const validatedData: any[] = [];
        const errors = [];
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2; // +2 karena header di row 1 dan array mulai dari 0

            // Validasi required fields
            if (!row.nip) {
                errors.push({
                    row: rowNumber,
                    error: 'NIP wajib diisi',
                    data: row
                });
                continue;
            }

            if (!row.nama) {
                errors.push({
                    row: rowNumber,
                    error: 'Nama wajib diisi',
                    data: row
                });
                continue;
            }

            // Format data
            validatedData.push({
                nidn: String(row.nidn).trim(),
                fakultasId: Number(row.fakultasId),
                jurusanId: Number(row.jurusanId),
            });
        }

        if (validatedData.length === 0) {
            return NextResponse.json(
                { error: 'Tidak ada data valid untuk diimport' },
                { status: 400 }
            );
        }

        // Mulai transaction
        let successCount = 0;
        let failedCount = 0;
        const detailErrors:any[] = [];
        
        await prisma.$transaction(async (tx) => {
            for (const data of validatedData) {
                try {
                    // Cek apakah NIP sudah ada (UPSERT)
                    const existingDosen = await tx.dosen.findFirst({
                        where: { nip: data.nip }
                    });
                    if (existingDosen) {
                        // Update data dosen yang sudah ada
                        console.log(data.fakultasId, data.jurusanId);
                        
                        await tx.dosen.update({
                            where: { id: existingDosen.id },
                            data: {
                                fakultasId: data.fakultasId,
                                jurusanId: data.jurusanId,
                            }
                        });
                    }else{
                        console.log("Do not exist");
                        
                    }
                    
                    successCount++;
                } catch (error) {
                    failedCount++;
                    detailErrors.push({
                        nip: data.nip,
                        error: error instanceof Error ? error.message : 'Unknown error'
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

    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat import' },
            { status: 500 }
        );
    }
}