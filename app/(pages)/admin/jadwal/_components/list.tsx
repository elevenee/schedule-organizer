'use client'
import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { JadwalModal } from "@/features/jadwal/components/create-modal";
import { DeleteJadwal } from "@/features/jadwal/components/delete-dialog";
import { useGetJadwal } from "@/features/jadwal/service";
import { useGetPengaturanJadwal } from "@/features/pengaturan/jadwal/service";
import { useModalManager } from "@/hooks/modal-manager";
import { useDataTable } from "@/hooks/use-datatables";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Recycle, Trash } from "lucide-react";
import React from "react";

export default function List() {
    const { open } = useModalManager()
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
        initialPageSize: 1000,
        initialSort: [{ id: "matakuliah", desc: false }],
    });
    const { data: pengaturan } = useGetPengaturanJadwal({
        page: 1,
        limit: 2,
        sort: { field: 'jenisDosen', orderBy: 'desc' },
    })
    const { data, isLoading } = useGetJadwal({
        page: page,
        limit: limit,
        search: search,
        sort: { field: sorting[0].id ?? 'matakuliah', orderBy: sorting[0].desc ? 'desc' : 'asc' },
    });

    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold order-2 md:order-1">Daftar Jadwal</h1>
                    <p className="text-gray-400">Tahun Akademik: 2026/2027</p>
                </div>
                <div className="order-1 md:order-2">
                    <Button variant={"default"} onClick={() => open("jadwalModal")}><Plus /> Tambah</Button>
                </div>
            </div>
            <div>
                <div className="flex w-full flex-col gap-6">
                    <Tabs defaultValue="tetap">
                        <TabsList>
                            <TabsTrigger value="tetap">Dosen Tetap</TabsTrigger>
                            <TabsTrigger value="tidak_tetap">Dosen Tidak Tetap</TabsTrigger>
                        </TabsList>
                        <TabsContent value="tetap" className="w-full">
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
                                                                            if (maxSks >= item.totalSKS) {
                                                                                return true;
                                                                            }
                                                                            return false;
                                                                        }
                                                                        return (
                                                                            <TableRow key={index}>
                                                                                <TableCell rowSpan={(item.jadwal?.length ?? 1)}>{index + 1}</TableCell>
                                                                                <TableCell rowSpan={(item.jadwal?.length ?? 1)} className="font-medium">
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
                                                                                <TableCell rowSpan={(item.jadwal?.length ?? 1)} className="text-center font-bold">{item.totalSKS}</TableCell>
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
                                                            <TableCell className="font-medium">
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
                                                            <TableCell>{item?.totalSKS}</TableCell>
                                                        </TableRow>
                                                    )
                                                }
                                            </React.Fragment>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TabsContent>
                        <TabsContent value="tidak_tetap">

                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            {/* <DataTable
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
            /> */}
            <JadwalModal />
        </div>
    );
}