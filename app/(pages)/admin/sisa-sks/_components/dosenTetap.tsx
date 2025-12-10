'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useMemo, useState } from "react";
import { useModalManager } from "@/hooks/modal-manager";
import { DosenTableRow } from "./dosenTableRow";
import { useGetFakultas } from "@/features/fakultas/service";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { useGetProdi } from "@/features/program-studi/hooks/useProdi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListCheck } from "lucide-react";
import { useGetDosen } from "@/features/dosen/hooks/useDosen";
import { SearchCommand } from "@/components/ui/search-command";
import { useGetSisaSks } from "@/features/sisa-sks/service";

/* eslint-disable */
interface Props {
    pengaturan?: any;
    tahunAkademik?: any;
}
export default function DosenTetap({ pengaturan, tahunAkademik }: Props) {
    const { open } = useModalManager()
    const [selectedDosen, setSelectedDosen] = useState<number | null>(null);
    const [selectedFakultas, setSelectedFakultas] = useState<number | null>(null);
    const [selectedProdi, setSelectedProdi] = useState<number | null>(null);
    const [selectedMatkul, setSelectedMatkul] = useState<string | null>(null);
    const [searchDosen, setSearchDosen] = useState<string | null>(null)
    const { data, isLoading } = useGetSisaSks({
        page: 1,
        search: "",
        jenisDosen: "TETAP",
        tahunAkademik: tahunAkademik ? Number(tahunAkademik.id) : null,
        sort: { field: 'matakuliah', orderBy: 'asc' },
        fakultas: selectedFakultas ?? null,
        programStudi: selectedProdi ?? null,
        matakuliah: selectedMatkul ?? null,
        dosen: selectedDosen ?? null
    });
    const { data: dosenList, isLoading: isLoadingDosen } = useGetDosen({
        page: 1,
        remove_pagination: true,
        search: searchDosen ?? "",
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })
    const { data: fakultasList } = useGetFakultas({
        page: 1,
        remove_pagination: true,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })
    const { data: prodiList } = useGetProdi({
        page: 1,
        fakultas: selectedFakultas ?? undefined,
        remove_pagination: true,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })

    const dosenOptions = useMemo(() =>
        dosenList && dosenList?.data?.map((item: any) => ({
            label: <div className='flex flex-col gap-0'>
                <span>{item.nama}</span>
                <span className='text-xs text-gray-500'>{item.Fakultas?.nama ? item.Fakultas?.nama : ""}</span>
            </div>,
            value: item.id.toString(),
        })) || [],
        [dosenList, selectedFakultas]
    );

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

    const resetFilter = () => {
        setSelectedDosen(null)
        setSelectedFakultas(null)
        setSelectedProdi(null)
        setSelectedMatkul(null)
    }    

    return (
        <>
            <div className="py-4 border-t border-gray-200  flex gap-2 justify-center md:justify-between">
                <Button variant="default" onClick={() => open("listRequestModal")}><ListCheck /> List Pengajuan Jadwal</Button>
                <Button variant="outline" onClick={resetFilter}>Reset Filter</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200 mb-4">
                <div className="flex flex-col gap-2">
                    <Label>Dosen</Label>
                    <Combobox
                        data={dosenOptions}
                        isLoading={isLoadingDosen}
                        onSearch={setSearchDosen}
                        showSearch={true}
                        emptyMessage="Dosen tidak ditemukan"
                        value={selectedDosen ? selectedDosen.toString() : ""}
                        onChange={(value) => setSelectedDosen(Number(value))}
                        placeholder={isLoadingDosen ? "Memuat dosen..." : "Pilih Dosen"}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Fakultas</Label>
                    <Combobox
                        options={fakultasOptions}
                        value={selectedFakultas !== undefined && selectedFakultas !== null ? String(selectedFakultas) : ""}
                        onChange={(value) => setSelectedFakultas(value ? Number(value) : null)}
                        placeholder="Pilih Fakultas"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Program Studi</Label>
                    <Combobox
                        options={prodiOptions}
                        value={selectedProdi !== undefined && selectedProdi !== null ? String(selectedProdi) : ""}
                        onChange={(value) => setSelectedProdi(value ? Number(value) : null)}
                        placeholder="Pilih Program Studi"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Matakuliah</Label>
                    <Input
                        value={selectedMatkul ?? ""}
                        disabled={!selectedProdi}
                        onChange={(e) => setSelectedMatkul(e.target.value || null)}
                        placeholder="Ketik Matakuliah"
                    />
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="border">NO</TableHead>
                        <TableHead className="border">Nama Dosen</TableHead>
                        <TableHead className="border">#</TableHead>
                        <TableHead className="border">Fakultas</TableHead>
                        <TableHead className="border">Matakuliah</TableHead>
                        <TableHead className="border">Prodi</TableHead>
                        <TableHead className="border">SMT/Kelas</TableHead>
                        <TableHead className="border">Jumlah Kelas</TableHead>
                        <TableHead className="border">SKS</TableHead>
                        <TableHead className="border">Total SKS</TableHead>
                        <TableHead className="border">KJM</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                       isLoading ? (
                            <TableRow>
                                <TableCell className="border text-center" colSpan={12}>Memuat...</TableCell>
                            </TableRow>
                        ) : (
                            data?.data && data?.data?.length ? data.data?.map((item: any, index: number) => (
                                <DosenTableRow
                                    key={item.id || index}
                                    item={item}
                                    index={index}
                                    pengaturan={pengaturan}
                                    onOpenModal={open}
                                />
                            )) : (
                                <TableRow>
                                    <TableCell className="border text-center" colSpan={13}>Data tidak ditemukan</TableCell>
                                </TableRow>
                            )
                        )
                    }
                </TableBody>
            </Table>
            <SearchCommand
                title="Dosen"
                items={dosenList && dosenList?.data?.map((item: any) => ({
                    id: item.id,
                    label: item.nama,
                    value: item.id,
                    description: item?.Fakultas?.nama ?? "-"
                }))}
                onSearch={setSearchDosen}    
                isLoading={isLoadingDosen}
                hotkey="ctrl+k"
                onSelect={(item) => setSelectedDosen(Number(item.value))}
            />
        </>
    );
}