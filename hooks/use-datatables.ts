import { useState } from "react";
import type { SortingState, PaginationState } from "@tanstack/react-table";

interface UseDataTableOptions {
    initialPageSize?: number;
    initialSort?: SortingState;
    initialSearch?: string;
}

export function useDataTable({
    initialPageSize = 10,
    initialSort = [],
    initialSearch = "",
}: UseDataTableOptions = {}) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: initialPageSize,
    });

    const [sorting, setSorting] = useState<SortingState>(
        Array.isArray(initialSort) ? initialSort : [initialSort]
    );

    const [search, setSearch] = useState(initialSearch);

    // --- Handlers ---
    const onPaginationChange = (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
        setPagination((old) => (typeof updater === "function" ? updater(old) : updater));
    };

    const onSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
        setSorting((old) => (typeof updater === "function" ? updater(old) : updater));
    };

    const onSearchChange = (value: string) => {
        setSearch(value);
        setPagination((old) => ({ ...old, pageIndex: 0 })); // reset halaman saat search berubah
    };

    const onLimitChange = (limit: string | number) => {
        const newLimit = typeof limit === "string" ? Number(limit) : limit;
        setPagination({ pageIndex: 0, pageSize: newLimit });
    };

    const resetAll = () => {
        setPagination({ pageIndex: 0, pageSize: initialPageSize });
        setSorting(Array.isArray(initialSort) ? initialSort : [initialSort]);
        setSearch(initialSearch);
    };

    return {
        // --- TanStack-compatible states ---
        pagination,
        sorting,
        search,

        // --- Pagination helper values ---
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        skip: pagination.pageIndex * pagination.pageSize,

        // --- Setters / event handlers ---
        onPaginationChange,
        onSortingChange,
        onSearchChange,
        onLimitChange,
        resetAll,
    };
}
