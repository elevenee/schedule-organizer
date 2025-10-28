export type Dosen = {
    id: number;
    nama: string;
    nidn: string;
    fakultasId?: number;
    semester: number;
    Fakultas?: {
        id: number;
        nama: string;
    } 
};