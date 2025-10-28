'use client';

import { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { useDeleteTahunAkademik } from '@/features/tahun_akademik/service';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type Props = {
    id: number;
    custom_text?: string
};

export function DeleteJadwal({ id, custom_text = "Hapus" }: Props) {
    const [openModal, setOpenModal] = useState(false);
    const queryClient = new QueryClient()
    const deleteTahunAkademikMutation = useDeleteTahunAkademik(id)
    const handleDelete = async () => {
        (await deleteTahunAkademikMutation).mutate();
        setOpenModal(false)
        await queryClient.invalidateQueries({ queryKey: ['tahun-akademik'] });
    };
    return (
        <>
            <AlertDialog>
                <AlertDialogTrigger asChild className='flex gap-2'><Button variant={'destructive'}><Trash2 /> <span className="hidden md:block">{custom_text}</span></Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tahun Akademik ini akan dihapus
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