"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UserFilterForm({
    current,
    onSearchChange,
    onPerPageChange
}: {
    current: { q: string; perPage: number };
    onSearchChange: (q: string) => void;
    onPerPageChange: (p: string) => void;
}) {

    return (
        <div
            className="flex flex-wrap justify-center md:justify-between gap-4 items-end mb-4 w-full border-y py-4 border-gray-200 dark:border-gray-400"
        >
            <Input
                placeholder="Cari nama, username, email..."
                value={current.q}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-sm"
            />

            <div className="flex flex-row gap-2 items-center">
                <span>Show</span>
                <Select value={current.perPage.toString()} onValueChange={onPerPageChange}>
                    <SelectTrigger className="w-auto">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
                <span>Items</span>
            </div>
        </div>
    );
}
