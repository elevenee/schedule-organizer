'use client';

import { Button } from "@/components/ui/button";
import BaseModal from '@/components/ui/modal';
import { useModalManager } from '@/hooks/modal-manager';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStoreJadwal, useUpdateJadwal } from '../service';
import { jadwalFormValues, jadwalSchema } from '../validations';
import { JadwalForm } from './create-form';

export function JadwalModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("jadwalModal");
    const jadwal = getData("jadwalModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMaximumReached, setIsMaximumReached] = useState(false);

    const form = useForm<jadwalFormValues>({
        resolver: zodResolver(jadwalSchema),
        defaultValues: {
            id: jadwal?.id ? Number(jadwal.id) : undefined,
            matakuliahId: jadwal?.matakuliahId ? Number(jadwal?.matakuliahId): undefined,
            sks: jadwal?.sks ? jadwal.sks : undefined,
            kelas: jadwal?.kelas ?? [],
            keterangan: jadwal?.keterangan ?? '',
            semester: jadwal?.semester ? jadwal.semester : undefined,
            dosenId: jadwal?.dosenId ? Number(jadwal.dosenId) : undefined,
            fakultasId: jadwal?.fakultasId ? Number(jadwal.fakultasId) : undefined,
            jurusanId: jadwal?.jurusanId ? Number(jadwal.jurusanId) : undefined,
            kurikulumId: jadwal?.kurikulumId  ? Number(jadwal.kurikulumId) : undefined
        }
    });
    const storejadwal = useStoreJadwal()
    const updatejadwal = useUpdateJadwal()

    const onSubmit = async (values: jadwalFormValues) => {
        setIsSubmitting(true);
        try {
            if (jadwal?.id) {
                if (values.id) {
                    await (await updatejadwal).mutateAsync({ id: values.id, data: values });
                } else {
                    console.error("ID is undefined. Cannot update.");
                }
            } else {
                await (await storejadwal).mutateAsync(values);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                id: jadwal?.id ? Number(jadwal.id) : undefined,
                matakuliahId: jadwal?.matakuliahId ? Number(jadwal?.matakuliahId): undefined,
                sks: jadwal?.sks ? jadwal.sks : undefined,
                kelas: jadwal?.kelas ?? [],
                keterangan: jadwal?.keterangan ?? '',
                semester: jadwal?.semester ? jadwal.semester : undefined,
                dosenId: jadwal?.dosenId ? Number(jadwal.dosenId) : undefined,
                fakultasId: jadwal?.fakultasId ? Number(jadwal.fakultasId) : undefined,
                jurusanId: jadwal?.jurusanId ? Number(jadwal.jurusanId) : undefined,
                kurikulumId: jadwal?.kurikulumId  ? Number(jadwal.kurikulumId) : undefined
            });
        }
    }, [open, jadwal, form]);

    useEffect(() => {
        const subscription = form.watch((value) => {
            const sks = value.sks ? parseFloat(value.sks) : 0;
            const kelasCount = value.kelas ? value.kelas.length : 0;
            const isEditing = jadwal?.id ? parseFloat(jadwal.sks) * jadwal.kelas.length : 0;
            const totalSKS = (sks * kelasCount ) - isEditing;
            const currentTotalSKS = jadwal?.currentTotalSKS ? Number(jadwal.currentTotalSKS) : 0;
            const maxSks = jadwal?.maxSks ? Number(jadwal.maxSks) : 0;
            
            setIsMaximumReached((currentTotalSKS + totalSKS) > maxSks);
        });

        return () => subscription.unsubscribe();
    }, [form, jadwal]);

    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("jadwalModal")} size="lg">
                <BaseModal.Header>
                    <BaseModal.Title>{jadwal?.id ? 'Edit' : 'Tambah Jadwal'}</BaseModal.Title>
                    <BaseModal.Description>
                        Silakan {jadwal?.id ? 'ubah' : 'tambah'} data Jadwal di sini. Klik simpan setelah selesai.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    <JadwalForm
                        form={form}
                        onSubmit={onSubmit}
                    />
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("jadwalModal")} />
                    <Button
                        type='submit'
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting || isMaximumReached}
                    >
                        {isSubmitting ? 'Processing..' : jadwal?.id ? 'Simpan Perubahan' : 'Simpan'}
                    </Button>
                </BaseModal.Footer>
            </BaseModal>
        </>
    );
}