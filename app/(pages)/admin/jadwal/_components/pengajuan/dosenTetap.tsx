'use client'
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetFakultas } from "@/features/fakultas/service";
import { useGetJadwal } from "@/features/pengajuan-jadwal/service";
import { useGetProdi } from "@/features/program-studi/hooks/useProdi";
import { useModalManager } from "@/hooks/modal-manager";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DosenTableRow } from "./dosenTableRow";

/* eslint-disable */
interface Props {
    pengaturan?: any;
    tahunAkademik?: any;
}
export default function DosenTetap({ pengaturan, tahunAkademik }: Props) {
    const { open } = useModalManager()
    const [selectedFakultas, setSelectedFakultas] = useState<number | null>(null);
    const [selectedProdi, setSelectedProdi] = useState<number | null>(null);
    const [selectedMatkul, setSelectedMatkul] = useState<string | null>(null);
    const { data, isLoading } = useGetJadwal({
        page: 1,
        search: "",
        jenisDosen: "TETAP",
        tahunAkademik: tahunAkademik ? Number(tahunAkademik.id) : null,
        sort: { field: 'dosen.nama', orderBy: 'asc' },
        fakultas: selectedFakultas ?? null,
        programStudi: selectedProdi ?? null,
        matakuliah: selectedMatkul ?? null,
        // status: "PENDING",
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

    const updateMultipleStatus = async () => {
        const ids = new Set<number>();

        if (Array.isArray(data?.data)) {
            for (const item of data.data) {
                if (Array.isArray(item?.jadwal)) {
                    for (const jadwal of item.jadwal) {
                        if (typeof jadwal?.id === 'number' && jadwal?.status === 'PENDING') {
                            ids.add(Number(jadwal.id));
                        }
                    }
                }
            }
        }

        const result = [...ids];
        if (result.length === 0) {
            toast.error("Tidak ada data yang dapat diupdate.");
            return;
        }
        open("statusJadwalRequestAllModal", { ids: result });
    }
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-gray-200 mb-4">
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
            <div className="mb-4">
                <Button variant="default" size="sm" onClick={updateMultipleStatus}>Update Status</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="border border-gray-900 dark:border-gray-400">NO</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">Nama Dosen</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">#</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">Fakultas</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">Prodi</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">Matakuliah</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">SMT/Kelas</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">Jumlah Kelas</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">SKS</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">Total SKS</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">Sisa SKS</TableHead>
                        <TableHead className="border border-gray-900 dark:border-gray-400">KJM</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        isLoading ? (
                            <TableRow>
                                <TableCell className="border border-gray-900 dark:border-gray-400 text-center" colSpan={12}>Memuat...</TableCell>
                            </TableRow>
                        ) : (
                            data?.data && data?.data.length ? data.data?.map((item: any, index: number) => (
                                <DosenTableRow
                                    key={item.id || index}
                                    item={item}
                                    index={index}
                                    pengaturan={pengaturan}
                                    onOpenModal={open}
                                />
                            )) : (
                                <TableRow>
                                    <TableCell className="border border-gray-900 dark:border-gray-400 text-center" colSpan={12}>Data tidak ditemukan</TableCell>
                                </TableRow>
                            )
                        )
                    }
                </TableBody>
            </Table>
        </>
    );
}