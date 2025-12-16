'use client';

import { UseFormReturn } from 'react-hook-form';
import { kurikulumFormValues } from '@/features/kurikulum/validations';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Combobox } from '@/components/ui/combobox';

interface Props {
    form: UseFormReturn<kurikulumFormValues>;
    onSubmit: (values: kurikulumFormValues) => Promise<void>;
    isSubmitting?: boolean;
}
export function KurikulumForm({ form, onSubmit }: Props) {
    const {
        formState: { errors },
        reset,
        handleSubmit,
        setValue,
    } = form;

    return (
        <Form {...form}>
            <form id="form-kurikulum" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4">
                <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Nama Kurikulum</FormLabel>
                            <FormControl>
                                <Input placeholder="Input nama kurikulum" {...field} />
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