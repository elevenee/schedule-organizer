import { requireAuth } from "@/lib/auth-guard";
import { apiFetcher } from "@/lib/api-fetcher";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";

/* eslint-disable */
export async function GET(req: NextRequest) {
    try {
        await requireAuth([Role.ADMIN]);

        const data = await apiFetcher('/akademik/transkripmahasiswa', { tokenRequired: true });
        if (!data) {
            return Response.json({ message: "Data tidak ditemukan" }, { status: 404 });
        }
        return Response.json(data);
    } catch (error: any) {        
        if (error.message?.startsWith('UNAUTHORIZED')) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (error.message?.startsWith('FORBIDDEN')) {
            return Response.json({ message: "Forbidden" }, { status: 403 });
        }
        if (error.message === 'Validation failed') {
            return Response.json(
                {
                    message: "Validation failed",
                    errors: error.details?.details?.map((err: any) => ({
                        field: err.field,
                        message: err.errors.join(', ')
                    }))
                },
                { status: 422 }
            );
        }

        return Response.json(
            { success: false, message: error.message || 'Unexpected error' },
            { status: 500 }
        );
    }
}
