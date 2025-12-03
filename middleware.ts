import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { roleAccessMap } from "./lib/role-map";
import { Role } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // kalau user belum login dan masuk route yang butuh auth → redirect login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // cek apakah route punya aturan role
  for (const route in roleAccessMap) {
    if (pathname.startsWith(route)) {
      const allowedRoles = roleAccessMap[route];

      // cek role user dari session JWT
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
