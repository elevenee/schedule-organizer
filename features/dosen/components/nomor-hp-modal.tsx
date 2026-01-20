'use client';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import BaseModal from '@/components/ui/modal';
import { useModalManager } from '@/hooks/modal-manager';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateNoHpDosen } from "../hooks/useDosen";
import { phoneSchema, PhoneValues } from '../validations';

export function DosenNoHPModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("dosenHpModal");
    const dosen = getData("dosenHpModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<PhoneValues>({
        resolver: zodResolver(phoneSchema),
        defaultValues: {
            id: dosen?.id ? Number(dosen.id) : undefined,
            no_hp: dosen?.no_hp ?? '',
        }
    });
    const updateHp = useUpdateNoHpDosen()

    const onSubmit = async (values: PhoneValues) => {
        setIsSubmitting(true);
        
        try {
            if (dosen) {
                if (values.id) {
                    await (await updateHp).mutateAsync({ id: values.id, data: values });
                } else {
                    console.error("ID is undefined. Cannot update.");
                }
            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                id: dosen?.id ? Number(dosen.id) : undefined,
                no_hp: dosen?.no_hp ?? '',
            });
        }
    }, [open, dosen, form]);

    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("dosenHpModal")} size="md">
                <BaseModal.Header>
                    <BaseModal.Title>{dosen ? 'Edit No Hp Dosen' : 'Tambah No Hp Dosen'}</BaseModal.Title>
                    <BaseModal.Description>
                        Silakan {dosen ? 'ubah' : 'tambah'} data Dosen di sini. Klik simpan setelah selesai.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    <Form {...form}>
                        <form id="form-dosen" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4 mb-4">
                            <FormField
                                control={form.control}
                                name="no_hp"
                                render={({ field }) => (
                                    <FormItem className='col-span-12'>
                                        <FormLabel required>No. Hp</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Input nama nomor hp" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("dosenHpModal")} />
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