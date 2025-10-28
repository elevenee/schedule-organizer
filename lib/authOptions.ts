import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from '@/lib/prisma';
import { StatusUser } from "@prisma/client";

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

                return {
                    id: String(user.id),
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
            
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
