'use client';

import { Button } from "@/components/ui/button";
import BaseModal from '@/components/ui/modal';
import { useGetFakultas } from '@/features/fakultas/service';
import { useModalManager } from '@/hooks/modal-manager';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStoreProgramStudi, useUpdateProgramStudi } from '../hooks/useProdi';
import { ProgramStudiFormValues, programStudiSchema } from '../validations';
import { ProgramStudiForm } from './create-form';

export function ProgramStudiModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("prodiModal");
    const program_studi = getData("prodiModal");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProgramStudiFormValues>({
        resolver: zodResolver(programStudiSchema),
        defaultValues: {
            id: program_studi?.id ? Number(program_studi.id): undefined,
            nama: program_studi?.nama ?? "",
            jenjang: program_studi?.jenjang ?? "",
            kode: program_studi?.kode ?? "",
            singkatan: program_studi?.singkatan ?? "",
            fakultas: program_studi?.fakultasId ? Number(program_studi.fakultasId): undefined,
        }
    });

    const store = useStoreProgramStudi();
    const update = useUpdateProgramStudi();

    useEffect(() => {
        if (open) {
            form.reset({
                id: program_studi?.id ?? undefined,
                nama: program_studi?.nama ?? "",
                jenjang: program_studi?.jenjang ?? "",
                kode: program_studi?.kode ?? "",
                singkatan: program_studi?.singkatan ?? "",
                fakultas: program_studi?.fakultasId ? Number(program_studi.fakultasId): undefined,
            })
        }
    }, [open, program_studi, form]);

    const onSubmit = async (values: ProgramStudiFormValues) => {
        setIsSubmitting(true);
        try {
            if (program_studi) {
                await (await update).mutateAsync({ id: values.id!, data: values });
            } else {
                const { id, ...data } = values;
                await (await store).mutateAsync({ ...data });
                form.reset({
                    id: undefined,
                    nama: '',
                    kode: '',
                    singkatan: '',
                    jenjang: '',
                    fakultas: undefined,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const { data: listFakultas } = useGetFakultas({
        page: 1,
        remove_pagination: true
    })
    

    return (
        <BaseModal open={open} onOpenChange={(v) => !v && close("prodiModal")} size="md">
            <BaseModal.Header>
                <BaseModal.Title>{program_studi ? 'Edit Program Studi' : 'Tambah Program Studi'}</BaseModal.Title>
                <BaseModal.Description>
                    Silakan {program_studi ? 'ubah' : 'tambah'} data Program Studi di sini. Klik simpan setelah selesai.
                </BaseModal.Description>
            </BaseModal.Header>

            <BaseModal.Body>
                <ProgramStudiForm
                    fakultas={listFakultas?.data ?? []}
                    form={form}
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                />
            </BaseModal.Body>

            <BaseModal.Footer>
                <BaseModal.CloseButton onClick={() => close("prodiModal")} />
                <Button
                    type='submit'
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Processing..' : program_studi ? 'Simpan Perubahan' : 'Simpan'}
                </Button>
            </BaseModal.Footer>
        </BaseModal>
    );
}
