'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import { sisaSksFormValues, SisaSksSchema } from '../validations';
import { useStoreSisaSks, useUpdateSisaSks } from '../service';
import { SisaJadwalForm } from './create-form';
import { useModalManager } from '@/hooks/modal-manager';
import BaseModal from '@/components/ui/modal';

export function SisaSksModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("sisaSksModal");
    const jadwal = getData("sisaSksModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMaximumReached, setIsMaximumReached] = useState(false);

    const form = useForm<sisaSksFormValues>({
        resolver: zodResolver(SisaSksSchema),
        defaultValues: {
            id: jadwal?.id ? Number(jadwal.id) : undefined,
            matakuliahId: jadwal?.matakuliahId ?? '',
            sks: jadwal?.sks ? jadwal.sks : undefined,
            kelas: jadwal?.kelas ?? [],
            keterangan: jadwal?.keterangan ?? '',
            semester: jadwal?.semester ? jadwal.semester : undefined,
            dosenId: jadwal?.dosenId ? Number(jadwal.dosenId) : undefined,
            fakultasId: jadwal?.fakultasId ? Number(jadwal.fakultasId) : undefined,
            jurusanId: jadwal?.jurusanId ? Number(jadwal.jurusanId) : undefined,
        }
    });
    const storejadwal = useStoreSisaSks()

    const onSubmit = async (values: sisaSksFormValues) => {
        setIsSubmitting(true);
        try {
            await (await storejadwal).mutateAsync(values);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                id: jadwal?.id ? Number(jadwal.id) : undefined,
                matakuliahId: jadwal?.matakuliahId ?? '',
                sks: jadwal?.sks ? jadwal.sks : undefined,
                kelas: jadwal?.kelas ?? [],
                keterangan: jadwal?.keterangan ?? '',
                semester: jadwal?.semester ? jadwal.semester : undefined,
                dosenId: jadwal?.dosenId ? Number(jadwal.dosenId) : undefined,
                fakultasId: jadwal?.fakultasId ? Number(jadwal.fakultasId) : undefined,
                jurusanId: jadwal?.jurusanId ? Number(jadwal.jurusanId) : undefined,
            });
        }
    }, [open, jadwal, form]);


    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("sisaSksModal")} size="lg">
                <BaseModal.Header>
                    <BaseModal.Title>{jadwal ? 'Edit Jadwal' : 'Tambah Jadwal'}</BaseModal.Title>
                    <BaseModal.Description>
                        Silakan {jadwal ? 'ubah' : 'tambah'} data Jadwal di sini. Klik simpan setelah selesai.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    <SisaJadwalForm
                        form={form}
                        onSubmit={onSubmit}
                    />
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("sisaSksModal")} />
                    <Button
                        type='submit'
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting || isMaximumReached}
                    >
                        {isSubmitting ? 'Processing..' : 'Simpan'}
                    </Button>
                </BaseModal.Footer>
            </BaseModal>
        </>
    );
}