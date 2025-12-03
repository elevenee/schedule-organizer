'use client';

import { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { useDeleteJadwal } from '@/features/jadwal/service';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type Props = {
    id: number;
    custom_text?: string
};

export function DeleteJadwal({ id }: Props) {
    const queryClient = new QueryClient()
    const deleteJadwalMutation = useDeleteJadwal(id)
    const handleDelete = async () => {
        (await deleteJadwalMutation).mutate();
        await queryClient.invalidateQueries({ queryKey: ['jadwal'] });
    };
    return (
        <>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant={'outline'}><Trash2 className='text-rose-500 h-4 w-4'/></Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Jadwal ini akan dihapus
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