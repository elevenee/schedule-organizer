import { authOptions } from "@/lib/authOptions";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function requireAuth(allowedRoles?: Role[]) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        throw new Error("UNAUTHORIZED: Sesi tidak valid atau telah berakhir. Silakan login kembali.");
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = session.user.role as Role;
        if (!allowedRoles.includes(userRole)) {
            throw new Error("FORBIDDEN: Anda tidak memiliki izin untuk melakukan tindakan ini.");
        }
    }

    return session;
}

