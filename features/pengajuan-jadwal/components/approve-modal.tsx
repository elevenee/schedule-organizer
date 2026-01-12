'use client';

import { Button } from "@/components/ui/button";
import BaseModal from '@/components/ui/modal';
import { useModalManager } from '@/hooks/modal-manager';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useApproveJadwalRequest } from "../service";
import { jadwalFormValues, jadwalSchema } from '../validations';
import { JadwalForm } from './create-form';

export function ApproveJadwalRequestModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("approveJadwalRequestModal");
    const jadwal = getData("approveJadwalRequestModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMaximumReached, setIsMaximumReached] = useState(false);

    const session = useSession();
    const userFakultas = session.data?.user?.fakultasId;

    const form = useForm<jadwalFormValues>({
        resolver: zodResolver(jadwalSchema),
        defaultValues: {
            id: jadwal?.id ? Number(jadwal.id) : undefined,
            matakuliahId: jadwal?.matakuliahId ?? '',
            sks: jadwal?.sks ? jadwal.sks : undefined,
            kelas: jadwal?.kelas ?? [],
            keterangan: jadwal?.keterangan ?? '',
            semester: jadwal?.semester ? jadwal.semester : undefined,
            dosenId: jadwal?.dosenId ? Number(jadwal.dosenId) : undefined,
            fakultasId: jadwal?.fakultasId ? Number(jadwal.fakultasId) : Number(userFakultas),
            jurusanId: jadwal?.jurusanId ? Number(jadwal.jurusanId) : undefined,
            kurikulumId: jadwal?.kurikulumId  ? Number(jadwal.kurikulumId) : undefined
        }
    });

    const approveJadwal = useApproveJadwalRequest();

    const onSubmit = async (values: jadwalFormValues) => {
        setIsSubmitting(true);
        try {
            if (jadwal?.id) {
                if (values.id) {
                    await (await approveJadwal).mutateAsync({ id: values.id, data: values });
                } else {
                    console.error("ID is undefined. Cannot update.");
                }
            }
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
                fakultasId: jadwal?.fakultasId ? Number(jadwal.fakultasId) : Number(userFakultas),
                jurusanId: jadwal?.jurusanId ? Number(jadwal.jurusanId) : undefined,
                kurikulumId: jadwal?.kurikulumId  ? Number(jadwal.kurikulumId) : undefined
            });
        }
    }, [open, jadwal, form]);

    useEffect(() => {
        const subscription = form.watch((value) => {
            if (jadwal?.currentTotalSKS) {
                const sks = value.sks ? Number(value.sks) : 0;
                const kelasCount = value.kelas ? value.kelas.length : 0;
                const totalSKS = sks * kelasCount;
                const currentTotalSKS = jadwal?.currentTotalSKS ? Number(jadwal.currentTotalSKS) : 0;
                const maxSks = jadwal?.maxSks ? Number(jadwal.maxSks) : 0;
                setIsMaximumReached((currentTotalSKS + totalSKS) > maxSks);
            }

        });

        return () => subscription.unsubscribe();
    }, [form, jadwal]);

    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("approveJadwalRequestModal")} size="lg">
                <BaseModal.Header>
                    <BaseModal.Title>{jadwal?.id ? 'Edit Jadwal' : 'Tambah Jadwal'}</BaseModal.Title>
                    <BaseModal.Description>
                        Silakan {jadwal?.id ? 'ubah' : 'tambah'} data Jadwal di sini. Klik simpan setelah selesai.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    <JadwalForm
                        form={form}
                        onSubmit={onSubmit}
                        jenisDosen={jadwal?.jenisDosen}
                    />
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("approveJadwalRequestModal")} />
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