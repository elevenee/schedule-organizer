'use client'
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { MataKuliahModal } from "@/features/mata-kuliah/components/create-modal";
import { useGetMataKuliah } from "@/features/mata-kuliah/service";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import React from "react";

/* eslint-disable */
export default function List() {
    const { open } = useModalManager()

    const columns: ColumnDef<any>[] = [
        {
            id: "select",
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "NAMA_MATAKULIAH",
            header: "Nama Matakuliah",
            cell: ({ row }) => (
                <>{row.getValue("NAMA_MATAKULIAH")}</>
            ),
        },
    ];

    const {
            pagination,
            sorting,
            search,
            limit,
            page,
            onPaginationChange,
            onLimitChange,
            onSortingChange,
            onSearchChange,
            resetAll
        } = useDataTable({
            initialPageSize: 20,
            initialSort: [{ id: "nama", desc: false }],
        });
    const { data, isLoading } = useGetMataKuliah({
        offset: (page - 1) * limit,
        limit,
        // sort: sorting.length > 0 ? { field: sorting[0].id, orderBy: sorting[0].desc ? 'DESC' : 'ASC' } : undefined,
    });
    
    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <h1 className="text-3xl font-bold order-2 md:order-1">Daftar Mata Kuliah</h1>
                <div className="order-1 md:order-2">
                    <Button variant={"default"} onClick={() => open("mataKuliahModal")}><Plus /> Tambah</Button>
                </div>
            </div>
            <DataTable
                data={data?.data?.data ?? []}
                columns={columns}
                totalRows={data?.data?.totalData ?? 0}
                pageSize={limit}
                loading={isLoading}
                onPaginationChange={onPaginationChange}
                onSortingChange={onSortingChange}
                pagination={pagination}
                sorting={sorting}
                search={search}
                onPerPageChange={onLimitChange}
                onSearchChange={onSearchChange}
            />
            <MataKuliahModal/>
        </div>
    );
}