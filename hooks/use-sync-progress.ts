'use client'

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export interface SyncJobStatus {
    id: string;
    type: "mata-kuliah" | "dosen" | "kurikulum" | "program-studi";
    title: string;
    status: "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";
    current: number;
    total: number;
    percent: number;
    message: string;
    error?: string | null;
    startedAt: number;
    updatedAt: number;
}

export function useSyncProgress() {
    const queryClient = useQueryClient();
    const previousRunningRef = useRef<Set<string>>(new Set());

    const query = useQuery<SyncJobStatus[]>({
        queryKey: ["sync-progress"],
        queryFn: async () => {
            const res = await fetch("/api/sync/progress", { cache: "no-store" });
            if (!res.ok) return [];
            const data = await res.json();
            return data.data || [];
        },
        refetchInterval: (query) => {
            const jobs = query.state.data || [];
            const isAnyRunning = jobs.some((j) => j.status === "RUNNING");
            return isAnyRunning ? 1000 : 8000;
        },
    });

    const jobs = query.data || [];

    useEffect(() => {
        for (const job of jobs) {
            const wasRunning = previousRunningRef.current.has(job.type);

            if (job.status === "RUNNING") {
                previousRunningRef.current.add(job.type);
            } else if (wasRunning) {
                previousRunningRef.current.delete(job.type);

                if (job.status === "COMPLETED") {
                    toast.success(job.message || `Sinkronisasi ${job.title} selesai!`, {
                        id: `sync-toast-${job.type}`,
                        duration: 5000,
                    });
                    // Refresh data tabel terkait
                    queryClient.invalidateQueries({ queryKey: [job.type] });
                } else if (job.status === "FAILED") {
                    toast.error(`Sinkronisasi ${job.title} gagal: ${job.error || "Terjadi kesalahan"}`, {
                        id: `sync-toast-${job.type}`,
                        duration: 6000,
                    });
                }
            }
        }
    }, [jobs, queryClient]);

    return {
        jobs,
        isRunning: jobs.some((j) => j.status === "RUNNING"),
        activeJobs: jobs.filter((j) => j.status === "RUNNING"),
    };
}

