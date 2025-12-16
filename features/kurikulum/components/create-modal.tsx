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
import { kurikulumFormValues, kurikulumSchema } from '../validations';
import { useStoreKurikulum, useUpdateKurikulum } from '../service';
import { KurikulumForm } from './create-form';
import { useModalManager } from '@/hooks/modal-manager';

export function KurikulumModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("kurikulumModal");
    const kurikulum = getData("kurikulumModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<kurikulumFormValues>({
        resolver: zodResolver(kurikulumSchema),
        defaultValues: {
            id: kurikulum?.id ?? undefined,
            nama: kurikulum?.name ?? '',
            status: kurikulum?.status as "ACTIVE" | "INACTIVE" ?? 'INACTIVE',
        }
    });
    const storeKurikulum = useStoreKurikulum()
    const updateKurikulum = useUpdateKurikulum()

    const onSubmit = async (values: kurikulumFormValues) => {
        setIsSubmitting(true);
        try {
            if (kurikulum) {
                if (values.id) {
                    await (await updateKurikulum).mutateAsync({ id: values.id, data: values });
                } else {
                    console.error("ID is undefined. Cannot update.");
                }
            } else {
                await (await storeKurikulum).mutateAsync(values);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                id: kurikulum?.id ?? undefined,
                nama: kurikulum?.name ?? '',
                status: kurikulum?.status as "ACTIVE" | "INACTIVE" ?? 'INACTIVE',
            });
        }
    }, [open, kurikulum, form]);

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !v && close("kurikulumModal")}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>{kurikulum ? 'Edit Kurikulum' : 'Tambah Kurikulum'}</DialogTitle>
                        <DialogDescription>
                            Silakan {kurikulum ? 'ubah' : 'tambah'} data Kurikulum di sini. Klik simpan setelah selesai.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[80vh] overflow-y-auto">
                        <KurikulumForm
                            form={form}
                            onSubmit={onSubmit}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={(v) => !v && close("kurikulumModal")}>
                                Close
                            </Button>
                        </DialogClose>
                        <Button
                            type='submit'
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing': (kurikulum ? 'Simpan Perubahan' : 'Simpan')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}