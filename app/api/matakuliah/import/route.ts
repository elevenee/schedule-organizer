import { Prisma, PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
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
            header: ['NO', 'PRODI', 'KODE', 'MATAKULIAH', 'SEMESTER', 'SKS', 'KURIKULUM', 'PRODI_ID'],
            range: 1 // Skip header
        });

        // Validasi data
        const validatedData: any[] = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;
            const rowNumber = i + 2; // +2 karena header di row 1 dan array mulai dari 0

            // Validasi required fields
            if (!row.KODE) {
                errors.push({
                    row: rowNumber,
                    error: 'ID wajib diisi',
                    data: row
                });
                continue;
            }

            if (!row.MATAKULIAH) {
                errors.push({
                    row: rowNumber,
                    error: 'Nama wajib diisi',
                    data: row
                });
                continue;
            }

            // Format data
            validatedData.push({
                kode: row.KODE,
                nama: String(row.MATAKULIAH).trim(),
                semester: row.SEMESTER,
                sks: row.SKS,
                jenjang: "S1",
                kurikulum: row.KURIKULUM,
                jurusanId: Number(row.PRODI_ID)
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
        const detailErrors: any[] = [];

        const uniqueData = [];
        const seenKeys = new Set();

        for (const data of validatedData) {
            const key = `${data.kode}-${data.jurusanId}-${data.semester}-${data.jenjang}-${data.kurikulum}`;

            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueData.push(data);
            } else {
                console.log(`Duplicate found and removed: ${key}`);
            }
        }

        console.log(`Original: ${validatedData.length}, Unique: ${uniqueData.length}`);

        let lastProdi: any = null;
        let lastKurikulum: any = null;
        await prisma.$transaction(async (tx) => {
            for (const data of validatedData) {
                try {
                    // Cek apakah NIP sudah ada (UPSERT)
                    // const existingMatkul = await tx.mataKuliah.findFirst({
                    //     where: {
                    //         nama: data.nama,
                    //         kode: data.kode,
                    //         semester: data.semester,
                    //         jurusanId: data.jurusanId,
                    //     }
                    // });
                    // if (!existingMatkul) {
                    // if (Number(lastProdi) !== data.jurusanId) {
                    //     const kuri = {
                    //         nama: data.kurikulum,
                    //         status: "ACTIVE" as StatusTahun,
                    //     };

                    //     lastKurikulum = await tx.kurikulum.create({
                    //         data: kuri
                    //     })
                    //     lastProdi = data.jurusanId;
                    // }
                    // if (lastKurikulum) {
                        // const existingMatkul = await tx.mataKuliah.findFirst({
                        //     where: {
                        //         nama: data.nama,
                        //         kode: data.kode,
                        //         semester: data.semester,
                        //         jurusanId: data.jurusanId,
                        //         kurikulumId: lastKurikulum?.id,
                        //         jenjang: data.jenjang
                        //     }
                        // });
                        // if (existingMatkul) {
                        //     console.log("EXIST: ", existingMatkul);
                        //     // continue;
                        // }
                        const ck = {
                            nama: data.nama,
                            kode: data.kode,
                            semester: data.semester,
                            jurusanId: data.jurusanId,
                            sks: data.sks,
                            jenjang: data.jenjang,
                            kurikulumId: data?.kurikulum
                        }

                        await tx.mataKuliah.create({
                            data: ck
                        });
                    // }
                    // }

                    successCount++;
                } catch (error) {
                    failedCount++;
                    detailErrors.push({
                        nip: data.nip,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
        }, {
            maxWait: 100000,
            timeout: 100000,
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
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