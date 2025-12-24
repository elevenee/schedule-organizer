'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetDosen } from '@/features/dosen/hooks/useDosen';
import { Dosen } from '@/features/dosen/types';
import { useGetFakultas } from '@/features/fakultas/service';
import { useGetKurikulumAktif } from '@/features/kurikulum/service';
import { Kurikulum } from '@/features/kurikulum/types';
import { useGetMataKuliah } from '@/features/mata-kuliah/hooks/matkul.hook';
import { useGetProdi } from '@/features/program-studi/hooks/useProdi';
import { useGetTahunAkademikAktif } from '@/features/tahun_akademik/service';
import { Jurusan } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { jadwalFormValues } from '../validations';

interface Props {
    form: UseFormReturn<jadwalFormValues>;
    onSubmit: (values: jadwalFormValues) => Promise<void>;
    isSubmitting?: boolean;
    jenisDosen?: "TETAP" | "TIDAK_TETAP";
}
export function JadwalForm({ form, onSubmit, jenisDosen }: Props) {
    const [availableSemester, setAvailableSemester] = useState<{ value: string; label: string }[]>([]);
    const {
        handleSubmit,
        setValue,
    } = form;

    const { data: listDosen, isLoading: isLoadingDosen } = useGetDosen({
        page: 1,
        remove_pagination: true,
        limit: 1000,
        id: form.watch().dosenId ?? undefined,
        status: jenisDosen,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })
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
        fakultas: form.watch().fakultasId ?? 9999999,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })
    const { data: listKurikulum, isLoading: isLoadingKurikulum } = useGetKurikulumAktif({
        page: 1,
        remove_pagination: true,
        jurusanId: form.watch().jurusanId ?? 9999999,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })

    const { data: listMatakuliah, isLoading: isLoadingMatakuliah } = useGetMataKuliah({
        page: 1,
        remove_pagination: true,
        jurusanId: form.watch().jurusanId ?? 9999999,
        semester: form.watch().semester ?? 99999,
        kurikulumId: form.watch().kurikulumId ?? 99999,
        sort: {
            field: "nama",
            orderBy: 'asc'
        }
    })

    const matkulOptions = useMemo(() => {
        const data = listMatakuliah?.data?.map((item: any) => ({
            label: item.nama.replace(/\s+/g, ' ').trim(),
            value: Number(item.id)?.toString(),
            id: item.id,
            sks: item.sks
        })) || [];
        return data;
    }, [listMatakuliah]) as { label: string; value: string; sks: number }[];

    const availableKelas = [
        { value: "A", nama: "Kelas A" },
        { value: "B", nama: "Kelas B" },
        { value: "C", nama: "Kelas C" },
        { value: "D", nama: "Kelas D" },
        { value: "E", nama: "Kelas E" },
        { value: "F", nama: "Kelas F" },
        { value: "G", nama: "Kelas G" },
        { value: "H", nama: "Kelas H" },
        { value: "I", nama: "Kelas I" },
        { value: "J", nama: "Kelas J" },
        { value: "K", nama: "Kelas K" },
    ];

    const kelasValue = form.watch("kelas");

    // Select All / Deselect All
    const handleSelectAll = () => {
        const allKelasIds = availableKelas.map(kelas => kelas.value);

        if (kelasValue.length === availableKelas.length) {
            // Jika semua sudah terpilih, deselect all
            form.setValue("kelas", []);
        } else {
            // Jika belum semua terpilih, select all
            form.setValue("kelas", allKelasIds);
        }
    };

    const isAllSelected = kelasValue.length === availableKelas.length;

    const { data: tahunAkademik } = useGetTahunAkademikAktif();

    const SEMESTER = [1, 2, 3, 4, 5, 6, 7, 8];

    useEffect(() => {
        if (tahunAkademik) {
            if (tahunAkademik?.semester === 'GENAP') {
                setAvailableSemester(SEMESTER.filter((s) => s % 2 === 0).map((semester) => ({
                    value: semester.toString(),
                    label: `Semester ${semester}`,
                })));
            } else {
                setAvailableSemester(SEMESTER.filter((s) => s % 2 !== 0).map((semester) => ({
                    value: semester.toString(),
                    label: `Semester ${semester}`,
                })));
            }
        }

    }, [tahunAkademik?.data, setValue]);

    return (
        <Form {...form}>
            <form id="form-jadwal" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4">
                <FormField
                    control={form.control}
                    name="dosenId"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Dosen</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={listDosen?.data ? listDosen.data?.map((t: Dosen) => {
                                        return {
                                            label: t.nama + (t.Fakultas?.nama ? " - " + t.Fakultas?.nama : ""),
                                            value: t.id.toString()
                                        }
                                    }) : []}
                                    isLoading={isLoadingDosen}
                                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                                    onChange={(value) => field.onChange(Number(value))}
                                    loadingMessage='Memuat data dosen..'
                                    placeholder="Pilih Dosen"
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
                        <FormItem className='flex flex-col col-span-12 md:col-span-6'>
                            <FormLabel required>Fakultas</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={listFakultas?.data ? listFakultas.data?.map((t: Dosen) => {
                                        return {
                                            label: t.nama,
                                            value: t.id.toString()
                                        }
                                    }) : []}
                                    isLoading={isLoadingFakultas}
                                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                                    onChange={(value) => field.onChange(Number(value))}
                                    loadingMessage='Memuat data fakultas..'
                                    placeholder="Pilih Fakultas"
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
                        <FormItem className='flex flex-col col-span-12 md:col-span-6'>
                            <FormLabel required>Jurusan</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={listJurusan?.data ? listJurusan.data?.map((t: Jurusan) => {
                                        return {
                                            label: t.nama,
                                            value: t.id.toString()
                                        }
                                    }) : []}
                                    isLoading={isLoadingJurusan}
                                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                                    onChange={(value) => field.onChange(Number(value))}
                                    loadingMessage='Memuat data jurusan..'
                                    placeholder="Pilih Jurusan"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="kurikulumId"
                    render={({ field }) => (
                        <FormItem className='flex flex-col col-span-12 md:col-span-6'>
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
                        <FormItem className='flex flex-col col-span-12 md:col-span-6'>
                            <FormLabel required>Semester</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={availableSemester ?? []}
                                    value={field.value ? field.value.toString() : ""}
                                    onChange={(val) => setValue('semester', val)}
                                    placeholder="Pilih Semester"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="matakuliahId"
                    render={({ field }) => (
                        <FormItem className='col-span-12 md:col-span-6'>
                            <FormLabel required>Nama Matakuliah</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={matkulOptions}
                                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                                    onChange={(value) => {
                                        field.onChange(value);
                                        const sks = matkulOptions.filter((v: any) => v.value === value);
                                        setValue('sks', sks && sks.length ? sks[0]?.sks.toString() : "")
                                    }}
                                    isLoading={isLoadingMatakuliah}
                                    loadingMessage='Memuat data matakuliah..'
                                    placeholder="Pilih Matakuliah"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sks"
                    render={({ field }) => (
                        <FormItem className='flex flex-col col-span-12 md:col-span-6'>
                            <FormLabel required>Jumlah SKS</FormLabel>
                            <FormControl>
                                <Select value={field.value ? field.value.toString() : ""} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-auto">
                                        <SelectValue placeholder="Jumlah SKS" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="1.5">1.5</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="kelas"
                    render={() => (
                        <FormItem className='col-span-12'>
                            <FormLabel required>Kelas</FormLabel>
                            <FormControl>
                                <div className='grid grid-cols-3 gap-2 w-full'>
                                    <FormField
                                        control={form.control}
                                        name='kelas'
                                        render={() => {
                                            return (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={isAllSelected}
                                                            onCheckedChange={handleSelectAll}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Pilih Semua
                                                    </FormLabel>
                                                </FormItem>
                                            )
                                        }}
                                    ></FormField>
                                    {availableKelas.map((kelas) => (
                                        <FormField
                                            key={kelas.value}
                                            control={form.control}
                                            name="kelas"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={kelas.value}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(kelas.value)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, kelas.value])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value) => value !== kelas.value
                                                                            )
                                                                        );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {kelas.nama}
                                                        </FormLabel>
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                        <FormItem className='col-span-12'>
                            <FormLabel>Keterangan</FormLabel>
                            <FormControl>
                                <Textarea placeholder='Keterangan' value={field?.value ?? ""} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}