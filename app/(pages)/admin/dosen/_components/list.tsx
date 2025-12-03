'use client'
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DosenModal } from "@/features/dosen/components/create-modal";
import { DeleteDosen } from "@/features/dosen/components/delete-dialog";
import { useGetDosen, useSyncDosen } from "@/features/dosen/hooks/useDosen";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Recycle, RecycleIcon } from "lucide-react";
import React from "react";

export default function List() {
    const { open } = useModalManager()
    const syncronMutation = useSyncDosen();

    /* eslint-disable */
    const columns: ColumnDef<any>[] = [
        {
            id: "select",
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "nama",
            header: "Nama Dosen",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("nama")}</div>
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
                                <Button variant={"outline"} onClick={() => open("dosenModal", row.original)}><Edit /> <span className="hidden md:flex">Edit</span></Button>
                            )
                        }
                        {
                          row.original.deletedAt && (
                            <Button variant={"outline"}><Recycle/> Restore</Button>
                          )  
                        }
                        <DeleteDosen id={row.original.id} custom_text={row.original.deletedAt ? 'Hapus Permanent':'Hapus'}/>
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
            initialSort: [{ id: "nama", desc: false }],
        });
    const { data, isLoading } = useGetDosen({
        page: page,
        limit: limit,
        search: search,
        sort: { field: sorting[0].id ?? 'nama', orderBy: sorting[0].desc ? 'desc' : 'asc' },
    });

    const handleSync = async ()=>{
        const sync = await syncronMutation.mutateAsync()
    }
    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <h1 className="text-3xl font-bold order-2 md:order-1">Daftar Dosen</h1>
                <div className="order-1 md:order-2 flex gap-2">
                    <Button variant={"outline"} onClick={handleSync}><RecycleIcon /> Sync</Button>
                    <Button variant={"default"} onClick={() => open("dosenModal")}><Plus /> Tambah</Button>
                </div>
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
            <DosenModal/>
        </div>
    );
}