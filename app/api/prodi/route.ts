import { requireAuth } from "@/lib/auth-guard";
import { apiFetcher } from "@/lib/api-fetcher";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";

/* eslint-disable */
async function handleProdiRequest(req: NextRequest) {
    try {
        await requireAuth([Role.ADMIN, Role.FAKULTAS]);

        const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
        const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};

        const query = new URLSearchParams();
        const idFakultas = body?.id_fakultas ?? searchParams.get('id_fakultas');
        const kodeJenjang = body?.kode_jenjang ?? searchParams.get('kode_jenjang');
        const search = body?.search ?? searchParams.get('search');
        const status = body?.status ?? searchParams.get('status');

        if (idFakultas !== undefined && idFakultas !== null && idFakultas !== '') {
            query.set('id_fakultas', String(idFakultas));
        }
        if (kodeJenjang) query.set('kode_jenjang', String(kodeJenjang));
        if (search) query.set('search', String(search));
        if (status) query.set('status', String(status));

        const queryString = query.toString() ? `?${query.toString()}` : '';
        const data = await apiFetcher(`/siakad/program-studi${queryString}`, {
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

export async function GET(req: NextRequest) {
    return handleProdiRequest(req);
}

export async function POST(req: NextRequest) {
    return handleProdiRequest(req);
}
