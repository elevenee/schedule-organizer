'use client';

import BaseModal from '@/components/ui/modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetPengaturanJadwal } from '@/features/pengaturan/jadwal/service';
import { useGetTahunAkademikAktif } from '@/features/tahun_akademik/service';
import { useModalManager } from '@/hooks/modal-manager';
import DosenTetap from './dosenTetap';
import DosenTidakTetap from './dosenTidakTetap';

export default function ListPengajuanModal() {
    const { isOpen, close } = useModalManager();
    const open = isOpen("listRequestModal");
    // const dosen = getData("listRequestModal");

    const { data: tahunAkademik } = useGetTahunAkademikAktif()
    const { data: pengaturan } = useGetPengaturanJadwal({
        page: 1,
        limit: 2,
        sort: { field: 'jenisDosen', orderBy: 'desc' },
    })

    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("listRequestModal")} size="full">
                <BaseModal.Header>
                    <BaseModal.Title>Daftar Pengajuan</BaseModal.Title>
                    <BaseModal.Description>
                        Kelola daftar pengajuan jadwal dosen tetap dan dosen tidak tetap.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
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
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("listRequestModal")} />
                </BaseModal.Footer>
            </BaseModal>
        </>
    );
}