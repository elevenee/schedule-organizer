'use client';

import { Button } from "@/components/ui/button";
import BaseModal from '@/components/ui/modal';
import { useModalManager } from '@/hooks/modal-manager';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStoreMataKuliah, useUpdateMataKuliah } from '../hooks/matkul.hook';
import { mataKuliahFormValues, mataKuliahSchema } from '../validations';
import { MataKuliahForm } from './create-form';

export function MataKuliahModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("mataKuliahModal");
    const mataKuliah = getData("mataKuliahModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<mataKuliahFormValues>({
        resolver: zodResolver(mataKuliahSchema),
        defaultValues: {
            id: mataKuliah?.id ? Number(mataKuliah.id) : undefined,
            nama: mataKuliah?.nama ?? '',
            kode: mataKuliah?.kode ?? '',
            sks: mataKuliah?.sks?.toString() ?? undefined,
            semester: mataKuliah?.semester?.toString() ?? undefined,
            jurusanId: mataKuliah?.jurusanId ? Number(mataKuliah.jurusanId) : undefined,
            kurikulumId: mataKuliah?.kurikulumId ? Number(mataKuliah.kurikulumId) : undefined,
        }
    });
    const storeMatakuliah = useStoreMataKuliah()
    const updateMataKuliah = useUpdateMataKuliah()

    const onSubmit = async (values: mataKuliahFormValues) => {
        setIsSubmitting(true);
        try {
            if (mataKuliah) {
                if (values.id) {
                    await (await updateMataKuliah).mutateAsync({ id: values.id, data: values });
                } else {
                    console.error("ID is undefined. Cannot update.");
                }
            } else {
                await (await storeMatakuliah).mutateAsync(values);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                id: mataKuliah?.id ? Number(mataKuliah.id) : undefined,
                nama: mataKuliah?.nama ?? '',
                kode: mataKuliah?.kode ?? '',
                sks: mataKuliah?.sks?.toString() ?? undefined,
                semester: mataKuliah?.semester?.toString() ?? undefined,
                jurusanId: mataKuliah?.jurusanId ? Number(mataKuliah.jurusanId) : undefined,
                kurikulumId: mataKuliah?.kurikulumId ? Number(mataKuliah.kurikulumId) : undefined,
            });
        }
    }, [open, mataKuliah, form]);

    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("mataKuliahModal")} size="md">
                <BaseModal.Header>
                    <BaseModal.Title>{mataKuliah ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</BaseModal.Title>
                    <BaseModal.Description>
                        Silakan {mataKuliah ? 'ubah' : 'tambah'} data Mata Kuliah di sini. Klik simpan setelah selesai.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    <MataKuliahForm
                        form={form}
                        onSubmit={onSubmit}
                    />
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("mataKuliahModal")} />
                    <Button
                        type='submit'
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing..' : mataKuliah ? 'Simpan Perubahan' : 'Simpan'}
                    </Button>
                </BaseModal.Footer>
            </BaseModal>
        </>
    );
}