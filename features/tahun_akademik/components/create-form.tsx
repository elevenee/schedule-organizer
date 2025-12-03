'use client';

import { UseFormReturn } from 'react-hook-form';
import { tahunAkademikFormValues } from '@/features/tahun_akademik/validations';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Combobox } from '@/components/ui/combobox';

interface Props {
    form: UseFormReturn<tahunAkademikFormValues>;
    onSubmit: (values: tahunAkademikFormValues) => Promise<void>;
    isSubmitting?: boolean;
}
export function TahunAkademikForm({ form, onSubmit }: Props) {
    const {
        formState: { errors },
        reset,
        handleSubmit,
        setValue,
    } = form;

    return (
        <Form {...form}>
            <form id="form-tahun-akademik" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Tahun Akademik</FormLabel>
                            <FormControl>
                                <Input placeholder="Input tahun akademik" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Semester</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={[{ value: "GANJIL", label: "GANJIL" }, { value: "GENAP", label: "GENAP" }]}
                                    value={field.value}
                                    onChange={(val) => setValue('semester', val as "GANJIL" | "GENAP")}
                                    placeholder="Pilih Semester"
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
                        <FormItem className='col-span-12'>
                            <FormLabel required>Status</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={[{ value: "ACTIVE", label: "ACTIVE" }, { value: "INACTIVE", label: "INACTIVE" }]}
                                    value={field.value}
                                    onChange={(val) => setValue('status', val as "ACTIVE" | "INACTIVE")}
                                    placeholder="Pilih Status"
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