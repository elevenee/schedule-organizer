'use client';

import { UseFormReturn } from 'react-hook-form';
import { FakultasFormValues } from '@/features/fakultas/validations';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface Props {
    form: UseFormReturn<FakultasFormValues>;
    onSubmit: (values: FakultasFormValues) => Promise<void>;
    isSubmitting?: boolean;
}

export function FakultasForm({ form, onSubmit }: Props) {
    const {
        formState: { errors },
        reset,
        handleSubmit,
    } = form;

    return (
        <Form {...form}>
            <form id="form-fakultas" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Fakultas</FormLabel>
                            <FormControl>
                                <Input placeholder="Input nama fakultas" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}