import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

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
            header: ['no', 'nip', 'nama', 'fk', 'jurusan', 'homebase', 'ni', 'prodi', 'fakultas'],
            range: 1,
        });

        if (data.length > 2000) {
            return NextResponse.json(
                { error: 'Jumlah baris melebihi batas maksimal 2000 baris' },
                { status: 400 }
            );
        }

        const validatedData: any[] = [];
        const errors: any[] = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2;

            if (!row.nip) {
                errors.push({ row: rowNumber, error: 'NIP wajib diisi', data: row });
                continue;
            }

            validatedData.push({
                nip: String(row.nip).trim(),
                nama: row.nama ? String(row.nama).trim() : null,
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

        let updatedCount = 0;
        let notFoundCount = 0;
        const detailErrors: any[] = [];

        await prisma.$transaction(async (tx) => {
            for (const item of validatedData) {
                const existing = await tx.dosen.findFirst({
                    where: { nip: item.nip }
                });

                if (existing) {
                    await tx.dosen.update({
                        where: { id: existing.id },
                        data: {
                            fakultasId: item.fakultasId ?? existing.fakultasId,
                            jurusanId: item.jurusanId ?? existing.jurusanId,
                        }
                    });
                    updatedCount++;
                } else {
                    notFoundCount++;
                    detailErrors.push({ nip: item.nip, error: 'Dosen tidak ditemukan' });
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Import homebase dosen berhasil',
            summary: {
                totalData: validatedData.length,
                updated: updatedCount,
                notFound: notFoundCount,
                errors: detailErrors.length > 0 ? detailErrors : null
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Terjadi kesalahan saat import homebase' },
            { status: error?.message?.startsWith('UNAUTHORIZED') ? 401 : error?.message?.startsWith('FORBIDDEN') ? 403 : 500 }
        );
    }
}
