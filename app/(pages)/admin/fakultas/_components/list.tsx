'use client'
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FakultasModal } from "@/features/fakultas/components/create-modal";
import { DeleteFakultas } from "@/features/fakultas/components/delete-dialog";
import { ListProgramStudi } from "@/features/fakultas/components/list-program-studi";
import { useGetFakultas } from "@/features/fakultas/service";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";
import React from "react";

export default function List() {
    const { open } = useModalManager()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            header: "Nama Fakultas",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("nama")}</div>
            ),
        },
        {
            header: "Program Studi",
            cell: ({ row }) => (
                <Button variant={"outline"} className="capitalize" onClick={() => open("listProdiModal", row.original)}>
                    {Object.keys(row.original.Jurusan).length} Program Studi
                </Button>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <div className='flex flex-wrap gap-2'>
                        <Button variant={"outline"} onClick={() => open("fakultasModal", row.original)}><Edit /> <span className="hidden md:flex">Edit</span></Button>
                        <DeleteFakultas id={row.original.id} />
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
        initialSort: [{ id: "name", desc: false }],
    });

    const { data, isLoading } = useGetFakultas({
        page,
        limit,
        search,
        sort: { field: sorting[0].id ?? 'name', orderBy: sorting[0].desc ? 'desc' : 'asc' },
    })
    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <h1 className="text-3xl font-bold order-2 md:order-1">Daftar Fakultas</h1>
                <div className="order-1 md:order-2">
                    <Button variant={"default"} onClick={()=>open("fakultasModal")}><Plus /> Tambah</Button>
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
            <FakultasModal/>
            <ListProgramStudi/>
        </div>
    );
}