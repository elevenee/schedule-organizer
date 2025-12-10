'use client'

import * as React from 'react'
import { ChevronsUpDown, Loader2, AlertCircle } from 'lucide-react'

import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from '../../components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../components/ui/drawer'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

type Option = {
    label: string | React.ReactNode
    value: string
}

interface ComboboxProps {
    // Static options
    options?: Option[]

    // Suggestion API (autocomplete)
    suggestions?: Option[]        // 👈 SUGGESTION DITAMBAHKAN DI SINI
    onSearch?: (query: string) => void
    debounceMs?: number

    // React Query props
    data?: Option[]
    isLoading?: boolean
    isError?: boolean
    error?: Error | string
    isFetching?: boolean

    // UI texts
    searchPlaceholder?: string
    emptyMessage?: string
    loadingMessage?: string
    errorMessage?: string
    noOptionsMessage?: string

    // Core props
    value: string
    onChange: (value: string) => void
    placeholder?: string

    // Customizations
    className?: string
    triggerClassName?: string
    contentClassName?: string
    showSearch?: boolean
    renderTrigger?: (selected: Option | undefined, isOpen: boolean, isLoading: boolean) => React.ReactNode

    onOpenChange?: (open: boolean) => void
}

export function InputSuggestion({
    options = [],
    suggestions = [],          // 👈 daftar suggestion
    onSearch,
    debounceMs = 300,
    data,
    isLoading = false,
    isError = false,
    error,
    isFetching = false,
    searchPlaceholder = 'Cari...',
    emptyMessage = 'Tidak ada hasil ditemukan',
    loadingMessage = 'Mencari...',
    errorMessage = 'Gagal memuat data',
    noOptionsMessage = 'Tidak ada pilihan tersedia',
    value,
    onChange,
    placeholder = 'Pilih salah satu',
    triggerClassName,
    contentClassName,
    showSearch = true,
    renderTrigger,
    onOpenChange,
}: ComboboxProps) {

    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const [open, setOpen] = React.useState(false)
    const [internalSearch, setInternalSearch] = React.useState('')
    const debouncedSearch = useDebounce(internalSearch, debounceMs)

    const isDesktop = useMediaQuery("(min-width: 768px)")

    const allOptions = React.useMemo(() => data || options, [data, options])

    const selected = allOptions.find((opt) => opt.value === value)

    // Call search API
    React.useEffect(() => {
        if (onSearch) onSearch(debouncedSearch)
    }, [debouncedSearch, onSearch])

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        onOpenChange?.(newOpen)
        if (!newOpen) setInternalSearch('')
    }

    const renderTriggerContent = () => {
        if (renderTrigger) return renderTrigger(selected, open, isLoading)

        return (
            <>
                <span className="font-normal text-sm truncate flex-1 text-left">
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
        )
    }

    const content = (
        <OptionsList
            suggestions={suggestions}              // 👈 SERAHKAN KE CHILD
            placeholder={searchPlaceholder}
            emptyMessage={emptyMessage}
            loadingMessage={loadingMessage}
            errorMessage={errorMessage}
            noOptionsMessage={noOptionsMessage}
            setOpen={setOpen}
            setSelectedItem={onChange}
            options={allOptions}
            searchQuery={internalSearch}
            setSearchQuery={setInternalSearch}
            isLoading={isLoading || isFetching}
            isError={isError}
            error={error}
            showSearch={showSearch}
            rawInputValue={internalSearch}         // 👈 TAMBAHAN
        />
    )

    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        ref={triggerRef}
                        variant="outline"
                        className={cn("w-full justify-between", triggerClassName)}
                    >
                        {renderTriggerContent()}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className={cn("w-full p-0", contentClassName)}
                    sideOffset={4}
                    style={{ width: triggerRef.current?.offsetWidth }}
                    align="start"
                >
                    {content}
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-between", triggerClassName)}>
                    {renderTriggerContent()}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
                <DrawerHeader><DrawerTitle>{placeholder}</DrawerTitle></DrawerHeader>
                <div className="px-4 pb-4">{content}</div>
            </DrawerContent>
        </Drawer>
    )
}

/* ------------------- CHILD COMPONENT ------------------- */

function OptionsList({
    setOpen,
    setSelectedItem,
    options,
    suggestions,
    placeholder,
    emptyMessage,
    loadingMessage,
    errorMessage,
    noOptionsMessage,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    showSearch,
    rawInputValue,
}: {
    options: Option[]
    suggestions: Option[]          // 👈 tambahkan
    setOpen: (open: boolean) => void
    setSelectedItem: (value: string) => void
    placeholder: string
    emptyMessage: string
    loadingMessage: string
    errorMessage: string
    noOptionsMessage: string
    searchQuery: string
    setSearchQuery: (v: string) => void
    isLoading: boolean
    isError: boolean
    error?: Error | string
    showSearch: boolean
    rawInputValue: string           // 👈 input asli user
}) {

    const handleSelectSuggestion = (val: string) => {
        setSelectedItem(val)
        setOpen(false)
    }

    const handleFreeInput = () => {
        // User tidak pilih suggestion, pakai raw input
        if (rawInputValue.trim() !== '') {
            setSelectedItem(rawInputValue)
            setOpen(false)
        }
    }

    return (
        <Command className="border-none" shouldFilter={false}>
            {showSearch && (
                <CommandInput
                    value={searchQuery}
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault()
                            handleFreeInput()    // 👈 fallback input bebas
                        }
                    }}
                    onValueChange={setSearchQuery}
                />
            )}

            <CommandList className="max-h-[300px]">
                
                {/* --- SHOW SUGGESTIONS --- */}
                {suggestions.length > 0 && (
                    <CommandGroup heading="Saran">
                        {suggestions.map((s) => (
                            <CommandItem
                                key={`sug-${s.value}`}
                                onSelect={() => handleSelectSuggestion(s.value)}
                            >
                                {s.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {/* --- LOADING / ERROR / OPTIONS --- */}
                {isError ? (
                    <div className="py-8 text-center">
                        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
                        <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
                    </div>
                ) : isLoading ? (
                    <div className="py-8 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        <p className="mt-2 text-sm">{loadingMessage}</p>
                    </div>
                ) : options.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {rawInputValue ? emptyMessage : noOptionsMessage}
                        </p>
                    </div>
                ) : (
                    <CommandGroup heading="Daftar">
                        {options.map((option) => (
                            <CommandItem
                                key={option.value}
                                onSelect={() => handleSelectSuggestion(option.value)}
                            >
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </Command>
    )
}
