import { NextResponse } from "next/server";
import { getActiveSyncJobs } from "@/lib/sync-progress";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const jobs = await getActiveSyncJobs();
        return NextResponse.json({ success: true, data: jobs });
    } catch (error: any) {
        return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }
}

