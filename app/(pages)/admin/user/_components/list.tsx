'use client'
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DeleteProgramStudi } from "@/features/program-studi/components/delete-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useModalManager } from "@/hooks/modal-manager";
import { useGetFakultas } from "@/features/fakultas/service";
import { useDataTable } from "@/hooks/use-datatables";
import UserAdvanceFilterForm from "@/features/user/components/filter-advance";
import { UserModal } from "@/features/user/components/create-modal";
import { useGetUser } from "@/features/user/service";

/* eslint-disable */
export default function List() {
    const { open } = useModalManager();
    const [selectedFakultas, setSelectedFakultas] = useState("")
    const [selectedRole, setSelectedRole] = useState("")
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
            header: "Nama",
            cell: ({ row }) => (
                <div>{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <div>{row.getValue("role")}</div>
            ),
        },
        {
            id: "fakultas",
            header: "Fakultas",
            cell: ({ row }) => (
                <div>{row.original.Fakultas?.nama ?? "-"}</div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <div className='flex flex-wrap gap-2'>
                        <Button variant={"outline"} onClick={() => open("userModal", row.original)}><Edit /> <span className="hidden md:flex">Edit</span></Button>
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
        initialSort: [{ id: "name", desc: false }],
    });

    const { data, isLoading } = useGetUser({
        page: page,
        limit: limit,
        search: search,
        sort: { field: sorting[0].id ?? 'name', orderBy: sorting[0].desc ? 'desc' : 'asc' },
        fakultasId: Number(selectedFakultas)
    })
    const { data: dataFakultas, isLoading: isLoadingFakultas } = useGetFakultas({
        page: 1,
        remove_pagination: true
    })
    const handleFakultasChange = (newFakultas: any) => {
        setSelectedFakultas(newFakultas)
        resetAll()
    }

    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <h1 className="text-3xl font-bold order-2 md:order-1">Daftar User</h1>
                <div className="order-1 md:order-2 space-x-2">
                    <Button variant={"default"} onClick={() => open("userModal")}><Plus /> Tambah</Button>
                </div>
            </div>
            <UserAdvanceFilterForm
                current={{ selectedFakultas: Number(selectedFakultas).toString() || "", selectedRole: selectedRole || "" }}
                onFakultasChange={handleFakultasChange}
                fakultas={dataFakultas?.data ?? []}
                onRoleChange={setSelectedRole}
                onReset={()=>{
                    setSelectedFakultas("")
                    setSelectedRole("")
                    resetAll()
                }}
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
            <UserModal />
        </div>
    );
}