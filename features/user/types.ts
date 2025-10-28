export type User = {
    id: number;
    name: string;
    email?: string | null;
    username: string;
    password: string;
    emailVerifiedAt?: Date | null;
    role: string | null;
    status: string,
    createdAt: Date;
    updatedAt?: Date | null;
};