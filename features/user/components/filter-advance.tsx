import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "@prisma/client";

export default function UserAdvanceFilterForm({
    current,
    onStatusChange,
    onRoleChange,
    onReset
}: {
    current: { status: string; role: string };
    onStatusChange: (q: string) => void;
    onRoleChange: (p: string) => void;
    onReset: () => void
}) {
    const roles = [
        { label: Role.ADMIN, value: Role.ADMIN },
        { label: Role.AKADEMIK, value: Role.AKADEMIK },
        { label: Role.KEUANGAN, value: Role.KEUANGAN },
        { label: Role.VERIFIKATOR, value: Role.VERIFIKATOR },
        { label: Role.PENDAFTAR, value: Role.PENDAFTAR },
    ];
    return (
        <div
            className="flex flex-wrap justify-center justify-start md:justify-end gap-4 items-end mb-4 w-full border-b py-4 border-gray-200 dark:border-gray-400"
        >
            <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select value={current.status.toString()} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-auto">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Role</Label>
                <Combobox
                    options={roles}
                    value={current.role ? current.role?.toString() : ''}
                    onChange={onRoleChange}
                    placeholder="Pilih Role"
                />
            </div>
            <Button variant={"secondary"} onClick={onReset}>Reset</Button>
        </div>
    );
}
