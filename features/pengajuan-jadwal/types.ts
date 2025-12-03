export type TahunAkademik = {
    id: number;
    tahunAkademikId: number;
    matakuliah: string;
    sks: number;
    kelas: string[],
    totalSsks?: number;
    semester: number;
    dosenId: number;
    dosen?: {
        id: number;
        nama: string;
    }
};