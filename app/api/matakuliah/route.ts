import { requireAuth } from "@/lib/auth-guard";
import { apiFetcher } from "@/lib/api-fetcher";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";

/* eslint-disable */
async function handleMataKuliahRequest(req: NextRequest) {
    try {
        await requireAuth([Role.ADMIN, Role.FAKULTAS]);

        const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
        const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};

        const query = new URLSearchParams();

        const offset = body?.offset ?? searchParams.get('offset');
        const limit = body?.limit ?? searchParams.get('limit');
        const page = body?.page ?? searchParams.get('page');
        const kodeProdi = body?.kode_prodi ?? searchParams.get('kode_prodi');
        const kurikulumId = body?.kurikulum_id ?? searchParams.get('kurikulum_id');
        const semester = body?.semester ?? searchParams.get('semester');
        const wajibPilihan = body?.wajib_pilihan ?? searchParams.get('wajib_pilihan');
        const search = body?.search ?? searchParams.get('search');
        const filter = body?.filter ?? searchParams.get('filter');

        if (offset !== undefined && offset !== null && offset !== '') query.set('offset', String(offset));
        if (limit !== undefined && limit !== null && limit !== '') query.set('limit', String(limit));
        if (page !== undefined && page !== null && page !== '') query.set('page', String(page));
        if (kodeProdi) query.set('kode_prodi', String(kodeProdi));
        if (kurikulumId) query.set('kurikulum_id', String(kurikulumId));
        if (semester) query.set('semester', String(semester));
        if (wajibPilihan) query.set('wajib_pilihan', String(wajibPilihan));
        if (search) query.set('search', String(search));

        // Legacy string filter parsing fallback (e.g. "KODE_PRODI = '70232'")
        if (filter && typeof filter === 'string') {
            const match = filter.match(/KODE_PRODI\s*=\s*['"]?([^'"]+)['"]?/i);
            if (match && !query.has('kode_prodi')) {
                query.set('kode_prodi', match[1].trim());
            }
        }

        const queryString = query.toString() ? `?${query.toString()}` : '';
        const data = await apiFetcher(`/siakad/matakuliah${queryString}`, {
            method: 'GET',
            tokenRequired: true
        });

        if (!data) {
            return Response.json({ message: "Data tidak ditemukan" }, { status: 404 });
        }

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
    return handleMataKuliahRequest(req);
}

export async function POST(req: NextRequest) {
    return handleMataKuliahRequest(req);
}
