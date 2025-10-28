"use client";

import { Combobox } from "@/components/ui/combobox";
import { useMemo } from "react";

export default function ProgramStudiFilterAdvanceForm({
    current,
    onFakultasChange,
    fakultas
}: {
    current: { q: string; perPage: number, selectedFakultas: string };
    onFakultasChange: (q: string) => void;
    fakultas: any[],
}) {

    const fakultasOptions = useMemo(() =>
        fakultas?.map((item) => ({
            label: item.nama,
            value: item.id.toString(),
        })) || [],
        [fakultas]
    );
    return (
        <div
            className="flex flex-wrap justify-center md:justify-between gap-4 items-end mb-4 w-full border-y py-4 border-gray-200 dark:border-gray-400"
        >
            <Combobox
                options={fakultasOptions}
                value={current.selectedFakultas ?? ""}
                onChange={onFakultasChange}
                placeholder="Pilih Fakultas"
            />
        </div>
    );
}
