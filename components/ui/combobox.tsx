'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from '../../components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../components/ui/drawer'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command'

type Option = {
    label: string
    value: string
}

interface ComboboxProps {
    options: Option[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = 'Pilih salah satu',
}: ComboboxProps) {
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const selected = options.find((opt) => opt.value === value)
    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-transparent"
                        ref={triggerRef}
                    >
                        <span className="font-normal text-sm truncate flex-1 text-left">
                            {selected ? selected.label : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" sideOffset={4}
                    style={{ width: triggerRef.current?.offsetWidth }}>
                    <OptionsList placeholder={placeholder} setOpen={setOpen} setSelectedItem={onChange} options={options} />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selected ? selected.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle></DrawerTitle>
                </DrawerHeader>
                <div className="mt-4 border-t">
                    <OptionsList placeholder={placeholder} setOpen={setOpen} setSelectedItem={onChange} options={options} />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

function OptionsList({
    setOpen,
    setSelectedItem,
    options,
    placeholder,
}: {
    options: Option[]
    setOpen: (open: boolean) => void
    setSelectedItem: (value: string) => void
    placeholder: string
}) {
    return (
        <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    {options.map((option, key) => (
                        <CommandItem
                            key={key}
                            value={option.label}
                            onSelect={() => {
                                setSelectedItem(option.value)
                                setOpen(false)
                            }}
                        >
                            {option.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )
}
