'use client'
import BaseModal from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useModalManager } from "@/hooks/modal-manager";

export const ListProgramStudi = () => {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("listProdiModal");
    const fakultas = getData("listProdiModal");
    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("listProdiModal")} size="lg">
                <BaseModal.Header>
                    <BaseModal.Title>{fakultas?.name ?? "Title"} </BaseModal.Title>
                    <BaseModal.Description>
                        Daftar Program Studi
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Prodi</TableHead>
                                <TableHead>Jenjang</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                fakultas && fakultas?.Jurusan?.map((prodi: any) => (
                                    <TableRow key={prodi.id}>
                                        <TableCell className="font-medium">{prodi.nama}</TableCell>
                                        <TableCell>{prodi.jenjang}</TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("listProdiModal")} />
                </BaseModal.Footer>
            </BaseModal>
        </>
    )
}