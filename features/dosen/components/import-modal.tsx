'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import { ImportDosenValues, importDosenScheme } from '../validations';
import { useModalManager } from '@/hooks/modal-manager';
import BaseModal from '@/components/ui/modal';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function ImportDosenModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("importDosenModal");
    const dosen = getData("importDosenModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<ImportDosenValues>({
        resolver: zodResolver(importDosenScheme),
        defaultValues: {
            file: undefined
        }
    });

    const onSubmit = async (values: ImportDosenValues) => {
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('file', values.file);

        try {
            const response = await fetch('/api/dosen/import', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert('Import berhasil!');
            } else {
                alert(`Import gagal: ${data.error}`);
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Terjadi kesalahan jaringan');
        } finally {
            setIsSubmitting(false)
            close('importDosenModal');
        }
    };

    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("importDosenModal")} size="md">
                <BaseModal.Header>
                    <BaseModal.Title>Import Data Dosen</BaseModal.Title>
                    <BaseModal.Description>
                        Silakan pilih file untuk diimport.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    <Form {...form}>
                        <form id="form-payment" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="file"
                                render={({ field: { onChange, onBlur, name, ref } }) => (
                                    <FormItem>
                                        <FormLabel required>File</FormLabel>
                                        <FormDescription>Max. Size 5MB, Ext: JPG, PNG</FormDescription>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                name={name}
                                                onBlur={onBlur}
                                                ref={ref}
                                                multiple={false}
                                                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                onChange={(e) => {
                                                    const file = e.target.files;
                                                    onChange(file ? file[0] : null);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("importDosenModal")} />
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