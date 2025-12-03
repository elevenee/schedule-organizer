import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "./authOptions";

export async function requireRole(allowedRoles: Role[]) {
    const session = await getServerSession(authOptions);

    if (!session || !allowedRoles.includes(session.user.role as Role)) {
        return { allowed: false, session };
    }

    return { allowed: true, session };
}