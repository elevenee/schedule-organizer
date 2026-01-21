'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DosenModal } from "@/features/dosen/components/create-modal";
import { DeleteDosen } from "@/features/dosen/components/delete-dialog";
import { ImportHomebaseDosenModal } from "@/features/dosen/components/import-homebase-modal";
import { ImportDosenModal } from "@/features/dosen/components/import-modal";
import { useGetDosen, useSyncDosen } from "@/features/dosen/hooks/useDosen";
import { useGetFakultas } from "@/features/fakultas/service";
import { useGetProdi } from "@/features/program-studi/hooks/useProdi";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Import, Plus, Recycle, RecycleIcon } from "lucide-react";
import React, { useMemo } from "react";

export default function List() {
    const { open } = useModalManager()
    const syncronMutation = useSyncDosen();
    const [selectedJenisDosen, setSelectedJenisDosen] = React.useState<string | null>(null);
    const [selectedFakultas, setSelectedFakultas] = React.useState<number | null>(null);
    const [selectedProdi, setSelectedProdi] = React.useState<number | null>(null);
    const [searchJurusan, setSearchJurusan] = React.useState<string>("");
    const JenisDosen = [
        { label: "TETAP", value: "TETAP" },
        { label: "TIDAK TETAP", value: "TIDAK_TETAP" },
    ];

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
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div>
                    {
                        row.getValue("status") === 'TETAP' ? (<Badge variant={"outline"} className="text-emerald-500">TETAP</Badge>) : (<Badge variant={"outline"} className="text-blue-500">TIDAK TETAP</Badge>)
                    }
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
                                <Button variant={"outline"} onClick={() => open("dosenModal", row.original)}><Edit /> <span className="hidden md:flex">Edit</span></Button>
                            )
                        }
                        {
                            row.original.deletedAt && (
                                <Button variant={"outline"}><Recycle /> Restore</Button>
                            )
                        }
                        <DeleteDosen id={row.original.id} custom_text={row.original.deletedAt ? 'Hapus Permanent' : 'Hapus'} />
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
        status: selectedJenisDosen ?? "",
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
                <div className="order-1 md:order-2 flex gap-2">
                    <Button variant={"outline"} onClick={handleSync}><RecycleIcon /> Sync</Button>
                    <Button variant={"default"} onClick={() => open("importHomebaseDosenModal")}><Import /> Update Homebase</Button>
                    <Button variant={"default"} onClick={() => open("importDosenModal")}><Import /> Import</Button>
                    <Button variant={"default"} onClick={() => open("dosenModal")}><Plus /> Tambah</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t">
                <div className="flex flex-col gap-2">
                    <Label>Jenis Dosen</Label>
                    <Select value={selectedJenisDosen ?? ""} onValueChange={setSelectedJenisDosen}>
                        <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Pilih Jenis Dosen" />
                        </SelectTrigger>
                        <SelectContent>
                            {JenisDosen.map((jenis) => (
                                <SelectItem key={jenis.value} value={jenis.value}>{jenis.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
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
            <DosenModal />
            <ImportDosenModal/>
            <ImportHomebaseDosenModal/>
        </div>
    );
}