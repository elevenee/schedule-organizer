'use client'
import { useGetJadwal } from "@/features/jadwal/service";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useModalManager } from "@/hooks/modal-manager";

/* eslint-disable */
interface Props {
    pengaturan?: any;
    tahunAkademik?: any;
}
/* eslint-disable */
export default function DosenTidakTetap({ pengaturan, tahunAkademik }: Props) {
    const { open } = useModalManager()
    const { data } = useGetJadwal({
        page: 1,
        search: "",
        jenisDosen: "TIDAK_TETAP",
        tahunAkademik: tahunAkademik ? Number(tahunAkademik.id) : null,
        sort: { field: 'matakuliah', orderBy: 'asc' },
    });
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>NO</TableHead>
                        <TableHead>Nama Dosen</TableHead>
                        <TableHead>#</TableHead>
                        <TableHead>Fakultas</TableHead>
                        <TableHead>Matakuliah</TableHead>
                        <TableHead>Jurusan</TableHead>
                        <TableHead>SMT/Kelas</TableHead>
                        <TableHead>SKS</TableHead>
                        <TableHead>Jumlah Kelas</TableHead>
                        <TableHead>Total SKS</TableHead>
                        <TableHead>KJM</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        data?.data && data.data?.map((item: any, index: number) => (
                            <React.Fragment key={index}>
                                {
                                    item?.jadwal?.length > 1 ? (
                                        <>
                                            {
                                                item.jadwal?.map((j: any, index: number) => {
                                                    if (index === 0) {
                                                        const set = pengaturan && pengaturan?.data?.filter((p: any) => {
                                                            return p.jenisDosen === item.status;
                                                        });
                                                        const checkCapacity = () => {
                                                            const minSks = set && set[0].minSks;
                                                            const maxSks = set && set[0].maxSks;
                                                            if (item.totalSKS >= maxSks) {
                                                                return true;
                                                            }
                                                            return false;
                                                        }
                                                        const capacityStyle = () => {
                                                            if (checkCapacity()) {
                                                                return "bg-rose-500";
                                                            }
                                                            return "bg-green-100";
                                                        }
                                                        return (
                                                            <TableRow key={index}>
                                                                <TableCell rowSpan={(item.jadwal?.length ?? 1)}>{index + 1}</TableCell>
                                                                <TableCell rowSpan={(item.jadwal?.length ?? 1)} className={`font-medium ${capacityStyle()}`}>
                                                                    {
                                                                        checkCapacity() ? (
                                                                            <>{item.nama}</>
                                                                        ) : (
                                                                            <ContextMenu>
                                                                                <ContextMenuTrigger>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            {item.nama}
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            <p>Klik kanan untuk tambah jadwal</p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </ContextMenuTrigger>
                                                                                <ContextMenuContent>
                                                                                    <ContextMenuItem onClick={() => open("jadwalModal", {
                                                                                        dosenId: item.id
                                                                                    })}>Tambah Jadwal</ContextMenuItem>
                                                                                </ContextMenuContent>
                                                                            </ContextMenu>
                                                                        )
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="flex gap-2">
                                                                    <Button variant={"outline"}><Edit className="text-sky-500" /></Button>
                                                                    <Button variant={"outline"}><Trash className="text-rose-500" /></Button>
                                                                </TableCell>
                                                                <TableCell>{j.fakultas}</TableCell>
                                                                <TableCell>{j.matakuliah}</TableCell>
                                                                <TableCell>{j.jurusan}</TableCell>
                                                                <TableCell>{j.semester + "/" + j.kelas?.join(',')}</TableCell>
                                                                <TableCell>{j.sks}</TableCell>
                                                                <TableCell>{j.kelas.length}</TableCell>
                                                                <TableCell rowSpan={(item.jadwal?.length ?? 1)} className={`text-center font-bold ${capacityStyle()}`}>{item.totalSKS}</TableCell>
                                                            </TableRow>
                                                        )
                                                    }
                                                    return (
                                                        <TableRow key={j.id}>
                                                            <TableCell className="flex gap-2">
                                                                <Button variant={"outline"}><Edit className="text-sky-500" /></Button>
                                                                <Button variant={"outline"}><Trash className="text-rose-500" /></Button>
                                                            </TableCell>
                                                            <TableCell>{j.fakultas}</TableCell>
                                                            <TableCell>{j.matakuliah}</TableCell>
                                                            <TableCell>{j.jurusan}</TableCell>
                                                            <TableCell>{j.semester + "/" + j.kelas?.join(',')}</TableCell>
                                                            <TableCell>{j.sks}</TableCell>
                                                            <TableCell>{j.kelas.length}</TableCell>
                                                        </TableRow>
                                                    )
                                                })
                                            }
                                        </>
                                    ) : (
                                        <TableRow>
                                            {
                                                item.jadwal.length === 1 ? (
                                                    <TableCell rowSpan={1}>{index + 1}</TableCell>
                                                ) : (<TableCell>{index + 1}</TableCell>)
                                            }
                                            <TableCell className={`font-medium bg-rose-500`}>
                                                <ContextMenu>
                                                    <ContextMenuTrigger>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                {item.nama}
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Klik kanan untuk tambah jadwal</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </ContextMenuTrigger>
                                                    <ContextMenuContent>
                                                        <ContextMenuItem onClick={() => open("jadwalModal", {
                                                            dosenId: item.id
                                                        })}>Tambah Jadwal</ContextMenuItem>
                                                    </ContextMenuContent>
                                                </ContextMenu>
                                            </TableCell>
                                            <TableCell className="flex gap-2">
                                                {
                                                    item?.jadwal.length ? (
                                                        <>
                                                            <Button variant={"outline"}><Edit className="text-sky-500" /></Button>
                                                            <Button variant={"outline"}><Trash className="text-rose-500" /></Button>
                                                        </>
                                                    ) : (<></>)
                                                }
                                            </TableCell>
                                            <TableCell>{item?.jadwal.length === 1 ? item.jadwal[0].fakultas : ''}</TableCell>
                                            <TableCell>{item?.jadwal.length === 1 ? item.jadwal[0].matakuliah : ''}</TableCell>
                                            <TableCell>{item?.jadwal.length === 1 ? item.jadwal[0].jurusan : ''}</TableCell>
                                            <TableCell>{item?.jadwal.length === 1 ? (item.jadwal[0].semester + item.jadwal[0]?.kelas.join(',')) : ''}</TableCell>
                                            <TableCell>{item?.jadwal.length === 1 ? item.jadwal[0].sks : ''}</TableCell>
                                            <TableCell>{item?.jadwal.length === 1 ? item.jadwal[0].kelas.length : ''}</TableCell>
                                            <TableCell className="bg-rose-500">{item?.totalSKS}</TableCell>
                                        </TableRow>
                                    )
                                }
                            </React.Fragment>
                        ))
                    }
                </TableBody>
            </Table>
        </>
    );
}