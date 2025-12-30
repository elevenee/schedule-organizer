'use client'
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useCapacityCheck } from '@/features/jadwal/hooks/use-capacity-check';
import { DeleteSisaSks } from '@/features/sisa-sks/components/delete-dialog';
import { Edit } from 'lucide-react';

/* eslint-disable */
interface DosenTableRowProps {
    item: any;
    index: number;
    pengaturan: any;
    onOpenModal: (modal: string, data: any) => void;
}

export function DosenTableRow({ item, index, pengaturan, onOpenModal }: DosenTableRowProps) {
    return <SingleJadwalRow item={item} index={index} pengaturan={pengaturan} onOpenModal={onOpenModal} />;
}

/* eslint-disable */
function SingleJadwalRow({ item, index, pengaturan, onOpenModal }: DosenTableRowProps) {
    const { capacityStyle } = useCapacityCheck(item, pengaturan);
    
    return (
        <TableRow>
            <TableCell className='border'>{index + 1}</TableCell>
            <ActionButtons item={item} currentTotalSks={item.totalSKS} pengaturan={{...pengaturan, maxSks: pengaturan?.data?.find((p: any) => p.jenisDosen === item.status)?.maxSks }} onOpenModal={onOpenModal} />
            <TableCell className='border'><div className="text-wrap">{item.Fakultas?.nama}</div></TableCell>
            <TableCell className='border'><div className='text-wrap'>{item.Jurusan?.nama}</div></TableCell>
            <TableCell className='border text-wrap'><div className='text-wrap'>{item.Matakuliah?.nama?.toUpperCase()}</div></TableCell>
            <TableCell className='border text-center'>{`${item.semester}/${item.kelas?.join(',')}`}</TableCell>
            <TableCell className='border text-center'>{item.kelas?.length || 0}</TableCell>
            <TableCell className='border text-center'>{item.sks}</TableCell>
            <TableCell className={`border font-bold text-center ${capacityStyle}`}>{item.totalSks}</TableCell>
        </TableRow>
    );
}

// Helper component for action buttons
/* eslint-disable */
function ActionButtons({ item, currentTotalSks, pengaturan, onOpenModal }: { item: any; currentTotalSks?: number; pengaturan?: any; onOpenModal: (modal: string, data: any) => void; }) {
    const itemEdit = {
        id: item?.id ? Number(item.id): undefined,
        matakuliahId: Number(item?.matakuliahId) ?? '',
        kurikulumId: Number(item?.Matakuliah?.kurikulumId) ?? '',
        sks: item?.sks ? item.sks?.toString() : undefined,
        kelas: item?.kelas ?? [],
        keterangan: item?.keterangan ?? '',
        semester: item?.semester ? item.semester.toString() : undefined,
        dosenId: undefined,
        fakultasId: item?.fakultasId ? Number(item.fakultasId) : undefined,
        jurusanId: item?.jurusanId ? Number(item.jurusanId) : undefined,
        currentTotalSKS: currentTotalSks,
        maxSks: pengaturan?.maxSks,
    } as any;
    
    const handleEdit = () => {
        onOpenModal("sisaSksModal", itemEdit);
    }

    return (
        <TableCell className='border'>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleEdit}>
                    <Edit className="text-sky-500 h-4 w-4" />
                </Button>
                <DeleteSisaSks id={Number(item.id)} />
            </div>
        </TableCell>
    );
}