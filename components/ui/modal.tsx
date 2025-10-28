"use client";

import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface BaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Ukuran modal: sm, md, lg, xl, atau full */
    size?: ModalSize;
    /** Tambahan className custom */
    className?: string;
    children: React.ReactNode;
}

export function BaseModal({
    open,
    onOpenChange,
    size = "md",
    className,
    children,
}: BaseModalProps) {
    const sizeClasses = {
        sm: "sm:max-w-[400px]",
        md: "sm:max-w-[500px]",
        lg: "sm:max-w-[700px]",
        xl: "sm:max-w-[900px]",
        full: "sm:max-w-[100vw] sm:h-[100vh] sm:rounded-none sm:m-0 sm:p-0",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "max-h-[90vh] flex flex-col",
                    sizeClasses[size],
                    className
                )}
            >
                {children}
            </DialogContent>
        </Dialog>
    );
}

// === Subcomponents ===

function BaseModalHeader({ children }: { children: React.ReactNode }) {
    return <DialogHeader>{children}</DialogHeader>;
}

function BaseModalTitle({ children }: { children: React.ReactNode }) {
    return <DialogTitle>{children}</DialogTitle>;
}

function BaseModalDescription({ children }: { children: React.ReactNode }) {
    return <DialogDescription>{children}</DialogDescription>;
}

/**
 * Body otomatis scroll jika isinya panjang
 */
function BaseModalBody({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 overflow-y-auto px-1 sm:px-2">
            {children}
        </div>
    );
}

function BaseModalFooter({ children }: { children?: React.ReactNode }) {
    return <DialogFooter>{children}</DialogFooter>;
}

function BaseModalCloseButton({
    label = "Close",
    onClick,
}: {
    label?: string;
    onClick?: () => void;
}) {
    return (
        <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={onClick}>
                {label}
            </Button>
        </DialogClose>
    );
}

// Attach subcomponents
BaseModal.Header = BaseModalHeader;
BaseModal.Title = BaseModalTitle;
BaseModal.Description = BaseModalDescription;
BaseModal.Body = BaseModalBody;
BaseModal.Footer = BaseModalFooter;
BaseModal.CloseButton = BaseModalCloseButton;

export default BaseModal;
