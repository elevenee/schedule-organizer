'use client';

import { UseFormReturn } from 'react-hook-form';
import { ProgramStudiFormValues } from '@/features/program-studi/validations';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { useMemo } from 'react';

interface Props {
    form: UseFormReturn<ProgramStudiFormValues>;
    onSubmit: (values: ProgramStudiFormValues) => Promise<void>;
    isSubmitting?: boolean;
    fakultas?: any[];
}

export function ProgramStudiForm({ form, onSubmit, fakultas }: Props) {
    const {
        handleSubmit,
    } = form;

    const fakultasOptions = useMemo(() =>
        fakultas?.map((item) => ({
            label: item.nama,
            value: item.id.toString(),
        })) || [],
        [fakultas]
    );    

    return (
        <Form {...form}>
            <form id="form-prodi" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-2">
                <FormField
                    control={form.control}
                    name="kode"
                    render={({ field }) => (
                        <FormItem className='flex flex-col col-span-12 md:col-span-12'>
                            <FormLabel>Kode Program Studi</FormLabel>
                            <FormControl>
                                <Input placeholder="Input kode" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="singkatan"
                    render={({ field }) => (
                        <FormItem className='flex flex-col col-span-12 md:col-span-12'>
                            <FormLabel>Singkatan</FormLabel>
                            <FormControl>
                                <Input placeholder="Input singkatan" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel>Nama Program Studi</FormLabel>
                            <FormControl>
                                <Input placeholder="Input nama program studi" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="jenjang"
                    render={({ field }) => (
                        <FormItem className="col-span-12">
                            <FormLabel>Jenjang</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih Jenjang" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="S1">S1</SelectItem>
                                        <SelectItem value="S2">S2</SelectItem>
                                        <SelectItem value="S3">S3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fakultas"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel>Fakultas</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={fakultasOptions}
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
