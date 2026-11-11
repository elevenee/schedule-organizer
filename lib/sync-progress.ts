import { redis } from "./redis";

export type SyncType = "mata-kuliah" | "dosen" | "kurikulum" | "program-studi";
export type SyncStatus = "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";

export interface SyncJobStatus {
    id: string;
    type: SyncType;
    title: string;
    status: SyncStatus;
    current: number;
    total: number;
    percent: number;
    message: string;
    error?: string | null;
    startedAt: number;
    updatedAt: number;
}

const REDIS_KEY_PREFIX = "sync:job:";
const SYNC_TYPES: SyncType[] = ["mata-kuliah", "dosen", "kurikulum", "program-studi"];

export async function setSyncProgress(job: SyncJobStatus): Promise<void> {
    try {
        const key = `${REDIS_KEY_PREFIX}${job.type}`;
        // Simpan status di Redis dengan TTL 2 jam (7200 detik)
        await redis.set(key, JSON.stringify(job), "EX", 7200);
    } catch (e: any) {
        console.warn("[setSyncProgress Error]:", e.message);
    }
}

export async function getSyncProgress(type: SyncType): Promise<SyncJobStatus | null> {
    try {
        const key = `${REDIS_KEY_PREFIX}${type}`;
        const data = await redis.get(key);
        if (!data) return null;
        return JSON.parse(data) as SyncJobStatus;
    } catch (e: any) {
        console.warn("[getSyncProgress Error]:", e.message);
        return null;
    }
}

export async function getActiveSyncJobs(): Promise<SyncJobStatus[]> {
    try {
        const jobs: SyncJobStatus[] = [];
        for (const t of SYNC_TYPES) {
            const job = await getSyncProgress(t);
            if (job && (job.status === "RUNNING" || Date.now() - job.updatedAt < 10000)) {
                jobs.push(job);
            }
        }
        return jobs;
    } catch (e: any) {
        console.warn("[getActiveSyncJobs Error]:", e.message);
        return [];
    }
}

