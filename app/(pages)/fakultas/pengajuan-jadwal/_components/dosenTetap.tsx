'use client'
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useEffect, useMemo, useState } from "react";
import { useModalManager } from "@/hooks/modal-manager";
import { DosenTableRow } from "./dosenTableRow";
import { useGetFakultas } from "@/features/fakultas/service";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { useGetProdi } from "@/features/program-studi/hooks/useProdi";
import { Input } from "@/components/ui/input";
import { useGetJadwal } from "@/features/pengajuan-jadwal/service";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";

/* eslint-disable */
interface Props {
    pengaturan?: any;
    tahunAkademik?: any;
}
/* eslint-disable */
export default function DosenTetap({ pengaturan, tahunAkademik }: Props) {
    const { open } = useModalManager();
    const session = useSession();
    const [selectedFakultas, setSelectedFakultas] = useState<number | null>(session.data?.user?.fakultasId ?? null);
    const [selectedProdi, setSelectedProdi] = useState<number | null>(null);
    const [selectedMatkul, setSelectedMatkul] = useState<string | null>(null);
    const { data, isLoading } = useGetJadwal({
        page: 1,
        search: "",
        jenisDosen: "TETAP",
        tahunAkademik: tahunAkademik ? Number(tahunAkademik.id) : null,
        sort: { field: 'matakuliah', orderBy: 'asc' },
        fakultas: selectedFakultas ?? null,
        programStudi: selectedProdi ?? null,
        matakuliah: selectedMatkul ?? null,
    });
    const { data: fakultasList, isLoading: isLoadingFakultas } = useGetFakultas({
        page: 1,
        remove_pagination: true,
        id: selectedFakultas ?? undefined,
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

    const fakultasOptions = useMemo(() =>
        fakultasList && fakultasList?.data?.map((item: any) => ({
            label: item.nama,
            value: item.id.toString(),
        })) || [],
        [fakultasList, selectedFakultas]
    );
    const prodiOptions = useMemo(() =>
        prodiList && selectedFakultas && prodiList?.data?.map((item: any) => ({
            label: item.nama,
            value: item.id.toString(),
        })) || [],
        [prodiList, selectedFakultas]
    );
    
    useEffect(()=>{
        if (session.data?.user?.fakultasId) {
            setSelectedFakultas(session.data?.user?.fakultasId)
        }
    }, [session])
    

    return (
        <>
            <div className="py-4 border-t border-gray-200">
                <Button variant="default" onClick={() => open("jadwalRequestModal")}><Plus /> Tambah Jadwal</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-gray-200 mb-4">
                <div className="space-y-2">
                    <Label>Fakultas</Label>
                    <Combobox
                        options={fakultasOptions}
                        value={selectedFakultas !== undefined && selectedFakultas !== null ? String(selectedFakultas) : ""}
                        onChange={(value) => setSelectedFakultas(value ? Number(value) : null)}
                        placeholder={isLoadingFakultas ? "Memuat..." : "Pilih Fakultas"}
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
                        <TableHead className="border">Jurusan</TableHead>
                        <TableHead className="border">SMT/Kelas</TableHead>
                        <TableHead className="border">SKS</TableHead>
                        <TableHead className="border">Jumlah Kelas</TableHead>
                        <TableHead className="border">Total Pengajuan SKS</TableHead>
                        <TableHead className="border">Total SKS</TableHead>
                        <TableHead className="border">KJM</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        data?.data && data.data?.map((item: any, index: number) => (
                            <DosenTableRow
                                key={item.id || index}
                                item={item}
                                index={index}
                                pengaturan={pengaturan}
                                onOpenModal={open}
                            />
                        ))
                    }
                </TableBody>
            </Table>
        </>
    );
}