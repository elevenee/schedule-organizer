export type TahunAkademik = {
    id: number;
    nama: string;
    kode: string;
    sks: number;
    jurusanId: number;
    semester: number;
    jurusan?: {
        id: number;
        nama: string;
    } 
};