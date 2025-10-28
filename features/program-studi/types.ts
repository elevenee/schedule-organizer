export type ProgramStudi = {
    id: number;
    name: string;
    jenjang: string;
    fakultasId: number;
    fakultas: {
        id: number;
        name: string;
    };
    created_at: string;
};