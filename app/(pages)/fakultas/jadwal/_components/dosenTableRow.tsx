'use client'
import { TableCell, TableRow } from '@/components/ui/table';
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
    return (
        <>
            {item.jadwal.map((jadwal: any, jadwalIndex: number) => (
                <TableRow key={`${item.id}-${jadwal.id || jadwalIndex}`}>
                    {/* First row with rowspan for common data */}
                    {jadwalIndex === 0 && (
                        <>
                            <TableCell rowSpan={item.jadwal.length} className='border border-gray-900 dark:border-gray-400 text-center'>{index + 1}</TableCell>
                            <TableCell rowSpan={item.jadwal.length} className={`font-medium ${capacityStyle}`}>
                                <DosenNameCell
                                    item={{ ...item, maxSks: pengaturan?.data?.find((p: any) => p.jenisDosen === item.status)?.maxSks }}
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
                            <TableCell rowSpan={item.jadwal.length} className={`text-center font-bold border border-gray-900 dark:border-gray-400 text-center ${capacityStyle}`}>
                                {item.totalSKS}
                            </TableCell>
                            <TableCell rowSpan={item.jadwal.length} className={`text-center font-bold border border-gray-900 dark:border-gray-400 text-center ${capacityStyle}`}>{item.totalSKS - 12}</TableCell>
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
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center'>{index + 1}</TableCell>
            <TableCell className={`font-medium border border-gray-900 dark:border-gray-400 text-center ${capacityStyle}`}>
                <DosenNameCell
                    item={{ ...item, maxSks: pengaturan?.data?.find((p: any) => p.jenisDosen === item.status)?.maxSks }}
                    isOverCapacity={false}
                    onOpenModal={onOpenModal}
                />
            </TableCell>
            <JadwalDataCell jadwal={jadwal} />
            <TableCell className={`border border-gray-900 dark:border-gray-400 text-center font-bold text-center ${capacityStyle}`}>{item.totalSKS}</TableCell>
            <TableCell className={`border border-gray-900 dark:border-gray-400 text-center font-bold text-center ${capacityStyle}`}>{item.totalSKS - 12}</TableCell>
        </TableRow>
    );
}
// Helper component for jadwal data
/* eslint-disable */
function JadwalDataCell({ jadwal }: { jadwal: any }) {
    if (!jadwal) {
        return (
            <>
                <TableCell className='border border-gray-900 dark:border-gray-400 text-center'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400 text-center'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400 text-center'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400 text-center'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400 text-center'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400 text-center'></TableCell>
                <TableCell className='border border-gray-900 dark:border-gray-400 text-center'></TableCell>
            </>
        );
    }
    
    return (
        <>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center'><div className="text-wrap">{jadwal.fakultas}</div></TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center'><div className='text-wrap'>{jadwal.jurusan}</div></TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center text-wrap'><div className='text-wrap'>{jadwal.matakuliah}</div></TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center text-center'>{`${jadwal.semester}/${jadwal.kelas?.join(',')}`}</TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center text-center'>{jadwal.kelas?.length || 0}</TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center text-center'>{jadwal.sks}</TableCell>
            <TableCell className='border border-gray-900 dark:border-gray-400 text-center'>{jadwal.kelas?.length * jadwal.sks}</TableCell>
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
            {item.nama}
            <p className="text-xs text-muted-foreground font-normal">{item.homebase}</p>
        </div>
    );
}