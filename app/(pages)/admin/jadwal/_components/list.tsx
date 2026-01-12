'use client'
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JadwalModal } from "@/features/jadwal/components/create-modal";
import { ApproveJadwalRequestModal } from "@/features/pengajuan-jadwal/components/approve-modal";
import { StatusJadwalRequestModal } from "@/features/pengajuan-jadwal/components/update-status";
import { StatusJadwalRequestAllModal } from "@/features/pengajuan-jadwal/components/update-status-all";
import { useGetPengaturanJadwal } from "@/features/pengaturan/jadwal/service";
import { useGetTahunAkademikAktif } from "@/features/tahun_akademik/service";
import { Download } from "lucide-react";
import { useEffect } from "react";
import DosenTetap from "./dosenTetap";
import DosenTidakTetap from "./dosenTidakTetap";
import ListPengajuanModal from "./pengajuan/list-modal";

/* eslint-disable */
export default function List() {
    const { toggleSidebar } = useSidebar()
    const { data: tahunAkademik } = useGetTahunAkademikAktif()
    const { data: pengaturan } = useGetPengaturanJadwal({
        page: 1,
        limit: 2,
        sort: { field: 'jenisDosen', orderBy: 'desc' },
    })

    useEffect(() => {
        toggleSidebar();
    }, []);

    return (
        <div className="w-full">
            <div className="flex gap-2 flex-col md:flex-row md:items-center md:flex-column md:justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold order-2 md:order-1">Daftar Jadwal</h1>
                    <p className="text-gray-400">Tahun Akademik: {tahunAkademik ? tahunAkademik?.name + ` - SMT ${tahunAkademik?.semester}` : "Tidak Diketahui"}</p>
                </div>
                <div>
                    <Button variant="default" onClick={() => {
                        window.location.href = "/api/export/jadwal"
                    }}>
                        <Download /> Export Excel
                    </Button>
                </div>
            </div>
            <div>
                <div className="flex w-full flex-col gap-6">
                    <Tabs defaultValue="tetap">
                        <TabsList>
                            <TabsTrigger value="tetap">Dosen Tetap</TabsTrigger>
                            <TabsTrigger value="tidak_tetap">Dosen Tidak Tetap</TabsTrigger>
                        </TabsList>
                        <TabsContent value="tetap" className="w-full">
                            <DosenTetap pengaturan={pengaturan ? pengaturan : null} tahunAkademik={tahunAkademik ?? null} />
                        </TabsContent>
                        <TabsContent value="tidak_tetap">
                            <DosenTidakTetap pengaturan={pengaturan ? pengaturan : null} tahunAkademik={tahunAkademik ?? null} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <JadwalModal />
            <ListPengajuanModal />
            <StatusJadwalRequestModal />
            <StatusJadwalRequestAllModal />
            <ApproveJadwalRequestModal />
        </div>
    );
}