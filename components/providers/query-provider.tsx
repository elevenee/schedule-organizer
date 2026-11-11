'use client'

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,       // 5 menit data dianggap segar (tidak refetch sembarangan)
                gcTime: 15 * 60 * 1000,          // 15 menit cache disimpan di memori
                refetchOnWindowFocus: false,    // Jangan refetch otomatis saat pengguna ganti tab
                refetchOnReconnect: false,      // Jangan spam refetch saat reconnect
                retry: 1,                       // Cukup coba 1x lagi jika request gagal
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            {children}
        </QueryClientProvider>
    );
}
