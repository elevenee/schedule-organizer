'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import { useUpdateStatusJadwal } from '../service';
import { useModalManager } from '@/hooks/modal-manager';
import BaseModal from '@/components/ui/modal';
import { statusJadwalFormValues, statusJadwalSchema } from '../validations';
import toast from 'react-hot-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

export function StatusJadwalRequestModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("statusJadwalRequestModal");
    const jadwal = getData("statusJadwalRequestModal");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<statusJadwalFormValues>({
        resolver: zodResolver(statusJadwalSchema),
        defaultValues: {
            status: jadwal?.status,
            keteranganAdmin: '',
        }
    });
    const updatejadwal = useUpdateStatusJadwal()

    const onSubmit = async (values: statusJadwalFormValues) => {
        setIsSubmitting(true);
        try {
            if (jadwal?.id) {
                await (await updatejadwal).mutateAsync({ id: jadwal.id, data: values });
            } else {
                toast.error("Status tidak dapat disimpan.");
            }
        } finally {
            setIsSubmitting(false);
            close("statusJadwalRequestModal");
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                status: jadwal?.status,
                keteranganAdmin: '',
            });
        }
    }, [open, jadwal, form]);

    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("statusJadwalRequestModal")} size="md">
                <BaseModal.Header>
                    <BaseModal.Title>
                        {jadwal && jadwal?.status !== 'APPROVED' ? 'Tolak Pengajuan Jadwal' : 'Setujui Pengajuan Jadwal'}
                    </BaseModal.Title>
                    <BaseModal.Description>
                        {jadwal && jadwal?.status !== 'APPROVED' ? 'Silakan update status Jadwal di sini. Klik simpan setelah selesai.' : 'Apakah anda yakin untuk menyetujui jadwal ini?'}
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    {
                        jadwal && jadwal?.status !== 'APPROVED' && (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="keteranganAdmin"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col col-span-12 md:col-span-6'>
                                                <FormLabel>Keterangan Penolakan</FormLabel>
                                                <FormControl>
                                                    <Textarea value={field.value ?? ""} onChange={field.onChange} placeholder='Input Keterangan'></Textarea>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>
                        )
                    }
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("statusJadwalRequestModal")} />
                    <Button
                        type='submit'
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing..' : jadwal?.id ? (jadwal?.status === 'APPROVED' ? 'Iya, Setujui' : 'Update Status') : 'Simpan'}
                    </Button>
                </BaseModal.Footer>
            </BaseModal>
        </>
    );
}