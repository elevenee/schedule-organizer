'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Combobox } from '@/components/ui/combobox';
import { Jurusan } from '@prisma/client';
import { dosenFormValues } from '../validations';
import { useGetFakultas } from '@/features/fakultas/service';
import { useGetProdi } from '@/features/program-studi/hooks/useProdi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface Props {
    form: UseFormReturn<dosenFormValues>;
    onSubmit: (values: dosenFormValues) => Promise<void>;
    isSubmitting?: boolean;
}
export function DosenForm({ form, onSubmit }: Props) {
    const session = useSession();
    const {
        formState: { errors },
        handleSubmit,
    } = form;
    const [searchJurusan, setSearchJurusan] = useState<string>("");

    const JenisDosen = [
        { label: "TETAP", value: "TETAP" },
        { label: "TIDAK TETAP", value: "TIDAK_TETAP" },
    ];

    const { data: listFakultas, isLoading: isLoadingFakultas } = useGetFakultas({
        page: 1,
        remove_pagination: true,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })
    const { data: listJurusan, isLoading: isLoadingJurusan } = useGetProdi({
        page: 1,
        remove_pagination: true,
        fakultas: form.watch().fakultasId ?? 999999,
        search: searchJurusan,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })

    const JenisDosenOptions = JenisDosen.map((jenis) => {
        if (session.data?.user?.role === 'FAKULTAS' && jenis.value === 'TIDAK_TETAP') {
            return { label: jenis.label, value: jenis.value };
        }else{
            return { label: jenis.label, value: jenis.value };
        }
    });
    
    return (
        <Form {...form}>
            <form id="form-dosen" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4 mb-4">
                <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Nama Dosen</FormLabel>
                            <FormControl>
                                <Input placeholder="Input nama dosen" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nidn"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel>NIDN</FormLabel>
                            <FormControl>
                                <Input placeholder="Input NIDN" value={field.value ?? ""} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fakultasId"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel>Fakultas</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={listFakultas?.data ? listFakultas?.data?.map((t: Jurusan) => {
                                        return {
                                            label: t.nama,
                                            value: t.id.toString()
                                        }
                                    }) : []}
                                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                                    onChange={(value) => field.onChange(Number(value))}
                                    placeholder={isLoadingFakultas ? "Memuat fakultas..." : "Pilih Fakultas"}
                                />
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
                                    data={listJurusan && listJurusan?.data ? listJurusan?.data.map((t: Jurusan) => {
                                        return {
                                            label: t.nama,
                                            value: t.id.toString()
                                        }
                                    }) : []}
                                    isLoading={isLoadingJurusan}
                                    onSearch={setSearchJurusan}
                                    showSearch={true}
                                    emptyMessage="Jurusan tidak ditemukan"
                                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                                    onChange={(value) => field.onChange(Number(value))}
                                    placeholder={isLoadingJurusan ? "Memuat jurusan..." : "Pilih Jurusan"}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem className='grid grid-cols-1 col-span-12'>
                            <FormLabel required>Status</FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={(value) => field.onChange(value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JenisDosenOptions.map((jenis) => (
                                            <SelectItem key={jenis?.value} value={jenis?.value!}>{jenis?.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}