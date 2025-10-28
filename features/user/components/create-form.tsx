'use client';

import { UseFormReturn } from 'react-hook-form';
import { userFormValues } from '@/features/user/validations';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Combobox } from '@/components/ui/combobox';
import { Role } from '@prisma/client';

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
        { label: Role.ADMIN, value: Role.ADMIN },
        { label: Role.AKADEMIK, value: Role.AKADEMIK },
        { label: Role.KEUANGAN, value: Role.KEUANGAN },
        { label: Role.VERIFIKATOR, value: Role.VERIFIKATOR },
        { label: Role.PENDAFTAR, value: Role.PENDAFTAR },
    ];
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
                    name="email"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Input email" value={field?.value ?? ''} onChange={field.onChange} />
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
                                    onChange={(val) => setValue('status', val as Role)}
                                    placeholder="Pilih Role"
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