// components/search-input.tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Search } from "lucide-react";

export interface SuggestionItem {
    value: string;
    label: string;
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; 
}

interface SearchInputProps {
    suggestions: SuggestionItem[];
    value: string;
    onChange: (value: string) => void;
    onSelect?: (item: SuggestionItem) => void;
    placeholder?: string;
    className?: string;
    emptyMessage?: string;
    maxSuggestions?: number;
    disabled?: boolean;
}

export function SearchInput({
    suggestions,
    value,
    onChange,
    onSelect,
    placeholder = "Search...",
    className,
    emptyMessage = "No results found.",
    maxSuggestions = 10,
    disabled = false,
}: SearchInputProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value);

    // Filter suggestions based on input
    const filteredSuggestions = React.useMemo(() => {
        if (!inputValue) return suggestions.slice(0, maxSuggestions);

        return suggestions
            .filter(item =>
                item.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                item.value.toLowerCase().includes(inputValue.toLowerCase())
            )
            .slice(0, maxSuggestions);
    }, [suggestions, inputValue, maxSuggestions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
        setOpen(true);
    };

    const handleSelect = (item: SuggestionItem) => {
        setInputValue(item.label);
        onChange(item.value);
        onSelect?.(item);
        setOpen(false);
    };

    const handleInputFocus = () => {
        if (inputValue && filteredSuggestions.length > 0) {
            setOpen(true);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setOpen(false);
        } else if (e.key === "Enter" && filteredSuggestions.length > 0) {
            // Auto-select first suggestion on Enter
            handleSelect(filteredSuggestions[0]);
        }
    };

    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleInputKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="pl-10 pr-10"
            />

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        disabled={disabled}
                    >
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-full p-0"
                    align="start"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                    <Command>
                        <CommandInput
                            placeholder="Search suggestions..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {filteredSuggestions.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.value}
                                        onSelect={() => handleSelect(item)}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                inputValue === item.label ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {item.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}