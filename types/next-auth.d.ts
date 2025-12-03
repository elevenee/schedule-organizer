import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            accessToken?: string;
            fakultasId?: number | null;
        };
    }
    interface User {
        id: string
        role?: string
        accessToken?: string;
        fakultasId?: number | null;
    }

    interface JWT {
        id: string
        role?: string
        accessToken?: string;
    }
}
