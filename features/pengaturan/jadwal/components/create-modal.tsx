'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { pengaturanJadwalFormValues, pengaturanJadwalSchema } from '../validations';
import { useStorePengaturanJadwal, useUpdatePengaturanJadwal } from '../service';
import { PengaturanJadwalForm } from './create-form';
import { useModalManager } from '@/hooks/modal-manager';
import BaseModal from '@/components/ui/modal';

export function PengaturanJadwalModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("pengaturanJadwalModal");
    const pengaturanJadwal = getData("pengaturanJadwalModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<pengaturanJadwalFormValues>({
        resolver: zodResolver(pengaturanJadwalSchema),
        defaultValues: {
            id: pengaturanJadwal?.id ? Number(pengaturanJadwal.id) : undefined,
            jenisDosen: pengaturanJadwal?.jenisDosen ?? '',
            minSks: pengaturanJadwal?.minSks ? pengaturanJadwal.minSks : undefined,
            maxSks: pengaturanJadwal?.maxSks ? pengaturanJadwal.maxSks : undefined,
        }
    });
    const storePengaturanJadwal = useStorePengaturanJadwal()
    const updatePengaturanJadwal = useUpdatePengaturanJadwal()

    const onSubmit = async (values: pengaturanJadwalFormValues) => {
        setIsSubmitting(true);
        try {
            if (pengaturanJadwal) {
                if (values.id) {
                    await (await updatePengaturanJadwal).mutateAsync({ id: values.id, data: values });
                } else {
                    console.error("ID is undefined. Cannot update.");
                }
            } else {
                await (await storePengaturanJadwal).mutateAsync(values);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                id: pengaturanJadwal?.id ? Number(pengaturanJadwal.id) : undefined,
                jenisDosen: pengaturanJadwal?.jenisDosen ?? '',
                minSks: pengaturanJadwal?.minSks ? pengaturanJadwal.minSks : undefined,
                maxSks: pengaturanJadwal?.maxSks ? pengaturanJadwal.maxSks : undefined,
            });
        }
    }, [open, pengaturanJadwal, form]);
    
    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("pengaturanJadwalModal")} size="sm">
                <BaseModal.Header>
                    <BaseModal.Title>{pengaturanJadwal ? 'Edit Pengaturan Jadwal' : 'Tambah Pengaturan Jadwal'}</BaseModal.Title>
                    <BaseModal.Description>
                        Silakan {pengaturanJadwal ? 'ubah' : 'tambah'} data Pengaturan Jadwal di sini. Klik simpan setelah selesai.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    <PengaturanJadwalForm
                            form={form}
                            onSubmit={onSubmit}
                        />
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("pengaturanJadwalModal")} />
                    <Button
                        type='submit'
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing..' : pengaturanJadwal ? 'Simpan Perubahan' : 'Simpan'}
                    </Button>
                </BaseModal.Footer>
            </BaseModal>
        </>
    );
}