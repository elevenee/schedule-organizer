'use client'
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DeleteJadwal } from '@/features/jadwal/components/delete-dialog';
import { useCapacityCheck } from '@/features/jadwal/hooks/use-capacity-check';
import { Edit } from 'lucide-react';

/* eslint-disable */
interface DosenTableRowProps {
    item: any;
    index: number;
    pengaturan: any;
    onOpenModal: (modal: string, data: any) => void;
}

export function DosenTableRow({ item, index, pengaturan, onOpenModal }: DosenTableRowProps) {
    const hasMultipleJadwal = item?.jadwal?.length > 1;
    if (hasMultipleJadwal) {
        return <MultipleJadwalRow item={item} index={index} pengaturan={pengaturan} onOpenModal={onOpenModal} />;
    }

    return <SingleJadwalRow item={item} index={index} pengaturan={pengaturan} onOpenModal={onOpenModal} />;
}

// Helper component for multiple jadwal
/* eslint-disable */
function MultipleJadwalRow({ item, index, pengaturan, onOpenModal }: DosenTableRowProps) {
    const { capacityStyle, isOverCapacity } = useCapacityCheck(item, pengaturan);
    return (
        <>
            {item.jadwal.map((jadwal: any, jadwalIndex: number) => (
                <TableRow key={`${item.id}-${jadwal.id || jadwalIndex}`}>
                    {/* First row with rowspan for common data */}
                    {jadwalIndex === 0 && (
                        <>
                            <TableCell rowSpan={item.jadwal.length} className='border border-gray-900 dark:border-gray-400'>{index + 1}</TableCell>
                            <TableCell rowSpan={item.jadwal.length} className={`font-medium ${capacityStyle}`}>
                                <DosenNameCell
                                    item={{ ...item, maxSks: pengaturan?.data?.find((p: any) => p.jenisDosen === item.status)?.maxSks }}
                                    isOverCapacity={isOverCapacity}
                                    onOpenModal={onOpenModal}
                                />
                            </TableCell>
                        </>
                    )}

                    <ActionButtons item={jadwal} currentTotalSks={item.totalSKS} pengaturan={{...pengaturan, maxSks: pengaturan?.data?.find((p: any) => p.jenisDosen === item.status)?.maxSks }} hasActions={true} onOpenModal={onOpenModal} />
                    <JadwalDataCell jadwal={jadwal} />

                    {/* Total SKS only in first row */}
                    {jadwalIndex === 0 && (
                        <>
                            <TableCell rowSpan={item.jadwal.length} className={`text-center font-bold border border-gray-900 dark:border-gray-400 ${capacityStyle}`}>
                                {item.totalSKS}
                            </TableCell>
                            <TableCell rowSpan={item.jadwal.length} className={`text-center font-bold border border-gray-900 dark:border-gray-400 ${capacityStyle}`}>{item.totalSKS - 12}</TableCell>
                        </>
                    )}
                </TableRow>
            ))}
        </>
    );
}

/* eslint-disable */
function SingleJadwalRow({ item, index, pengaturan, onOpenModal }: DosenTableRowProps) {
    const { capacityStyle } = useCapacityCheck(item, pengaturan);
    const jadwal = item.jadwal?.[0];
    const hasJadwal = !!jadwal;

    return (
        <TableRow>
            <TableCell className='border border-gray-900 dark:border-gray-400'>{index + 1}</TableCell>
            <TableCell className={`font-medium border border-gray-900 dark:border-gray-400 ${capacityStyle}`}>
                <DosenNameCell
                    item={{ ...item, maxSks: pengaturan?.data?.find((p: any) => p.jenisDosen === item.status)?.maxSks }}
                    isOverCapacity={false}
                    onOpenModal={onOpenModal}
                />
            </TableCell>
            <ActionButtons item={jadwal} currentTotalSks={item.totalSKS} pengaturan={{...pengaturan, maxSks: pengaturan?.data?.find((p: any) => p.jenisDosen === item.status)?.maxSks }} hasActions={hasJadwal} onOpenModal={onOpenModal} />
            <JadwalDataCell jadwal={jadwal} />
            <TableCell className={`border border-gray-900 dark:border-gray-400 font-bold text-center ${capacityStyle}`}>{item.totalSKS}</TableCell>
            <TableCell className={`border border-gray-900 dark:border-gray-400 font-bold text-center ${capacityStyle}`}>{item.totalSKS - 12}</TableCell>
        </TableRow>
    );
}

// Helper component for action buttons
/* eslint-disable */
function ActionButtons({ item, currentTotalSks, pengaturan, hasActions, onOpenModal }: { item: any; currentTotalSks?: number; pengaturan?: any; hasActions: boolean, onOpenModal: (modal: string, data: any) => void; }) {
    if (!hasActions) return <TableCell className='border border-gray-900 dark:border-gray-400'></TableCell>;
    const itemEdit = {
        id: item?.id ? Number(item.id) : undefined,
        matakuliahId: Number(item?.matakuliahId) ?? undefined,
        kurikulumId: Number(item?.kurikulumId) ?? undefined,
        sks: item?.sks ? item.sks.toString() : undefined,
        kelas: item?.kelas ?? [],
        keterangan: item?.keterangan ?? '',
        semester: item?.semester ? item.semester.toString() : undefined,
        dosenId: item?.dosenId ? Number(item.dosenId) : undefined,
        fakultasId: item?.fakultasId ? Number(item.fakultasId) : undefined,
        jurusanId: item?.jurusanId ? Number(item.jurusanId) : undefined,
        currentTotalSKS: currentTotalSks,
        maxSks: pengaturan?.maxSks,
        jenisDosen: pengaturan?.jenisDosen
    } as any;
    
    const handleEdit = () => {
        onOpenModal("jadwalModal", itemEdit);
    }

    return (
        <TableCell className='border border-gray-900 dark:border-gray-400'>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleEdit}>
                    <Edit className="text-sky-500 h-4 w-4" />
                </Button>
                <DeleteJadwal id={Number(item.id)} />
            </div>
        </TableCell>
    );
}

// Helper component for jadwal data
/* eslint-disable */
function JadwalDataCell({ jadwal }: { jadwal: any }) {
    if (!jadwal) {
        return (
            <>
                <TableCell className='border border-gray-900 dark:border-gray-400'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400'></TableCell>
            </>
        );
    }
    
    return (
        <>
            <TableCell className='border border-gray-900 dark:border-gray-400'><div className="text-wrap">{jadwal.fakultas}</div></TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400'><div className='text-wrap'>{jadwal.jurusan}</div></TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-wrap'><div className='text-wrap'>{jadwal.matakuliah}</div></TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center'>{`${jadwal.semester}/${jadwal.kelas?.join(',')}`}</TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center'>{jadwal.kelas?.length || 0}</TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center'>{jadwal.sks}</TableCell>
        </>
    );
}

// Helper component for dosen name with context menu
/* eslint-disable */
function DosenNameCell({ item, isOverCapacity, onOpenModal }: {
    item: any;
    isOverCapacity: boolean;
    onOpenModal: (modal: string, data: any) => void;
}) {
    if (isOverCapacity) {
        return <span>{item.nama}</span>;
    }

    return (
        <div>
            <ContextMenu>
                <ContextMenuTrigger>
                    <Tooltip>
                        <TooltipTrigger asChild className='w-full'>
                            <span className="cursor-pointer" onClick={() => onOpenModal("jadwalModal", { dosenId: item.id, currentTotalSKS: item.totalSKS.toFixed(1), maxSks: item.maxSks })}>{item.nama}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Klik kanan untuk tambah jadwal</p>
                        </TooltipContent>
                    </Tooltip>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => onOpenModal("jadwalModal", { dosenId: item.id, currentTotalSKS: item.totalSKS.toFixed(1), maxSks: item.maxSks })}>
                        Tambah Jadwal
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <p className="text-xs text-muted-foreground font-normal">{item.homebase}</p>
        </div>
    );
}