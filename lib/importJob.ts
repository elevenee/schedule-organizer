import { v4 as uuidv4 } from "uuid";

export type JobStatus = {
    jobId: string;
    status: "pending" | "processing" | "done" | "failed";
    total: number;
    processed: number;
    success: number;
    failed: number;
    errors: Array<{ rowIndex: number; reason: string; row?: any, detail?: any }>;
    startedAt?: number;
    finishedAt?: number | null;
};

export const importJobs = new Map<string, JobStatus>();

export function createJob(total = 0) {
    const jobId = uuidv4();
    const job: JobStatus = {
        jobId,
        status: "pending",
        total,
        processed: 0,
        success: 0,
        failed: 0,
        errors: [],
        startedAt: Date.now(),
        finishedAt: null,
    };
    importJobs.set(jobId, job);
    return job;
}

export function getJob(jobId: string) {
    return importJobs.get(jobId) ?? null;
}