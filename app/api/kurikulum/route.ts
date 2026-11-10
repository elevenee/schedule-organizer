import { apiFetcher } from "@/lib/api-fetcher";
import { NextRequest } from "next/server";

/* eslint-disable */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const query = new URLSearchParams();
        const prodiId = body?.prodi_id || body?.prodiId || body?.ProdiID;
        if (prodiId) query.set('prodi_id', String(prodiId));
        if (body?.search) query.set('search', String(body.search));
        if (body?.na) query.set('na', String(body.na));

        const queryString = query.toString() ? `?${query.toString()}` : '';
        const data = await apiFetcher(`/siakad/kurikulum${queryString}`, {
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