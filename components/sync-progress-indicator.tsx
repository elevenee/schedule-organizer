'use client'

import React, { useState } from "react";
import { useSyncProgress } from "@/hooks/use-sync-progress";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Database } from "lucide-react";

export function SyncProgressIndicator() {
    const { jobs, isRunning } = useSyncProgress();
    const [collapsed, setCollapsed] = useState(false);

    // Filter jobs yang sedang running atau baru saja selesai dalam 5 detik terakhir
    const relevantJobs = jobs.filter(
        (j) => j.status === "RUNNING" || Date.now() - j.updatedAt < 5000
    );

    if (relevantJobs.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full sm:w-96 transition-all duration-300 ease-in-out">
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl">
                {/* Header Widget */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                            <Database className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {isRunning ? "Sinkronisasi Berjalan" : "Sinkronisasi Selesai"}
                            </h4>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                Berjalan di background (Redis Worker)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
                        title={collapsed ? "Buka detail" : "Sembunyikan detail"}
                    >
                        {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* Body List of Jobs */}
                {!collapsed && (
                    <div className="space-y-3">
                        {relevantJobs.map((job) => {
                            const isDone = job.status === "COMPLETED";
                            const isFailed = job.status === "FAILED";

                            return (
                                <div key={job.id} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                                            {isDone ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            ) : isFailed ? (
                                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                            ) : (
                                                <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                                            )}
                                            <span>{job.title}</span>
                                        </div>
                                        <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                                            {job.percent}%
                                        </span>
                                    </div>

                                    <Progress
                                        value={job.percent}
                                        className={`h-2 transition-all ${
                                            isDone ? "[&>[data-slot=progress-indicator]]:bg-emerald-500" : ""
                                        }`}
                                    />

                                    <div className="flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400">
                                        <span className="truncate pr-2">{job.message}</span>
                                        {job.total > 0 && (
                                            <span className="whitespace-nowrap font-mono">
                                                {job.current.toLocaleString("id-ID")}/{job.total.toLocaleString("id-ID")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

