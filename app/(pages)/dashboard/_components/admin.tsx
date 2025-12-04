'use client'
import { Card, CardContent, } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { useGetDashboard } from "@/features/dashboard/hooks/dashboard";
import { useGetFakultas } from "@/features/fakultas/service";
import { useGetTahunAkademik } from "@/features/tahun_akademik/service";
import { Building, ListCollapse, Users } from "lucide-react";
import { useState } from "react";

/* eslint-disable */
export default function AdminDashboard() {
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | null>(null)
    const [selectedFakultas, setSelectedFakultas] = useState<number | null>(null);
    const { data, isLoading } = useGetDashboard({
        tahunAjaranId: selectedTahunAjaran ?? undefined,
        fakultasId: selectedFakultas ?? undefined
    })

    const { data: listTahunAjaran } = useGetTahunAkademik({
        page: 1,
        remove_pagination: true
    })
    const { data: listFakultas } = useGetFakultas({
        page: 1,
        remove_pagination: true
    })

    return (
        <>
            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-200 mb-4">
                    <div className="space-y-2">
                        <Label>Taun Ajaran</Label>
                        <Combobox
                            options={listTahunAjaran ? listTahunAjaran?.data?.map((item: any) => {
                                return {
                                    label: "TA. " + item.name,
                                    value: item.id.toString()
                                }
                            }) : []}
                            value={selectedTahunAjaran !== undefined && selectedTahunAjaran !== null ? String(selectedFakultas) : ""}
                            onChange={(value) => setSelectedTahunAjaran(value ? Number(value) : null)}
                            placeholder="Pilih Tahun Akademik"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Fakultas</Label>
                        <Combobox
                            options={listFakultas ? listFakultas?.data?.map((item: any) => {
                                return {
                                    label: item.nama,
                                    value: item.id.toString()
                                }
                            }) : []}
                            value={selectedFakultas !== undefined && selectedFakultas !== null ? String(selectedFakultas) : ""}
                            onChange={(value) => setSelectedFakultas(value ? Number(value) : null)}
                            placeholder="Pilih Fakultas"
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="px-2">
                        <div className="flex gap-4">
                            <Building size={32} />
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-600 dark:text-gray-300 text-sm">Total Fakultas </span>
                                <span className="font-bold text-4xl">{isLoading ? 'Loading...' : data?.totalFakultas || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="px-2">
                        <div className="flex gap-4">
                            <ListCollapse size={32} />
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-600 dark:text-gray-300 text-sm">Total Prodi </span>
                                <span className="font-bold text-4xl">{isLoading ? 'Loading...' : data?.totalJurusan || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="px-2">
                        <div className="flex gap-4">
                            <Users size={32} />
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-600 dark:text-gray-300 text-sm">Total Dosen Tetap </span>
                                <span className="font-bold text-4xl">{isLoading ? 'Loading...' : data?.totalDosenTetap || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="px-2">
                        <div className="flex gap-4">
                            <Users size={32} />
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-600 dark:text-gray-300 text-sm">Total Dosen Honorer </span>
                                <span className="font-bold text-4xl">{isLoading ? 'Loading...' : data?.totalDosenHonorer || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}