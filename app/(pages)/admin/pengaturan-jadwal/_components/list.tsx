'use client'
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PengaturanJadwalModal } from "@/features/pengaturan/jadwal/components/create-modal";
import { useGetPengaturanJadwal } from "@/features/pengaturan/jadwal/service";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Recycle } from "lucide-react";
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
            accessorKey: "name",
            header: "Jenis Dosen",
            cell: ({ row }) => (
                <>{row.original.jenisDosen}</>
            ),
        },
        {
            accessorKey: "minSks",
            header: "MIN SKS",
            cell: ({ row }) => (
                <>{row.original.minSks}</>
            ),
        },
        {
            accessorKey: "maxSks",
            header: "MAX SKS",
            cell: ({ row }) => (
                <>{row.original.maxSks}</>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <div className='flex flex-wrap gap-2'>
                        {
                            !row.original.deletedAt && (
                                <Button variant={"outline"} onClick={() => open("pengaturanJadwalModal", row.original)}><Edit /> <span className="hidden md:flex">Edit</span></Button>
                            )
                        }
                        {
                          row.original.deletedAt && (
                            <Button variant={"outline"}><Recycle/> Restore</Button>
                          )  
                        }
                        </div>
                )
            },
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
        } = useDataTable({
            initialPageSize: 20,
            initialSort: [{ id: "jenisDosen", desc: false }],
        });
    const { data, isLoading } = useGetPengaturanJadwal({
        page: page,
        limit: limit,
        search: search,
        sort: { field: sorting[0].id ?? 'jenisDosen', orderBy: sorting[0].desc ? 'desc' : 'asc' },
    });

    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <h1 className="text-3xl font-bold order-2 md:order-1">Pengaturan Jadwal</h1>
            </div>
            <DataTable
                data={data?.data ?? []}
                columns={columns}
                totalRows={data?.total ?? 0}
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
            <PengaturanJadwalModal/>
        </div>
    );
}