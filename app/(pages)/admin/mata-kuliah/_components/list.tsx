'use client'
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetFakultas } from "@/features/fakultas/service";
import { MataKuliahModal } from "@/features/mata-kuliah/components/create-modal";
import { ImportMataKuliahModal } from "@/features/mata-kuliah/components/import-modal";
import { useGetMataKuliah, useSyncMatkul } from "@/features/mata-kuliah/hooks/matkul.hook";
import { useGetProdi } from "@/features/program-studi/hooks/useProdi";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import { Import, Plus, RecycleIcon } from "lucide-react";
import React, { useMemo } from "react";

/* eslint-disable */
export default function List() {
    const { open } = useModalManager()
    const [selectedSemester, setSelectedSemester] = React.useState<string | null>(null);
    const [selectedJurusan, setSelectedJurusan] = React.useState<number | null>(null)
    const [selectedFakultas, setSelectedFakultas] = React.useState<number | null>(null)
    const [searchJurusan, setSearchJurusan] = React.useState<string>("");

    const syncronMutation = useSyncMatkul()

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
            header: "Nama Matakuliah",
            cell: ({ row }) => (
                <div className="text-wrap">{row.getValue("nama")}</div>
            ),
        },
        {
            id: "Prodi",
            header: "Prodi",
            cell: ({ row }) => (
                <div className="text-wrap">{row.original.jurusan}</div>
            ),
        },
        {
            id: "Kurikulum",
            header: "Kurikulum",
            cell: ({ row }) => (
                <div className="text-wrap">{row.original.kurikulum}</div>
            ),
        },
        {
            id: "Semester",
            header: "Semester",
            cell: ({ row }) => (
                <>{row.original.semester}</>
            ),
        },
        {
            id: "SKS",
            header: "SKS",
            cell: ({ row }) => (
                <>{row.original.sks}</>
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
        page: page,
        limit: limit,
        search: search,
        sort: { field: sorting[0].id ?? 'nama', orderBy: sorting[0].desc ? 'desc' : 'asc' },
        semester: selectedSemester,
        jurusanId: selectedJurusan
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

    const ListSemester = [
        { label: "Semester 1", value: "1"},
        { label: "Semester 2", value: "2"},
        { label: "Semester 3", value: "3"},
        { label: "Semester 4", value: "4"},
        { label: "Semester 5", value: "5"},
        { label: "Semester 6", value: "6"},
        { label: "Semester 7", value: "7"},
        { label: "Semester 8", value: "8"},
    ];

    const handleReset = ()=>{
        resetAll();
        setSelectedFakultas(null);
        setSelectedJurusan(null);
        setSelectedSemester(null)
    }
    const handleSync = async () => {
        return syncronMutation.mutateAsync()
    }

    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <h1 className="text-3xl font-bold order-2 md:order-1">Daftar Mata Kuliah</h1>
                <div className="order-1 md:order-2 flex gap-2">
                    <Button variant={"outline"} onClick={handleSync}><RecycleIcon /> Sync</Button>
                    <Button variant={"outline"} onClick={() => open("importMataKuliahModal")}><Import /> Import</Button>
                    <Button variant={"default"} onClick={() => open("mataKuliahModal")}><Plus /> Tambah</Button>
                </div>
            </div>
            <div className="grid grid cols-1 md:grid-cols-12 gap-4 py-4 border-t border-gray-200 dark:border-gray-400">
                <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                    <Label>Fakultas</Label>
                    <Combobox
                        options={fakultasOptions}
                        value={selectedFakultas !== undefined && selectedFakultas !== null ? String(selectedFakultas) : ""}
                        onChange={(value) => setSelectedFakultas(value ? Number(value) : null)}
                        placeholder="Pilih Fakultas"
                    />
                </div>
                <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                    <Label>Program Studi</Label>
                    <Combobox
                        data={prodiOptions}
                        isLoading={isLoadingProdi}
                        onSearch={setSearchJurusan}
                        showSearch={true}
                        emptyMessage="Prodi tidak ditemukan"
                        value={selectedJurusan !== undefined && selectedJurusan !== null ? String(selectedJurusan) : ""}
                        onChange={(value) => setSelectedJurusan(value ? Number(value) : null)}
                        placeholder={isLoadingProdi ? "Memuat program studu..." : "Pilih Program Studi"}

                    />
                </div>
                <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                    <Label>Semester</Label>
                    <Select value={selectedSemester ?? ""} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Pilih Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            {ListSemester.map((smt) => (
                                <SelectItem key={smt.value} value={smt.value}>{smt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-12 md:col-span-3 flex items-end">
                    <Button variant={"default"} onClick={handleReset}>Reset</Button>
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
            <MataKuliahModal />
            <ImportMataKuliahModal/>
        </div>
    );
}