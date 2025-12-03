'use client';

import { UseFormReturn } from 'react-hook-form';
import { pengaturanJadwalFormValues } from '@/features/pengaturan/jadwal/validations';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    form: UseFormReturn<pengaturanJadwalFormValues>;
    onSubmit: (values: pengaturanJadwalFormValues) => Promise<void>;
    isSubmitting?: boolean;
}
export function PengaturanJadwalForm({ form, onSubmit }: Props) {
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
                    name="jenisDosen"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Jenis Dosen</FormLabel>
                            <FormControl>
                                <Select value={field.value ? field.value.toString() : ""} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-auto">
                                        <SelectValue placeholder="Jenis Dosen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TETAP">TETAP</SelectItem>
                                        <SelectItem value="TIDAK_TETAP">TIDAK TETAP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="minSks"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Minimum SKS</FormLabel>
                            <FormControl>
                                <Input placeholder="Input Minimum SKS" value={field.value ? field.value.toString():""} onChange={field.onChange} min={2} max={24} type='number'/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="maxSks"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Maximum SKS</FormLabel>
                            <FormControl>
                                <Input placeholder="Input Maximum SKS" value={field.value ? field.value.toString():""} onChange={field.onChange} min={2} max={24} type='number'/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}