'use client';

import { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { useDeleteUser } from '@/features/user/service';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type Props = {
    id: number;
    onDeleted?: () => void;
};

export function DeleteUserAkademik({ id, onDeleted }: Props) {
    const [openModal, setOpenModal] = useState(false);
    const queryClient = new QueryClient()
    const deleteTahunAkademikMutation = useDeleteUser()
    const handleDelete = async () => {
        (await deleteTahunAkademikMutation).mutate(id);
        setOpenModal(false)
        await queryClient.invalidateQueries({ queryKey: ['user'] });
    };
    return (
        <>
            <AlertDialog>
                <AlertDialogTrigger asChild className='flex gap-2'><Button variant={'destructive'}><Trash2 /> <span className="hidden md:block">Hapus</span></Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            User ini akan dihapus
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}