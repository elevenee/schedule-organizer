'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import { dosenFormValues, dosenSchema } from '../validations';
import { useStoreDosen, useUpdateDosen } from '../hooks/useDosen';
import { DosenForm } from './create-form';
import { useModalManager } from '@/hooks/modal-manager';
import BaseModal from '@/components/ui/modal';

export function DosenModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("dosenModal");
    const dosen = getData("dosenModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<dosenFormValues>({
        resolver: zodResolver(dosenSchema),
        defaultValues: {
            id: dosen?.id ? Number(dosen.id) : undefined,
            nama: dosen?.nama ?? '',
            nidn: dosen?.nidn ?? '',
            fakultasId: dosen?.fakultasId ? Number(dosen.fakultasId) : undefined,
            jurusanId: dosen?.jurusanId ? Number(dosen.jurusanId) : undefined,
            status: dosen?.status ?? undefined,
        }
    });
    const storedosen = useStoreDosen()
    const updatedosen = useUpdateDosen()

    const onSubmit = async (values: dosenFormValues) => {
        setIsSubmitting(true);
        try {
            if (dosen) {
                if (values.id) {
                    await (await updatedosen).mutateAsync({ id: values.id, data: values });
                } else {
                    console.error("ID is undefined. Cannot update.");
                }
            } else {
                await (await storedosen).mutateAsync(values);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                id: dosen?.id ? Number(dosen.id) : undefined,
                nama: dosen?.nama ?? '',
                nidn: dosen?.nidn ?? '',
                fakultasId: dosen?.fakultasId ? Number(dosen.fakultasId) : undefined,
                jurusanId: dosen?.jurusanId ? Number(dosen.jurusanId) : undefined,
                status: dosen?.status ?? undefined,
            });
        }
    }, [open, dosen, form]);

    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("dosenModal")} size="md">
                <BaseModal.Header>
                    <BaseModal.Title>{dosen ? 'Edit Dosen' : 'Tambah Dosen'}</BaseModal.Title>
                    <BaseModal.Description>
                        Silakan {dosen ? 'ubah' : 'tambah'} data Dosen di sini. Klik simpan setelah selesai.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    <DosenForm
                        form={form}
                        onSubmit={onSubmit}
                    />
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("dosenModal")} />
                    <Button
                        type='submit'
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing..' : dosen ? 'Simpan Perubahan' : 'Simpan'}
                    </Button>
                </BaseModal.Footer>
            </BaseModal>
        </>
    );
}