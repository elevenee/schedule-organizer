'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import { FakultasFormValues, fakultasSchema } from '../validations';
import { useStoreFakultas, useUpdateFakultas } from '../service';
import { FakultasForm } from './create-form';
import { useModalManager } from '@/hooks/modal-manager';
import BaseModal from '@/components/ui/modal';

export function FakultasModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("fakultasModal");
    const fakultas = getData("fakultasModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<FakultasFormValues>({
        resolver: zodResolver(fakultasSchema),
        defaultValues: {
            id: fakultas?.id ? Number(fakultas?.id) : undefined,
            nama: fakultas?.nama ?? "",
        }
    });
    const storeFakultas = useStoreFakultas()
    const updateFakultas = useUpdateFakultas()

    const onSubmit = async (values: FakultasFormValues) => {
        setIsSubmitting(true);
        try {
            if (fakultas) {
                if (values.id) {
                    await (await updateFakultas).mutateAsync({ id: values.id, data: values });
                } else {
                    console.error("ID is undefined. Cannot update download.");
                }
            } else {
                await (await storeFakultas).mutateAsync(values);
                form.reset({
                    id: undefined,
                    nama: '',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                id: fakultas?.id ? Number(fakultas?.id) : undefined,
                nama: fakultas?.name ?? "",
            });
        }
    }, [open, fakultas, form]);

    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("fakultasModal")} size="md">
                <BaseModal.Header>
                    <BaseModal.Title>{fakultas ? 'Edit Fakultas' : 'Tambah Fakultas'}</BaseModal.Title>
                    <BaseModal.Description>
                        Silakan {fakultas ? 'ubah' : 'tambah'} data Fakultas di sini. Klik simpan setelah selesai.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    <FakultasForm
                        form={form}
                        onSubmit={onSubmit}
                    />
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("fakultasModal")} />
                    <Button
                        type='submit'
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing..' : fakultas ? 'Simpan Perubahan' : 'Simpan'}
                    </Button>
                </BaseModal.Footer>
            </BaseModal>
        </>
    );
}