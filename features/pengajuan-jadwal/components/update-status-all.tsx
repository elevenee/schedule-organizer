'use client';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import BaseModal from '@/components/ui/modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useModalManager } from '@/hooks/modal-manager';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useUpdateStatusJadwalAll } from '../service';
import { statusJadwalFormValues, statusJadwalSchema } from '../validations';

export function StatusJadwalRequestAllModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("statusJadwalRequestAllModal");
    const jadwal = getData("statusJadwalRequestAllModal");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<statusJadwalFormValues>({
        resolver: zodResolver(statusJadwalSchema),
        defaultValues: {
            status: 'APPROVED',
            keteranganAdmin: '',
        }
    });
    const updatejadwal = useUpdateStatusJadwalAll()

    const onSubmit = async (values: statusJadwalFormValues) => {
        setIsSubmitting(true);
        try {
            if (jadwal?.ids) {
                await (await updatejadwal).mutateAsync({ ids: jadwal.ids, data: values });
            } else {
                toast.error("Status tidak dapat disimpan.");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
            close("statusJadwalRequestAllModal");
            // const queryClient = useQueryClient();
            // await queryClient.invalidateQueries({ queryKey: ["jadwal"] })
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
            <BaseModal open={open} onOpenChange={(v) => !v && close("statusJadwalRequestAllModal")} size="md">
                <BaseModal.Header>
                    <BaseModal.Title>
                        Update Status
                    </BaseModal.Title>
                    <BaseModal.Description>
                        Silakan update status Jadwal di sini. Klik simpan setelah selesai.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    {
                        jadwal && (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className='w-full'>
                                                <FormLabel>Status</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="APPROVED">Disetujui</SelectItem>
                                                            <SelectItem value="REJECTED">Ditolak</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {
                                        form.watch().status === 'REJECTED' && (
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
                                        )
                                    }
                                </form>
                            </Form>
                        )
                    }
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("statusJadwalRequestAllModal")} />
                    <Button
                        type='submit'
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing..' : (form.watch().status === 'APPROVED' ? 'Iya, Setujui' : 'Update Status')}
                    </Button>
                </BaseModal.Footer>
            </BaseModal>
        </>
    );
}