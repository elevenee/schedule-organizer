'use client'
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchCommand } from "@/components/ui/search-command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetDosen } from "@/features/dosen/hooks/useDosen";
import { useGetFakultas } from "@/features/fakultas/service";
import { useGetJadwal } from "@/features/pengajuan-jadwal/service";
import { useGetProdi } from "@/features/program-studi/hooks/useProdi";
import { useModalManager } from "@/hooks/modal-manager";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { DosenTableRow } from "./dosenTableRow";

/* eslint-disable */
interface Props {
    pengaturan?: any;
    tahunAkademik?: any;
}
/* eslint-disable */
export default function DosenTidakTetap({ pengaturan, tahunAkademik }: Props) {
    const { open } = useModalManager();
    const session = useSession();
    const [selectedDosen, setSelectedDosen] = useState<number | null>(null);
    const [currentFakultas, setCurrentFakultas] = useState<number | null>(null);
    const [selectedFakultas, setSelectedFakultas] = useState<number | null>(null);
    const [selectedProdi, setSelectedProdi] = useState<number | null>(null);
    const [selectedMatkul, setSelectedMatkul] = useState<string | null>(null);
    const [searchDosen, setSearchDosen] = useState<string | null>(null)
    const { data, isLoading } = useGetJadwal({
        page: 1,
        search: "",
        jenisDosen: "TIDAK_TETAP",
        tahunAkademik: tahunAkademik ? Number(tahunAkademik.id) : null,
        sort: { field: 'dosen.nama', orderBy: 'asc' },
        fakultas: selectedFakultas ?? null,
        programStudi: selectedProdi ?? null,
        matakuliah: selectedMatkul ?? null,
        dosen: selectedDosen ?? null
    });
    const { data: dosenList, isLoading: isLoadingDosen } = useGetDosen({
        page: 1,
        remove_pagination: true,
        search: searchDosen ?? "",
        status: "TIDAK_TETAP",
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })
    const { data: fakultasList, isLoading: isLoadingFakultas } = useGetFakultas({
        page: 1,
        remove_pagination: true,
        // id: selectedFakultas ?? undefined,
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
        [fakultasList, selectedFakultas]
    );
    const prodiOptions = useMemo(() =>
        prodiList && selectedFakultas && prodiList?.data?.map((item: any) => ({
            label: item.nama,
            value: item.id.toString(),
        })) || [],
        [prodiList, selectedFakultas]
    );

    useEffect(() => {
        if (session.data?.user?.fakultasId) {
            setCurrentFakultas(session.data?.user?.fakultasId)
        }
    }, [session])

    const resetFilter = () => {
        setSelectedDosen(null)
        setSelectedProdi(null)
        setSelectedMatkul(null)
    }

    return (
        <>
            <div className="py-4 border-t border-gray-200 flex gap-2 justify-center md:justify-between">
                <Button variant="default" onClick={() => open("jadwalRequestModal", { jenisDosen: 'TIDAK_TETAP' })}><Plus /> Ajukan Jadwal</Button>
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
                <div className="flex flex-col gap-2">
                    <Label>Fakultas</Label>
                    <Combobox
                        options={fakultasOptions}
                        value={selectedFakultas !== undefined && selectedFakultas !== null ? String(selectedFakultas) : ""}
                        onChange={(value) => setSelectedFakultas(value ? Number(value) : null)}
                        placeholder={isLoadingFakultas ? "Memuat..." : "Pilih Fakultas"}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Program Studi</Label>
                    <Combobox
                        options={prodiOptions}
                        value={selectedProdi !== undefined && selectedProdi !== null ? String(selectedProdi) : ""}
                        onChange={(value) => setSelectedProdi(value ? Number(value) : null)}
                        placeholder="Pilih Program Studi"
                    />
                </div>
                <div className="flex flex-col gap-2">
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
                        <TableHead className="border">Σ Kelas</TableHead>
                        <TableHead className="border">SKS</TableHead>
                        <TableHead className="border">Σ SMT/Kelas Diterima</TableHead>
                        <TableHead className="border">Σ Pengajuan SKS</TableHead>
                        <TableHead className="border">Σ SKS</TableHead>
                        <TableHead className="border">KJM</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        isLoading ? (
                            <TableRow>
                                <TableCell className="border text-center" colSpan={13}>Memuat...</TableCell>
                            </TableRow>
                        ) : (
                            data?.data && data?.data?.length ? data.data?.map((item: any, index: number) => (
                                <DosenTableRow
                                    key={item.id || index}
                                    item={item}
                                    index={index}
                                    pengaturan={pengaturan}
                                    onOpenModal={open}
                                    fakultasId={currentFakultas ?? undefined}
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