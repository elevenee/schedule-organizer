'use client';

import { Combobox } from '@/components/ui/combobox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGetFakultas } from '@/features/fakultas/service';
import { userFormValues } from '@/features/user/validations';
import { Role } from '@prisma/client';
import { UseFormReturn } from 'react-hook-form';

interface Props {
    form: UseFormReturn<userFormValues>;
    onSubmit: (values: userFormValues) => Promise<void>;
    isSubmitting?: boolean;
}
export function UserForm({ form, onSubmit }: Props) {
    const {
        formState: { errors },
        reset,
        handleSubmit,
        setValue,
    } = form;

    const roles = [
        { label: Role.FAKULTAS, value: Role.FAKULTAS },
        { label: Role.PRODI, value: Role.PRODI },
    ];

    const { data: fakultasData } = useGetFakultas({
        page: 1,
        remove_pagination: true,
    });
    return (
        <Form {...form}>
            <form id="form-user" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Input name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="Input username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required={form.watch().id ? false : true}>Password</FormLabel>
                            <FormControl>
                                <Input type='password' placeholder="Input password" value={field?.value ?? ''} onChange={field.onChange} />
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
                            <FormLabel required>Status User</FormLabel>
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
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Role</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={roles}
                                    value={field.value}
                                    onChange={(val) => setValue('role', val as Role)}
                                    placeholder="Pilih Role"
                                />
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
                                    options={fakultasData?.data?.map((item:any) => ({ label: item.nama, value: String(item.id) })) || []}
                                    value={field.value ? field.value.toString() : ''}
                                    onChange={(val) => setValue('fakultasId', val)}
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