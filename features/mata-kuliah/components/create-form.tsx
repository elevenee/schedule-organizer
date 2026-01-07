'use client';

import { Combobox } from '@/components/ui/combobox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGetKurikulumAktif } from '@/features/kurikulum/service';
import { Kurikulum } from '@/features/kurikulum/types';
import { mataKuliahFormValues } from '@/features/mata-kuliah/validations';
import { useGetProdi } from '@/features/program-studi/hooks/useProdi';
import { Jurusan } from '@prisma/client';
import { UseFormReturn } from 'react-hook-form';

interface Props {
    form: UseFormReturn<mataKuliahFormValues>;
    onSubmit: (values: mataKuliahFormValues) => Promise<void>;
    isSubmitting?: boolean;
}
export function MataKuliahForm({ form, onSubmit }: Props) {
    const {
        formState: { errors },
        reset,
        handleSubmit,
        setValue,
    } = form;

    const { data: listJurusan } = useGetProdi({
        page: 1,
        remove_pagination: true
    })
    const { data: listKurikulum, isLoading: isLoadingKurikulum } = useGetKurikulumAktif({
        page: 1,
        remove_pagination: true,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })
    return (
        <Form {...form}>
            <form id="form-mata-kuliah" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4">
                <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Nama Matakuliah</FormLabel>
                            <FormControl>
                                <Input placeholder="Input nama matakuliah" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="kode"
                    render={({ field }) => (
                        <FormItem className='col-span-12 md:col-span-6'>
                            <FormLabel required>Kode Matakuliah</FormLabel>
                            <FormControl>
                                <Input placeholder="Input kode matakuliah" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sks"
                    render={({ field }) => (
                        <FormItem className='col-span-12 md:col-span-6'>
                            <FormLabel required>Jumlah SKS</FormLabel>
                            <FormControl>
                                <Input placeholder="Input jumlah sks" type='number' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="kurikulumId"
                    render={({ field }) => (
                        <FormItem className='col-span-12 md:col-span-6'>
                            <FormLabel required>Kurikulum</FormLabel>
                            <FormControl>
                                <Combobox
                                    className='w-full'
                                    options={listKurikulum ? listKurikulum?.map((t: Kurikulum) => {
                                        return {
                                            label: t.nama,
                                            value: t.id.toString()
                                        }
                                    }) : []}
                                    isLoading={isLoadingKurikulum}
                                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                                    onChange={(value) => field.onChange(Number(value))}
                                    loadingMessage='Memuat data kurikulum'
                                    placeholder="Pilih Kurikulum"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                        <FormItem className='col-span-12 md:col-span-6'>
                            <FormLabel required>Semester</FormLabel>
                            <FormControl>
                                <Input placeholder="Input semester" type='number' {...field} max={8} min={1} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="jurusanId"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel>Jurusan</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={listJurusan && listJurusan.data?.map((t: Jurusan) => {
                                        return {
                                            label: t.nama,
                                            value: t.id.toString()
                                        }
                                    })}
                                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                                    onChange={(value) => field.onChange(Number(value))}
                                    placeholder="Pilih Jurusan"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}