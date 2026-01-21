import { PengaturanJadwal } from "@prisma/client"
import ExcelJS from "exceljs"

export type DosenExport = {
    nama: string
    nidn: string
    status: string
    homebase: string
    tahunAkademik: string
    totalJadwal: number
    totalSKS: number,
    pengaturan: PengaturanJadwal,
    jadwal: Array<{
        matakuliah?: string
        sks?: string
        kelas?: string[]
        semester?: string
        fakultas?: string
        jurusan?: string
        keterangan?: string
    }>
}

export function renderDosenSheet(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    data: DosenExport[]
) {
    const worksheet = workbook.addWorksheet(sheetName)

    worksheet.columns = [
        { header: "Nama Dosen", key: "nama", width: 30 },

        { header: "Fakultas", key: "fakultas", width: 20 },
        { header: "Jurusan", key: "jurusan", width: 20 },
        { header: "Mata Kuliah", key: "matakuliah", width: 30 },
        { header: "SMT/Kelas", key: "kelas", width: 20 },
        { header: "Jumlah Kelas", key: "jumlah_kelas", width: 10 },
        { header: "SKS", key: "sks", width: 8 },
        { header: "Jumlah SKS", key: "jml_sks", width: 8 },

        { header: "Total SKS", key: "totalSKS", width: 12 },
        { header: "KJM", key: "KJM", width: 12 },
    ]

    worksheet.getRow(1).font = { bold: true }

    let rowIndex = 2

    for (const dosen of data) {
        const startRow = rowIndex
        const jadwalList = dosen.jadwal.length ? dosen.jadwal : [{}]
        for (const jadwal of jadwalList) {
            worksheet.addRow({
                nama: dosenCellValue(
                    dosen.nama,
                    `${dosen.homebase}`
                ),
                nidn: dosen.nidn,

                fakultas: jadwal.fakultas || "",
                jurusan: jadwal.jurusan || "",
                matakuliah: jadwal.matakuliah || "",
                kelas: jadwal.semester ? jadwal.semester + "/" + (Array.isArray(jadwal.kelas) ? jadwal.kelas.join(", ") : "") : "",
                jumlah_kelas: Array.isArray(jadwal.kelas) ? jadwal.kelas.length : '',
                sks: jadwal.sks || "",
                jml_sks:  Array.isArray(jadwal.kelas) && jadwal.sks ? jadwal.kelas.length * parseFloat(jadwal.sks): '',

                totalSKS: dosen.totalSKS ?? "",
                KJM: dosen.totalSKS - 12
            })

            rowIndex++
        }

        const endRow = rowIndex - 1

        if (endRow > startRow) {
            ["A", "H", "I"].forEach(col => {
                worksheet.mergeCells(`${col}${startRow}:${col}${endRow}`)
                const cell = worksheet.getCell(`${col}${startRow}`);
                cell.alignment = {
                    vertical: "middle",
                    wrapText: true
                }
                if (dosen.pengaturan.maxSks.toNumber() > dosen.totalSKS) {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFBEFFBD" }
                    }
                }else{
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFFFCDD2" }
                    }
                }
            })
        }
    }

    return worksheet
}

function dosenCellValue(nama: string, homebase: string) {
    return {
        richText: [
            {
                text: nama + "\n",
                font: { bold: true }
            },
            {
                text: homebase,
                font: { bold: false, size: 10 }
            }
        ]
    }
}