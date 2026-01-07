'use client'
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useGetFakultas } from "@/features/fakultas/service";
import { ProgramStudiModal } from "@/features/program-studi/components/create-modal";
import { DeleteProgramStudi } from "@/features/program-studi/components/delete-dialog";
import ProgramStudiFilterAdvanceForm from "@/features/program-studi/components/filter-advance";
import { useGetProdi, useSyncProgramStudi } from "@/features/program-studi/hooks/useProdi";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, RecycleIcon } from "lucide-react";
import { useState } from "react";

/* eslint-disable */
export default function List() {
    const { open } = useModalManager();
    const [selectedFakultas, setSelectedFakultas] = useState("")
    const syncronMutation = useSyncProgramStudi();

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
            header: "Nama Program Studi",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("nama")}</div>
            ),
        },
        {
            id: "fakultas",
            header: "Fakultas",
            cell: ({ row }) => (
                <div className="capitalize">{row.original.Fakultas?.nama}</div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <div className='flex flex-wrap gap-2'>
                        <Button variant={"outline"} onClick={() => open("prodiModal", row.original)}><Edit /> <span className="hidden md:flex">Edit</span></Button>
                        <DeleteProgramStudi id={row.original.id} />
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
        resetAll
    } = useDataTable({
        initialPageSize: 20,
        initialSort: [{ id: "nama", desc: false }],
    });

    const { data, isLoading } = useGetProdi({
        page: page,
        limit: limit,
        search: search,
        sort: { field: sorting[0].id ?? 'nama', orderBy: sorting[0].desc ? 'desc' : 'asc' },
        fakultas: Number(selectedFakultas)
    })
    const { data: dataFakultas, isLoading: isLoadingFakultas } = useGetFakultas({
        page: 1,
        remove_pagination: true
    })
    const handleFakultasChange = (newFakultas: any) => {
        setSelectedFakultas(newFakultas)
        resetAll()
    }

    const handleSync = async ()=>{
        const sync = await syncronMutation.mutateAsync()
    }

    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <h1 className="text-3xl font-bold order-2 md:order-1">Daftar Program Studi</h1>
                <div className="order-1 md:order-2 space-x-2">
                    <Button variant={"outline"} onClick={handleSync}><RecycleIcon /> Sync</Button>
                    <Button variant={"default"} onClick={() => open("prodiModal")}><Plus /> Tambah</Button>
                </div>
            </div>
            <ProgramStudiFilterAdvanceForm
                current={{ q: search, perPage: limit, selectedFakultas: Number(selectedFakultas).toString() || "" }}
                onFakultasChange={handleFakultasChange}
                fakultas={dataFakultas?.data ?? []}
            />
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
            <ProgramStudiModal />
        </div>
    );
}