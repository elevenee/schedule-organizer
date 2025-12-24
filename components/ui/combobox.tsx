'use client'

import { AlertCircle, ChevronsUpDown, Loader2 } from 'lucide-react'
import * as React from 'react'

import { useDebounce } from '@/hooks/use-debounce'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { Button } from '../../components/ui/button'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'

type Option = {
    label: string | React.ReactNode
    value: string
}

interface ComboboxProps {
    // Static options (opsional - bisa dari local atau cache)
    options?: Option[]
    
    // Props untuk search (jika ingin internal search dengan debounce)
    onSearch?: (query: string) => void
    debounceMs?: number
    
    // Props untuk data dari React Query
    data?: Option[]
    isLoading?: boolean
    isError?: boolean
    error?: Error | string
    isFetching?: boolean
    
    // UI props
    searchPlaceholder?: string
    emptyMessage?: string
    loadingMessage?: string
    errorMessage?: string
    noOptionsMessage?: string
    
    // Common props
    value: string
    onChange: (value: string) => void
    placeholder?: string
    
    // Customization
    className?: string
    triggerClassName?: string
    contentClassName?: string
    showSearch?: boolean
    
    // Custom trigger
    renderTrigger?: (selected: Option | undefined, isOpen: boolean, isLoading: boolean) => React.ReactNode
    
    // Callbacks
    onOpenChange?: (open: boolean) => void
}

export function Combobox({
    options = [],
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
    
    // Gabungkan options dan data dari props
    const allOptions = React.useMemo(() => {
        return data || options
    }, [data, options])
    
    const selected = allOptions.find((opt) => opt.value === value)
    
    // Trigger external search ketika debounced search berubah
    React.useEffect(() => {
        if (onSearch && debouncedSearch.trim()) {
            onSearch(debouncedSearch)
        }
    }, [debouncedSearch, onSearch])
    
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        onOpenChange?.(newOpen)
        
        // Reset search ketika ditutup
        if (!newOpen) {
            setInternalSearch('')
        }
    }
    
    // Render trigger button
    const renderTriggerContent = () => {
        if (renderTrigger) {
            return renderTrigger(selected, open, isLoading)
        }
        
        return (
            <>
                <span className="font-normal text-sm truncate flex-1 text-left">
                    {selected ? selected.label : placeholder}
                    {isFetching && !selected && (
                        <Loader2 className="ml-2 h-3 w-3 inline animate-spin" />
                    )}
                </span>
                <ChevronsUpDown className={cn(
                    "ml-2 h-4 w-4 shrink-0 opacity-50",
                    isLoading && "animate-pulse"
                )} />
            </>
        )
    }
    
    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between bg-transparent overflow-hidden",
                            triggerClassName,
                            isLoading && "opacity-70"
                        )}
                        ref={triggerRef}
                        disabled={isLoading}
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
                    <OptionsList 
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
                        hasSearchQuery={!!debouncedSearch}
                        hasStaticOptions={options.length > 0}
                        onSearch={onSearch}
                    />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between",
                        triggerClassName,
                        isLoading && "opacity-70"
                    )}
                    disabled={isLoading}
                >
                    {renderTriggerContent()}
                </Button>
            </DrawerTrigger>
            <DrawerContent className={cn("max-h-[80vh]", contentClassName)}>
                <DrawerHeader className="pb-2">
                    <DrawerTitle className="text-center">{placeholder}</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                    <OptionsList 
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
                        hasSearchQuery={!!debouncedSearch}
                        hasStaticOptions={options.length > 0}
                        onSearch={onSearch}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

/* eslint-disable */
const getTextFromReactNode = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node
    if (typeof node === 'number') return node.toString()
    if (typeof node === 'boolean') return ''
    if (node == null) return ''

    if (React.isValidElement(node)) {
        const children = (node as React.ReactElement<any, any>).props.children
        if (Array.isArray(children)) {
            return children.map(child => getTextFromReactNode(child)).join(' ')
        }
        return getTextFromReactNode(children)
    }
    return ''
}

interface OptionsListProps {
    options: Option[]
    setOpen: (open: boolean) => void
    setSelectedItem: (value: string) => void
    placeholder: string
    emptyMessage: string
    loadingMessage: string
    errorMessage: string
    noOptionsMessage: string
    searchQuery: string
    setSearchQuery: (query: string) => void
    isLoading: boolean
    isError: boolean
    error?: Error | string
    showSearch: boolean
    hasSearchQuery: boolean
    hasStaticOptions: boolean
    onSearch?: (query: string) => void
}

function OptionsList({
    setOpen,
    setSelectedItem,
    options,
    placeholder,
    emptyMessage,
    loadingMessage,
    errorMessage,
    noOptionsMessage,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    error,
    showSearch,
    hasSearchQuery,
    hasStaticOptions,
    onSearch,
}: OptionsListProps) {
    const handleInputChange = (value: string) => {
        setSearchQuery(value)
    }

    const handleSelect = (value: string) => {
        setSelectedItem(value)
        setOpen(false)
    }

    // Tentukan apakah harus menampilkan search input
    const shouldShowSearch = showSearch && (hasStaticOptions || onSearch)

    return (
        <Command 
            shouldFilter={!onSearch} // Nonaktifkan filter jika menggunakan API search
            className="border-none"
        >
            {shouldShowSearch && (
                    <CommandInput
                        placeholder={placeholder}
                        value={searchQuery}
                        onValueChange={handleInputChange}
                        className="flex-1 border-none focus:ring-0"
                    />
            )}
            
            <CommandList className="max-h-[300px]">
                {isError ? (
                    <div className="py-8 text-center">
                        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
                        <p className="mt-2 text-sm text-destructive">
                            {errorMessage}
                        </p>
                        {error && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {typeof error === 'string' ? error : error.message}
                            </p>
                        )}
                    </div>
                ) : isLoading ? (
                    <div className="py-8 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                            {loadingMessage}
                        </p>
                    </div>
                ) : options.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {hasSearchQuery ? emptyMessage : noOptionsMessage}
                        </p>
                    </div>
                ) : (
                    <CommandGroup>
                        {options.map((option) => (
                            <CommandItem
                                key={option.value}
                                value={`${getTextFromReactNode(option.label)} ${option.value}`.trim()}
                                onSelect={() => handleSelect(option.value)}
                                className="cursor-pointer"
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