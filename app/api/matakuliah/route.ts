'use server'
import { apiFetcher } from "@/lib/api-fetcher";
import { NextRequest } from "next/server";

/* eslint-disable */
export async function GET(req: NextRequest) {
    try {
        const data = await apiFetcher('/siakad/matakuliah', { tokenRequired: true }, req);
        if (!data) {
            return Response.json({ message: "Data tidak ditemukan" }, { status: 404 });
        }
        return Response.json(data);
    } catch (error: any) {        
        if (error.message === 'Validation failed') {
            return Response.json(
                {
                    message: "Validation failed",
                    errors: error.details?.details.map((err: any) => ({
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
/* eslint-disable */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const query = new URLSearchParams();

        if (body?.offset !== undefined) query.set('offset', String(body.offset));
        if (body?.limit !== undefined) query.set('limit', String(body.limit));
        if (body?.page !== undefined) query.set('page', String(body.page));
        if (body?.kode_prodi) query.set('kode_prodi', String(body.kode_prodi));
        if (body?.kurikulum_id) query.set('kurikulum_id', String(body.kurikulum_id));
        if (body?.semester) query.set('semester', String(body.semester));
        if (body?.search) query.set('search', String(body.search));

        // Parse legacy filter e.g. "KODE_PRODI = '70232'"
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
        }, req);

        return Response.json({ revalidated: true, now: Date.now(), data }, { status: 200 });
    } catch (error: any) {
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