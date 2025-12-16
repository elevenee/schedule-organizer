import ExcelJS from "exceljs"
import { DosenExport, renderDosenSheet } from "./renderSheet"

export async function exportDosenExcel(
  dosenTetap: DosenExport[],
  dosenHonorer: DosenExport[]
) {
  const workbook = new ExcelJS.Workbook()

  renderDosenSheet(workbook, "Dosen Tetap", dosenTetap)
  renderDosenSheet(workbook, "Dosen Honorer", dosenHonorer)

  const buffer = await workbook.xlsx.writeBuffer()

  return Buffer.from(buffer)
  // saveAs(
  //   new Blob([buffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //   }),
  //   "jadwal-dosen.xlsx"
  // )
}
