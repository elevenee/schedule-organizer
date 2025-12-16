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
import { useGetSisaSks } from "@/features/sisa-sks/service";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multiple-select";

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
    const [selectedBaseFakultas, setSelectedBaseFakultas] = useState<number | null>(null);
    const [selectedBaseProdi, setSelectedBaseProdi] = useState<number | null>(null);
    const [selectedMatkul, setSelectedMatkul] = useState<string | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [selectedKelas, setSelectedKelas] = useState<string[]>([]);
    const { data, isLoading } = useGetSisaSks({
        page: 1,
        search: "",
        jenisDosen: "TETAP",
        tahunAkademik: tahunAkademik ? Number(tahunAkademik.id) : null,
        sort: { field: 'matakuliah', orderBy: 'asc' },
        fakultas: selectedFakultas ?? null,
        programStudi: selectedProdi ?? null,
        fakultasBase: selectedBaseFakultas ?? null,
        programStudiBase: selectedBaseProdi ?? null,
        matakuliah: selectedMatkul ?? null,
        semester: selectedSemester ?? null,
        kelas: selectedKelas
    });
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
    const { data: prodiListBase } = useGetProdi({
        page: 1,
        fakultas: selectedBaseFakultas ?? undefined,
        remove_pagination: true,
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
    const prodiOptionsBase = useMemo(() =>
        prodiListBase && selectedBaseFakultas && prodiListBase?.data?.map((item: any) => ({
            label: item.nama,
            value: item.id.toString(),
        })) || [],
        [prodiListBase, selectedBaseFakultas]
    );

    const resetFilter = () => {
        setSelectedDosen(null)
        setSelectedFakultas(null)
        setSelectedProdi(null)
        setSelectedBaseFakultas(null)
        setSelectedBaseProdi(null)
        setSelectedMatkul(null)
        setSelectedSemester(null)
    }

    const SEMESTER = [1, 2, 3, 4, 5, 6, 7, 8];
    const availableKelas = [
        { value: "A", label: "Kelas A" },
        { value: "B", label: "Kelas B" },
        { value: "C", label: "Kelas C" },
        { value: "D", label: "Kelas D" },
        { value: "E", label: "Kelas E" },
        { value: "F", label: "Kelas F" },
        { value: "G", label: "Kelas G" },
        { value: "H", label: "Kelas H" },
        { value: "I", label: "Kelas I" },
        { value: "J", label: "Kelas J" },
        { value: "K", label: "Kelas K" },
    ];

    return (
        <>
            <div className="py-4 border-t border-gray-200  flex gap-2 justify-center md:justify-between">
                <Button variant="outline" onClick={resetFilter}>Reset Filter</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-200">
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
                        onChange={(e) => setSelectedMatkul(e.target.value || null)}
                        placeholder="Ketik Matakuliah"
                    />
                </div>
            </div>
            <Collapsible>
                <CollapsibleTrigger><span className="cursor-pointer">Show more filter</span></CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-gray-200 mb-4">
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select
                                value={selectedSemester ?? ""}
                                onValueChange={setSelectedSemester}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        SEMESTER.map((item: any) => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kelas</Label>
                            <MultiSelect
                                options={availableKelas}
                                selected={selectedKelas}
                                onChange={setSelectedKelas}
                                placeholder="Pilih kelas..."
                                searchPlaceholder="Cari kelas..."
                                emptyMessage="Kelas tidak ditemukan"
                                maxCount={10}
                            />
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="border">NO</TableHead>
                        <TableHead className="border">#</TableHead>
                        <TableHead className="border">Fakultas</TableHead>
                        <TableHead className="border">Matakuliah</TableHead>
                        <TableHead className="border">Prodi</TableHead>
                        <TableHead className="border">SMT/Kelas</TableHead>
                        <TableHead className="border">Jumlah Kelas</TableHead>
                        <TableHead className="border">SKS</TableHead>
                        <TableHead className="border">Total SKS</TableHead>
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
        </>
    );
}