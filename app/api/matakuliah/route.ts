import { requireAuth } from "@/lib/auth-guard";
import { apiFetcher } from "@/lib/api-fetcher";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";

/* eslint-disable */
export async function GET(req: NextRequest) {
    try {
        await requireAuth([Role.ADMIN, Role.FAKULTAS]);

        const data = await apiFetcher('/siakad/matakuliah', { tokenRequired: true });
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

export async function POST(req: NextRequest) {
    try {
        await requireAuth([Role.ADMIN, Role.FAKULTAS]);

        const body = await req.json().catch(() => ({}));
        const query = new URLSearchParams();

        if (body?.offset !== undefined) query.set('offset', String(body.offset));
        if (body?.limit !== undefined) query.set('limit', String(body.limit));
        if (body?.page !== undefined) query.set('page', String(body.page));
        if (body?.kode_prodi) query.set('kode_prodi', String(body.kode_prodi));
        if (body?.kurikulum_id) query.set('kurikulum_id', String(body.kurikulum_id));
        if (body?.semester) query.set('semester', String(body.semester));
        if (body?.search) query.set('search', String(body.search));

        if (body?.filter && typeof body.filter === 'string') {
            const match = body.filter.match(/KODE_PRODI\s*=\s*['"]?([^'"]+)['"]?/i);
            if (match && !body?.kode_prodi) {
                query.set('kode_prodi', match[1].trim());
            }
        }

        const queryString = query.toString() ? `?${query.toString()}` : '';
        const data = await apiFetcher(`/siakad/matakuliah${queryString}`, {
            method: 'GET',
            tokenRequired: true
        });

        return Response.json({ revalidated: true, now: Date.now(), data }, { status: 200 });
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
                    errors: error.details?.details && Array.isArray(error.details?.details) ? error.details?.details.map((err: any) => ({
                        field: err.field,
                        message: err.errors.join(', ')
                    })) : {
                        field: error.details?.details?.field,
                        message: error.details?.details?.details
                    }
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
