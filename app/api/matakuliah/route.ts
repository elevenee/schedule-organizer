'use server'
import { apiFetcher } from "@/lib/api-fetcher";
import { NextRequest } from "next/server";

/* eslint-disable */
export async function GET(req: NextRequest) {
    try {
        const data = await apiFetcher('/akademik/matakuliah', { tokenRequired: true }, req);
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
        const body = await req.json();
        const data = await apiFetcher('/akademik/matakuliah', {
            method: 'POST',
            body,
            tokenRequired: true
        }, req);

        return Response.json({ revalidated: true, now: Date.now(), data }, { status: 200 });
    } catch (error: any) {
        console.log(error);
        
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