import { Role } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { roleAccessMap } from "./lib/role-map";

export async function proxy(req: NextRequest) {
    const token = await getToken({ req });
    const { pathname } = req.nextUrl;

    // Belum login
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
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
        "/prodi/:path*",
        "/rektor/:path*",
    ],
};