'use client'
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TahunAkademikModal } from "@/features/tahun_akademik/components/create-modal";
import { DeleteTahunAkademik } from "@/features/tahun_akademik/components/delete-dialog";
import { useGetTahunAkademik, useUpdateStatusTahunAkademik } from "@/features/tahun_akademik/service";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Recycle } from "lucide-react";
import React from "react";

/* eslint-disable */
export default function List() {
    const { open } = useModalManager()

    const updateStatusTahunAkademik = useUpdateStatusTahunAkademik();
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
            header: "Tahun Akademik",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Switch id="statusta" checked={row.getValue("status") === "ACTIVE"}
                        onCheckedChange={() => handleStatusChange(row.original.id)} />
                    <Label htmlFor="statusta">{row.getValue("status")}</Label>
                </div>
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
                                <Button variant={"outline"} onClick={() => open("tahunModal", row.original)}><Edit /> <span className="hidden md:flex">Edit</span></Button>
                            )
                        }
                        {
                          row.original.deletedAt && (
                            <Button variant={"outline"}><Recycle/> Restore</Button>
                          )  
                        }
                        <DeleteTahunAkademik id={row.original.id} custom_text={row.original.deletedAt ? 'Hapus Permanent':'Hapus'}/>
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
    const { data, isLoading } = useGetTahunAkademik({
        page: page,
        limit: limit,
        search: search,
        sort: { field: sorting[0].id ?? 'name', orderBy: sorting[0].desc ? 'desc' : 'asc' },
    });

    const handleStatusChange = async (id: number) => {
        await (await updateStatusTahunAkademik).mutateAsync({
            id: id
        });
    }

    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <h1 className="text-3xl font-bold order-2 md:order-1">Daftar Tahun Akademik</h1>
                <div className="order-1 md:order-2">
                    <Button variant={"default"} onClick={() => open("tahunModal")}><Plus /> Tambah</Button>
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
            <TahunAkademikModal/>
        </div>
    );
}