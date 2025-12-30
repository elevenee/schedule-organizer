'use client';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useModalManager } from '@/hooks/modal-manager';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStoreTahunAkademik, useUpdateTahunAkademik } from '../service';
import { tahunAkademikFormValues, tahunAkademikSchema } from '../validations';
import { TahunAkademikForm } from './create-form';

export function TahunAkademikModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("tahunModal");
    const tahunAkademik = getData("tahunModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<tahunAkademikFormValues>({
        resolver: zodResolver(tahunAkademikSchema),
        defaultValues: {
            id: tahunAkademik?.id ?? undefined,
            name: tahunAkademik?.name ?? '',
            status: tahunAkademik?.status as "ACTIVE" | "INACTIVE" ?? 'INACTIVE',
            semester: tahunAkademik?.semester as 'GANJIL' | 'GENAP' ?? "GANJIL",
        }
    });
    const storeTahunAkademik = useStoreTahunAkademik()
    const updateTahunAkademik = useUpdateTahunAkademik()
    
    const onSubmit = async (values: tahunAkademikFormValues) => {
        setIsSubmitting(true);
        try {
            if (tahunAkademik) {
                if (values.id) {
                    await (await updateTahunAkademik).mutateAsync({ id: values.id, data: values });
                } else {
                    console.error("ID is undefined. Cannot update.");
                }
            } else {
                await (await storeTahunAkademik).mutateAsync(values);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                id: tahunAkademik?.id ?? undefined,
                name: tahunAkademik?.name ?? '',
                status: tahunAkademik?.status as "ACTIVE" | "INACTIVE" ?? 'INACTIVE',
                semester: tahunAkademik?.semester as 'GANJIL' | 'GENAP' ?? "GANJIL",
            });
        }
    }, [open, tahunAkademik, form]);

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !v && close("tahunModal")}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>{tahunAkademik ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik'}</DialogTitle>
                        <DialogDescription>
                            Silakan {tahunAkademik ? 'ubah' : 'tambah'} data Tahun Akademik di sini. Klik simpan setelah selesai.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[80vh] overflow-y-auto">
                        <TahunAkademikForm
                            form={form}
                            onSubmit={onSubmit}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={(v) => !v && close("tahunModal")}>
                                Close
                            </Button>
                        </DialogClose>
                        <Button
                            type='submit'
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing': (tahunAkademik ? 'Simpan Perubahan' : 'Simpan')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}