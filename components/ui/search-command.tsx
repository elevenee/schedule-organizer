"use client";

import * as React from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";

/* eslint-disable */
export interface SearchItem {
    id: string | number;
    label: string;
    description?: string;
    value: string | number;
    raw?: any;
}

interface SearchCommandProps {
    title?: string;
    /** Static items (opsional) */
    items?: SearchItem[];

    /** API Search handler (React Query wrapper) */
    apiItems?: SearchItem[];
    isLoading?: boolean;
    isFetching?: boolean;
    apiError?: string | null;

    /** Ketika keyword berubah (setelah debounce) */
    onSearch?: (keyword: string) => void;

    /** Ketika memilih item */
    onSelect: (item: SearchItem) => void;

    /** Debounce input */
    debounceTime?: number;

    /** Hotkey pembuka popup, contoh: "ctrl+f" */
    hotkey?: string;
}

/* eslint-disable */
export function SearchCommand({
    title = "Pencarian",
    items = [],
    apiItems,
    isLoading = false,
    isFetching = false,
    apiError,
    onSearch,
    onSelect,
    debounceTime = 300,
    hotkey = "ctrl+f",
}: SearchCommandProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    /** 🔥 Debounce lokal (lebih stabil) */
    const debouncedValue = useDebounce(inputValue, debounceTime);

    /** 🔥 Trigger callback setelah debounce */
    React.useEffect(() => {
        if (!onSearch) return;
        onSearch(debouncedValue);
    }, [debouncedValue, onSearch]);

    /** 🔥 Hotkey listener */
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const key = `${e.ctrlKey ? "ctrl+" : ""}${e.metaKey ? "meta+" : ""}${e.key}`.toLowerCase();
            if (key === hotkey.toLowerCase()) {
                e.preventDefault();
                setOpen(true);
            }
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [hotkey]);

    /** 🔥 Gabungkan static items + api items */
    const combinedItems = React.useMemo(() => {
        if (apiItems) return apiItems;
        return items;
    }, [apiItems, items, debouncedValue]);
    
    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                autoFocus
                placeholder={`Cari ${title.toLowerCase()}...`}
                value={inputValue}
                onValueChange={(val) => setInputValue(val)}
            />

            <CommandList>
                {apiError && <CommandEmpty>Gagal memuat data</CommandEmpty>}

                {/* Loading */}
                {isLoading ? (
                    <CommandEmpty>Mencari...</CommandEmpty>
                ) : null}

                {/* Tidak ada hasil */}
                {!isLoading && combinedItems.length === 0 && (
                    <CommandEmpty>Tidak ada data ditemukan.</CommandEmpty>
                )}
                
                <CommandGroup heading={title}>
                    {combinedItems.map((item, index) => (
                        <CommandItem
                            key={index}
                            value={item.label}
                            onSelect={() => {
                                onSelect(item);
                                setOpen(false);
                            }}
                        >
                            <div className="flex flex-col">
                                <span>{item.label}</span>
                                {item.description && (
                                    <span className="text-xs text-muted-foreground">
                                        {item.description}
                                    </span>
                                )}
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
