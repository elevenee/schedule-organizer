import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from '@/lib/prisma';
import { StatusUser } from "@prisma/client";
import { apiFetcher } from "./api-fetcher";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
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

                if (user && user.status === StatusUser.INACTIVE) {
                    throw Error("Akun anda belum belum diaktifkan")
                }

                if (!user) throw Error('Username atau password salah.');

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) throw Error('Username atau password salah.');
                let SIAKAD_LOGIN = null;
                try {
                    SIAKAD_LOGIN = await apiFetcher('/auth/login', {
                    method: 'POST',
                    body: {
                        username: "ijazah",
                        password: "ijazah123",
                    },
                });
                } catch (error) {
                    
                }
                
                return {
                    id: String(user.id),
                    name: user.name,
                    role: user.role,
                    accessToken: SIAKAD_LOGIN?.token || null,
                    fakultasId: user.fakultasId ? String(user.fakultasId) : undefined,
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
                session.user.fakultasId = token.fakultasId as number | null;
            }
            
            return session;
        },
    },
    pages: {
        signIn: "/",
    },
};
