import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Role } from "@prisma/client";
import { useMemo } from "react";

export default function UserAdvanceFilterForm({
    current,
    onFakultasChange,
    fakultas,
    onRoleChange,
    onReset
}: {
    current: { selectedFakultas: string; selectedRole: string };
    onFakultasChange: (q: string) => void;
    fakultas: any[];
    onRoleChange: (p: string) => void;
    onReset: () => void
}) {
    const roles = [
        { label: Role.ADMIN, value: Role.ADMIN },
        { label: Role.FAKULTAS, value: Role.FAKULTAS },
        { label: Role.DOSEN, value: Role.DOSEN },
        { label: Role.PRODI, value: Role.PRODI },
    ];
    const fakultasOptions = useMemo(() =>
        fakultas?.map((item) => ({
            label: item.nama,
            value: item.id.toString(),
        })) || [],
        [fakultas]
    );
    return (
        <div
            className="flex flex-wrap justify-center justify-start md:justify-end gap-4 items-end mb-4 w-full border-b py-4 border-gray-200 dark:border-gray-400"
        >
            <div className="flex flex-col gap-2 min-w-[350px]">
                <Label>Fakultas</Label>
                <Combobox
                    options={fakultasOptions}
                    value={current.selectedFakultas ?? ""}
                    onChange={onFakultasChange}
                    placeholder="Pilih Fakultas"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label>Role</Label>
                <Combobox
                    options={roles}
                    value={current.selectedRole ? current.selectedRole?.toString() : ''}
                    onChange={onRoleChange}
                    placeholder="Pilih Role"
                />
            </div>
            <Button variant={"secondary"} onClick={onReset}>Reset</Button>
        </div>
    );
}
