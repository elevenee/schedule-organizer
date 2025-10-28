'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Combobox } from '@/components/ui/combobox';
import { Jurusan } from '@prisma/client';
import { dosenFormValues } from '../validations';
import { useGetFakultas } from '@/features/fakultas/service';

interface Props {
    form: UseFormReturn<dosenFormValues>;
    onSubmit: (values: dosenFormValues) => Promise<void>;
    isSubmitting?: boolean;
}
export function DosenForm({ form, onSubmit }: Props) {
    const {
        formState: { errors },
        reset,
        handleSubmit,
        setValue,
    } = form;

    const {data: listFakultas} = useGetFakultas({
        page: 1,
        remove_pagination: true,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })
    
    return (
        <Form {...form}>
            <form id="form-dosen" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4">
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
                        <FormItem className='col-span-12 md:col-span-6'>
                            <FormLabel required>NIDN</FormLabel>
                            <FormControl>
                                <Input placeholder="Input NIDN" value={field.value ?? ""} onChange={field.onChange}/>
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
                                    }):[]}
                                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                                    onChange={(value) => field.onChange(Number(value))}
                                    placeholder="Pilih Fakultas"
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