'use client';

import { useState } from 'react';
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
import { useModalManager } from '@/hooks/modal-manager';
import { ImportUserFormValues, importUserScheme } from '../validations';
import { toast } from 'sonner';

export function ImportUserModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("importUserModal");
    const user = getData("importUserModal");

    const form = useForm<ImportUserFormValues>({
        resolver: zodResolver(importUserScheme),
        defaultValues: {
            file: null,
        }
    });

    const [isSubmitting, setIsSubmiting] = useState(false);
    const handleImport = async (values: any) => {
        const file = values.file;
        if (!file) return;

        setIsSubmiting(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/user/import", {
                method: "POST",
                body: file,
            });

            const result = await res.json();
            toast(`${result.message}: ${result.count} baris`);
        } catch (err) {
            console.error(err);
            toast("Gagal import data");
        } finally {
            setIsSubmiting(false);
        }
    };
    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !v && close("importUserModal")}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>{user ? 'Edit User' : 'Tambah User'}</DialogTitle>
                        <DialogDescription>
                            Silakan {user ? 'ubah' : 'tambah'} data User di sini. Klik simpan setelah selesai.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[80vh] overflow-y-auto">
                        <form onSubmit={form.handleSubmit(handleImport)}>
                            <div
                                {...form.register('file')}
                                className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${form.formState.errors.file ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                onDragOver={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onDrop={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const file = e.dataTransfer.files[0];
                                    form.setValue('file', file, { shouldValidate: true });
                                }}
                                onClick={() => {
                                    document.getElementById('file-input')?.click();
                                }}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const file = e.target.files?.[0] || null;
                                        form.setValue('file', file, { shouldValidate: true });
                                    }}
                                />
                                <span className="text-gray-500">
                                    Drag and drop file here, or <span className="text-blue-500 underline cursor-pointer">browse</span>
                                </span>
                                {form.watch('file') && (
                                    <span className="mt-2 text-sm text-green-600">
                                        {form.watch('file')?.name}
                                    </span>
                                )}
                            </div>
                            {form.formState.errors.file && (
                                <p className="text-red-500 text-xs mt-1">
                                    {form.formState.errors.file.message as string}
                                </p>
                            )}
                        </form>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={(v) => !v && close("userForm")}>
                                Close
                            </Button>
                        </DialogClose>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            onClick={form.handleSubmit(handleImport)}
                        >
                            Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}