'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { useModalManager } from '@/hooks/modal-manager';
import BaseModal from '@/components/ui/modal';

export function FilterSisaSksModal() {
    const { isOpen, getData, close } = useModalManager();
    const open = isOpen("filterSisaSksModal");
    const jadwal = getData("filterSisaSksModal");

    const [isApplied, setIsApplied] = useState(false);
    const handleAppliedFilters = async () => {
        // Implement the logic to apply filters here
    }
    return (
        <>
            <BaseModal open={open} onOpenChange={(v) => !v && close("filterSisaSksModal")} size="lg">
                <BaseModal.Header>
                    <BaseModal.Title>Filter Jadwal</BaseModal.Title>
                    <BaseModal.Description>
                        Silakan atur filter Jadwal di sini. Klik terapkan setelah selesai.
                    </BaseModal.Description>
                </BaseModal.Header>

                <BaseModal.Body>
                    // Filter form content goes here
                </BaseModal.Body>

                <BaseModal.Footer>
                    <BaseModal.CloseButton onClick={() => close("filterSisaSksModal")} />
                    <Button
                        type='submit'
                        onClick={handleAppliedFilters}
                        disabled={isApplied}
                    >
                        {isApplied ? 'Processing..' :'Apply Filters'}
                    </Button>
                </BaseModal.Footer>
            </BaseModal>
        </>
    );
}