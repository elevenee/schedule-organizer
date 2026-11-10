import { prisma } from '@/lib/prisma';
import { StatusUser } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiFetcher } from "./api-fetcher";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async authorize(credentials): Promise<any> {
                if (!credentials?.username || !credentials.password) return null;

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username },
                });

                if (!user) throw new Error('Username atau password salah.');

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) throw new Error('Username atau password salah.');

                if (user.status === StatusUser.INACTIVE || user.deletedAt) {
                    throw new Error("Akun anda belum diaktifkan atau telah dinonaktifkan.");
                }

                let SIAKAD_LOGIN = null;
                const siakadUser = process.env.API_SIAKAD_USERNAME;
                const siakadPass = process.env.API_SIAKAD_PASSWORD;
                const siakadKey = process.env.API_SIAKAD_KEY;

                if (siakadUser && siakadPass && siakadKey) {
                    try {
                        SIAKAD_LOGIN = await apiFetcher('/auth/login', {
                            method: 'POST',
                            body: {
                                username: siakadUser,
                                password: siakadPass,
                            },
                            headers: {
                                'X-API-Key': siakadKey,
                            },
                        });
                    } catch (error) {
                        console.error("SIAKAD auth bridge failed:", error instanceof Error ? error.message : "Unknown error");
                    }
                }
                
                return {
                    id: String(user.id),
                    name: user.name,
                    role: user.role,
                    accessToken: SIAKAD_LOGIN?.token || null,
                    fakultasId: user.fakultasId ? Number(user.fakultasId) : null,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.accessToken = user.accessToken;
                token.fakultasId = user.fakultasId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.accessToken = token.accessToken as string;
                session.user.fakultasId = (token.fakultasId as number) || null;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
