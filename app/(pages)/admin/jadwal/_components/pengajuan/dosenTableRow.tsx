'use client'
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Jadwal } from '@prisma/client';
import { useCapacityCheck } from '@/features/jadwal/hooks/use-capacity-check';

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
    const maxSks = pengaturan?.data?.find((p: any) => p.jenisDosen === item.status)?.maxSks || 0;
    return (
        <>
            {item.jadwal.map((jadwal: any, jadwalIndex: number) => (
                <TableRow key={`${item.id}-${jadwal.id || jadwalIndex}`}>
                    <ActionButtons item={jadwal} hasActions={true} onOpenModal={onOpenModal} />
                    {/* First row with rowspan for common data */}
                    {jadwalIndex === 0 && (
                        <>
                            <TableCell rowSpan={item.jadwal.length} className='border'>{index + 1}</TableCell>
                            <TableCell rowSpan={item.jadwal.length} className={`font-medium ${capacityStyle}`}>
                                <DosenNameCell
                                    item={{ ...item, maxSks: maxSks}}
                                    isOverCapacity={isOverCapacity}
                                    onOpenModal={onOpenModal}
                                />
                            </TableCell>
                        </>
                    )}

                    <JadwalDataCell jadwal={jadwal} />

                    {/* Total SKS only in first row */}
                    {jadwalIndex === 0 && (
                        <>
                            <TableCell rowSpan={item.jadwal.length} className={`text-center font-bold border ${capacityStyle}`}>
                                {item.totalSKSRequest}
                            </TableCell>
                            <TableCell rowSpan={item.jadwal.length} className={`text-center font-bold border ${capacityStyle}`}>{maxSks - item.totalSKS}</TableCell>
                            <TableCell rowSpan={item.jadwal.length} className={`text-center font-bold border ${capacityStyle}`}>{item.totalSKS - 12}</TableCell>
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
    const maxSks = pengaturan?.data?.find((p: any) => p.jenisDosen === item.status)?.maxSks || 0;
    
    return (
        <TableRow>
            <TableCell className='border'>{index + 1}</TableCell>
            <ActionButtons item={jadwal} hasActions={hasJadwal} onOpenModal={onOpenModal} />
            <TableCell className={`font-medium border ${capacityStyle}`}>
                <DosenNameCell
                    item={{ ...item, maxSks: maxSks }}
                    isOverCapacity={false}
                    onOpenModal={onOpenModal}
                />
            </TableCell>
            <JadwalDataCell jadwal={jadwal} />
            <TableCell className={`border font-bold text-center ${capacityStyle}`}>{item.totalSKSRequest}</TableCell>
            <TableCell className={`border font-bold text-center ${capacityStyle}`}>{maxSks - item.totalSKS}</TableCell>
            <TableCell className={`border font-bold text-center ${capacityStyle}`}>{item.totalSKS - 12}</TableCell>
        </TableRow>
    );
}

// Helper component for action buttons
/* eslint-disable */
function ActionButtons({ item, hasActions, onOpenModal }: { item: Jadwal; hasActions: boolean, onOpenModal: (modal: string, data: any) => void; }) {
    if (!hasActions) return <TableCell className='border'></TableCell>;

    const handleApprove = () => {
        onOpenModal("statusJadwalRequestModal", { id: item.id, status: "APPROVED" });
    }
    const handleReject = () => {
       onOpenModal("statusJadwalRequestModal", { id: item.id, status: "REJECTED" });
    }

    return (
        <TableCell className='border'>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleApprove}>
                    <Check className="text-sky-500 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleReject}>
                    <X className="text-rose-500 h-4 w-4" />
                </Button>
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
                <TableCell className='border'></TableCell>
                <TableCell className='border'></TableCell>
                <TableCell className='border'></TableCell>
                <TableCell className='border'></TableCell>
                <TableCell className='border'></TableCell>
                <TableCell className='border'></TableCell>
            </>
        );
    }

    return (
        <>
            <TableCell className='border'><div className="text-wrap">{jadwal.fakultas}</div></TableCell>
            <TableCell className='border text-wrap'><div className='text-wrap'>{jadwal.matakuliah}</div></TableCell>
            <TableCell className='border'><div className='text-wrap'>{jadwal.jurusan}</div></TableCell>
            <TableCell className='border text-center'>{`${jadwal.semester}/${jadwal.kelas?.join(',')}`}</TableCell>
            <TableCell className='border text-center'>{jadwal.sks}</TableCell>
            <TableCell className='border text-center'>{jadwal.kelas?.length || 0}</TableCell>
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
            <span>{item.nama}</span>
            <p className="text-xs text-muted-foreground font-normal">{item.homebase}</p>
        </div>
    );
}