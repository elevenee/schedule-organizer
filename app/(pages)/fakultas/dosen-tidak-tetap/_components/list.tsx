'use client'
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { DosenNoHPModal } from "@/features/dosen/components/nomor-hp-modal";
import { useGetDosen, useSyncDosen } from "@/features/dosen/hooks/useDosen";
import { useGetFakultas } from "@/features/fakultas/service";
import { useGetProdi } from "@/features/program-studi/hooks/useProdi";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";

export default function List() {
    const { open } = useModalManager()
    const syncronMutation = useSyncDosen();
    const [selectedJenisDosen, setSelectedJenisDosen] = React.useState<string | null>(null);
    const [selectedFakultas, setSelectedFakultas] = React.useState<number | null>(null);
    const [selectedProdi, setSelectedProdi] = React.useState<number | null>(null);
    const [searchJurusan, setSearchJurusan] = React.useState<string>("");

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
                <div>{row.getValue("nama")}</div>
            ),
        },
        {
            accessorKey: "no_hp",
            header: "No.Hp",
            cell: ({ row }) => (
                <div className="cursor-pointer" onClick={() => open('dosenHpModal', row.original)}>
                    {
                        row.original.no_hp ? row.original.no_hp : <Badge variant={"destructive"}>Belum Ada</Badge>
                    }
                </div>
            ),
        },
        {
            id: "fakultas",
            header: "Fakultas",
            cell: ({ row }) => (
                <div className="text-wrap">{row.original.Fakultas?.nama ?? "-"}</div>
            ),
        },
        {
            id: "prodi",
            header: "Program Studi",
            cell: ({ row }) => (
                <div className="text-wrap">{row.original.Jurusan?.nama ?? "-"}</div>
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
    } = useDataTable({
        initialPageSize: 20,
        initialSort: [{ id: "nama", desc: false }],
    });
    const { data, isLoading } = useGetDosen({
        page: page,
        limit: limit,
        search: search,
        sort: { field: sorting[0].id ?? 'nama', orderBy: sorting[0].desc ? 'desc' : 'asc' },
        status: "TIDAK_TETAP",
        fakultasId: selectedFakultas ?? undefined,
        jurusanId: selectedProdi ?? undefined,
    });

    const { data: fakultasList } = useGetFakultas({
        page: 1,
        remove_pagination: true,
        limit: 100,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })

    const { data: prodiList, isLoading: isLoadingProdi } = useGetProdi({
        page: 1,
        fakultas: selectedFakultas ?? 99999,
        remove_pagination: true,
        search: searchJurusan,
        limit: 100,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })

    const fakultasOptions = useMemo(() =>
        fakultasList && fakultasList?.data?.map((item: any) => ({
            label: item.nama,
            value: item.id.toString(),
        })) || [],
        [fakultasList]
    );
    const prodiOptions = useMemo(() =>
        prodiList && selectedFakultas && prodiList?.data?.map((item: any) => ({
            label: item.nama,
            value: item.id.toString(),
        })) || [],
        [prodiList, selectedFakultas]
    );

    const handleSync = async () => {
        return syncronMutation.mutateAsync()
    }
    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <h1 className="text-3xl font-bold order-2 md:order-1">Daftar Dosen</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t">
                <div className="flex flex-col gap-2">
                    <Label>Fakultas</Label>
                    <Combobox
                        options={fakultasOptions}
                        value={selectedFakultas !== undefined && selectedFakultas !== null ? String(selectedFakultas) : ""}
                        onChange={(value) => setSelectedFakultas(value ? Number(value) : null)}
                        placeholder="Pilih Fakultas"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Program Studi</Label>
                    <Combobox
                        data={prodiOptions}
                        isLoading={isLoadingProdi}
                        onSearch={setSearchJurusan}
                        showSearch={true}
                        emptyMessage="Jurusan tidak ditemukan"
                        value={selectedProdi !== undefined && selectedProdi !== null ? String(selectedProdi) : ""}
                        onChange={(value) => setSelectedProdi(value ? Number(value) : null)}
                        placeholder={isLoadingProdi ? "Memuat jurusan..." : "Pilih Jurusan"}

                    />
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
            <DosenNoHPModal />
        </div>
    );
}