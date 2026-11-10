import { Role } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { roleAccessMap } from "./lib/role-map";

export async function proxy(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Belum login
    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Cek role access
    for (const route in roleAccessMap) {
        if (pathname.startsWith(route)) {
            const allowedRoles = roleAccessMap[route];

            if (!allowedRoles.includes(token.role as Role)) {
                return NextResponse.redirect(new URL("/denied", req.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/fakultas/:path*",
        "/dashboard/:path*",
    ],
};
