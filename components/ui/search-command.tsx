"use client";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useCommandStack } from "@/contexts/comand-scope-context";
import { useDebounce } from "@/hooks/use-debounce";
import * as React from "react";

export interface SearchItem {
  id: string | number;
  label: string;
  description?: string;
  value: string | number;
  raw?: any;
}

interface SearchCommandProps {
  title?: string;
  hotkey?: string;

  items?: SearchItem[];
  apiItems?: SearchItem[];
  isLoading?: boolean;
  apiError?: string | null;

  onSearch?: (keyword: string) => void;
  onSelect: (item: SearchItem) => void;
  debounceTime?: number;
}

export function SearchCommand({
  title = "Pencarian",
  hotkey = "ctrl+k",

  items = [],
  apiItems,
  isLoading = false,
  apiError,

  onSearch,
  onSelect,
  debounceTime = 300,
}: SearchCommandProps) {
  const id = React.useId(); // 🔥 unik otomatis
  const { register, unregister, isTop } = useCommandStack();

  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const debouncedValue = useDebounce(inputValue, debounceTime);

  React.useEffect(() => {
    if (onSearch) onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  /** 🔥 AUTO REGISTER */
  React.useEffect(() => {
    register(id);
    return () => unregister(id);
  }, [id]);

  /** 🔥 HOTKEY HANDLER (AUTO PRIORITY) */
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey ? "ctrl+" : ""}${
        e.metaKey ? "meta+" : ""
      }${e.key}`.toLowerCase();

      if (key === hotkey.toLowerCase() && isTop(id)) {
        e.preventDefault();
        setOpen(true);
      }

      if (e.key === "Escape" && isTop(id)) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hotkey]);

  const combinedItems = apiItems ?? items;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        autoFocus
        placeholder={`Cari ${title.toLowerCase()}...`}
        value={inputValue}
        onValueChange={setInputValue}
      />

      <CommandList>
        {apiError && <CommandEmpty>Gagal memuat data</CommandEmpty>}
        {isLoading && <CommandEmpty>Mencari...</CommandEmpty>}
        {!isLoading && combinedItems.length === 0 && (
          <CommandEmpty>Tidak ada data ditemukan</CommandEmpty>
        )}

        <CommandGroup heading={title}>
          {combinedItems.map((item) => (
            <CommandItem
              key={item.id}
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
