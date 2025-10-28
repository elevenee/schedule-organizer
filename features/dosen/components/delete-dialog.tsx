'use client';

import { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { useDeleteDosen } from '@/features/dosen/service';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type Props = {
    id: number;
    custom_text?: string
};

export function DeleteDosen({ id, custom_text = "Hapus" }: Props) {
    const [openModal, setOpenModal] = useState(false);
    const queryClient = new QueryClient()
    const deleteDosenMutation = useDeleteDosen(id)
    const handleDelete = async () => {
        (await deleteDosenMutation).mutate();
        setOpenModal(false)
        await queryClient.invalidateQueries({ queryKey: ['dosen'] });
    };
    return (
        <>
            <AlertDialog>
                <AlertDialogTrigger asChild className='flex gap-2'><Button variant={'destructive'}><Trash2 /> <span className="hidden md:block">{custom_text}</span></Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Dosen ini akan dihapus
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