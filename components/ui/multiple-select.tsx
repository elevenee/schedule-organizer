"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export type Option = {
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
};

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    maxCount?: number;
    className?: string;
    disabled?: boolean;
    showSelectAll?: boolean;
    showReset?: boolean;
    topAction?: boolean
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    searchPlaceholder = "Search...",
    emptyMessage = "No options found.",
    maxCount = 3,
    className,
    disabled = false,
    showSelectAll = true,
    showReset = true,
    topAction = false
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Filter options berdasarkan search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            option.value.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [options, searchQuery]);

    // Check jika semua option terpilih
    const allSelected = options.length > 0 && selected.length === options.length;
    const someSelected = selected.length > 0 && !allSelected;

    // Handle select all
    const handleSelectAll = () => {
        if (allSelected) {
            // Jika semua sudah terpilih, reset semua
            onChange([]);
        } else {
            // Pilih semua option yang tidak disabled
            const allValues = options
                .filter(option => !option.disabled)
                .map(option => option.value);
            onChange(allValues);
        }
    };

    const handleSelect = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const removeItem = (value: string) => {
        const newSelected = selected.filter((item) => item !== value);
        onChange(newSelected);
    };

    const clearAll = () => {
        onChange([]);
    };

    // Reset dengan close popover
    const handleReset = () => {
        onChange([]);
        setOpen(false);
    };

    const selectedLabels = selected.map(
        (value) => options.find((opt) => opt.value === value)?.label || value
    );

    return (
        <div className={cn("space-y-2", className)}>
            {/* Selected items dengan badge */}
            {
                topAction && (
                    <div className={`flex flex-col gap-2`} >
                        {selected.length > 0 && (
                            <>
                                <div className="flex flex-wrap gap-1">
                                    {selected.slice(0, maxCount).map((value) => {
                                        const option = options.find((opt) => opt.value === value);
                                        return (
                                            <Badge
                                                key={value}
                                                variant="secondary"
                                                className="px-2 py-1 text-sm flex items-center gap-1"
                                            >
                                                {option?.icon && (
                                                    <option.icon className="h-3 w-3" />
                                                )}
                                                {option?.label || value}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(value)}
                                                    className="ml-1 hover:bg-muted rounded-full"
                                                    aria-label={`Remove ${option?.label || value}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                    {selected.length > maxCount && (
                                        <Badge variant="outline" className="px-2 py-1 text-sm">
                                            +{selected.length - maxCount} more
                                        </Badge>
                                    )}
                                </div>

                                {/* Action buttons di bawah badges */}
                                <div className="flex gap-2">
                                    {showReset && selected.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearAll}
                                            className="h-7 px-2 text-xs"
                                        >
                                            <XCircle className="mr-1 h-3 w-3" />
                                            Clear all ({selected.length})
                                        </Button>
                                    )}

                                    {showSelectAll && options.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSelectAll}
                                            className="h-7 px-2 text-xs"
                                        >
                                            <Check className="mr-1 h-3 w-3" />
                                            {allSelected ? "Unselect all" : "Select all"}
                                        </Button>
                                    )}
                                </div>

                                <Separator />
                            </>
                        )}
                    </div>
                )
            }
            {/* Popover untuk select */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={disabled}
                    >
                        <span className="truncate">
                            {selected.length === 0
                                ? placeholder
                                : `${selected.length} selected`}
                        </span>
                        <div className="flex items-center gap-1">
                            {someSelected && (
                                <span className="text-xs text-muted-foreground">
                                    ({selected.length}/{options.length})
                                </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>

                            {/* Action Group: Select All dan Reset */}
                            {(showSelectAll || showReset) && filteredOptions.length > 0 && (
                                <>
                                    <CommandGroup>
                                        <div className="flex flex-col px-2 py-1">
                                            {showSelectAll && (
                                                <CommandItem
                                                    onSelect={handleSelectAll}
                                                    className="flex items-center justify-between cursor-pointer"
                                                >
                                                    <div className="flex items-center">
                                                        <div className="mr-2 flex h-4 w-4 items-center justify-center">
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                        <span>{allSelected ? "Unselect all" : "Select all"}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {selected.length}/{options.length}
                                                    </span>
                                                </CommandItem>
                                            )}
                                        </div>
                                    </CommandGroup>
                                    <CommandSeparator />
                                </>
                            )}

                            {/* Options Group */}
                            <CommandGroup>
                                <ScrollArea className="h-40">
                                    {filteredOptions.map((option) => {
                                        const isSelected = selected.includes(option.value);
                                        const isDisabled = option.disabled || disabled;

                                        return (
                                            <CommandItem
                                                key={option.value}
                                                value={option.value}
                                                onSelect={() => !isDisabled && handleSelect(option.value)}
                                                disabled={isDisabled}
                                                className={cn(
                                                    isDisabled && "cursor-not-allowed opacity-50"
                                                )}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={cn(
                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                                                isSelected
                                                                    ? "bg-primary border-primary"
                                                                    : "border-muted",
                                                                isDisabled && "opacity-50"
                                                            )}
                                                        >
                                                            {isSelected && (
                                                                <Check className="h-3 w-3 text-primary-foreground" />
                                                            )}
                                                        </div>
                                                        {option.icon && (
                                                            <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        )}
                                                        <span>{option.label}</span>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                                </ScrollArea>
                            </CommandGroup>

                            {/* Summary di bagian bawah */}
                            {selected.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <div className="px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                                            <span>Selected: {selected.length} item(s)</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleReset}
                                                className="h-6 px-2 text-xs"
                                            >
                                                Clear all
                                            </Button>
                                        </div>
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Summary untuk banyak selected items */}
            {selected.length > 0 && (
                <div className="flex items-start justify-between">
                    <p className="text-xs text-muted-foreground flex flex-wrap">
                        {selected.length === options.length ? (
                            "All items selected"
                        ) : (
                            <>
                                Selected: {selectedLabels.slice(0, maxCount).join(", ")}
                                {selected.length > maxCount && `, +${selected.length - maxCount} more`}
                            </>
                        )}
                    </p>

                    <div className="flex gap-1">
                        {showSelectAll && selected.length < options.length && (
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                onClick={handleSelectAll}
                                className="h-auto p-0 text-xs"
                            >
                                Select all
                            </Button>
                        )}
                        {showReset && selected.length > 0 && (
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                onClick={clearAll}
                                className="h-auto p-0 text-xs"
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}