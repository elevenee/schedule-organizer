'use client'
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DeleteFakultas } from "@/features/fakultas/components/delete-dialog";
import { KurikulumModal } from "@/features/kurikulum/components/create-modal";
import { useGetKurikulum } from "@/features/kurikulum/service";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";

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
            header: "Nama Kurikulum",
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
                        <Button variant={"outline"} onClick={() => open("kurikulumModal", row.original)}><Edit /> <span className="hidden md:flex">Edit</span></Button>
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
        initialSort: [{ id: "nama", desc: false }],
    });

    const { data, isLoading } = useGetKurikulum({
        page,
        limit,
        search,
        sort: { field: sorting[0].id ?? 'name', orderBy: sorting[0].desc ? 'desc' : 'asc' },
    })
    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <h1 className="text-3xl font-bold order-2 md:order-1">Daftar Kurikulum</h1>
                <div className="order-1 md:order-2">
                    <Button variant={"default"} onClick={()=>open("kurikulumModal")}><Plus /> Tambah</Button>
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
            <KurikulumModal/>
        </div>
    );
}