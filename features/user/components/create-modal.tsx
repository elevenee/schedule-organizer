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
import { userFormValues, userSchema } from '../validations';
import { useStoreUser, useUpdateUser } from '../service';
import { UserForm } from './create-form';
import { Role } from '@prisma/client';
import { useModalManager } from '@/hooks/modal-manager';

export function UserModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("userModal");
    const user = getData("userModal");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<userFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            id: user?.id ?? undefined,
            name: user?.name ?? '',
            email: user?.email ?? '',
            username: user?.username ?? '',
            password: null,
            role: (user?.role as Role) ?? null,
            status: user?.status as "ACTIVE" | "INACTIVE" ?? 'INACTIVE',
        }
    });
    const storeUser = useStoreUser()
    const updateUser = useUpdateUser()

    const onSubmit = async (values: userFormValues) => {
        setIsSubmitting(true);
        try {
            if (user) {
                if (values.id) {
                    await (await updateUser).mutateAsync({ id: values.id, data: values });
                } else {
                    console.error("ID is undefined. Cannot update.");
                }
            } else {
                await (await storeUser).mutateAsync(values);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (open) {
            form.reset({
                id: user?.id ?? undefined,
                name: user?.name ?? '',
                email: user?.email ?? '',
                username: user?.username ?? '',
                password: null,
                role: (user?.role as Role) ?? Role.ADMIN,
                status: user?.status as "ACTIVE" | "INACTIVE" ?? 'INACTIVE',
            });
        }
    }, [open, user, form]);

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !v && close("userModal")}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>{user ? 'Edit User' : 'Tambah User'}</DialogTitle>
                        <DialogDescription>
                            Silakan {user ? 'ubah' : 'tambah'} data User di sini. Klik simpan setelah selesai.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[80vh] overflow-y-auto">
                        <UserForm
                            form={form}
                            onSubmit={onSubmit}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={(v) => !v && close("userForm")}>
                                Close
                            </Button>
                        </DialogClose>
                        <Button
                            type='submit'
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            {user ? 'Simpan Perubahan' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}