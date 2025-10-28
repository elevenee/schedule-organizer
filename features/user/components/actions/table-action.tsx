'use client'
import { Button } from "@/components/ui/button";
import { DeleteUserAkademik } from "../delete-dialog";
import { useModalManager } from '@/hooks/modal-manager';
import { Edit } from "lucide-react";
import { useSession } from "next-auth/react";

interface UserActionButtonsProps {
    user: any;
}

export const TableAction = ({ user }: UserActionButtonsProps) => {
    const { open, getData } = useModalManager();
    const { data: session } = useSession();

    const role = session?.user?.role;
    const canEdit = ["SUPER_ADMIN", "ADMIN"].includes(role ?? "");
    const canDelete = role === "SUPER_ADMIN";

    return (
        <div className='flex flex-wrap gap-2'>
            {
                canEdit && (
                    <Button variant={"outline"} onClick={() => open("userModal", user)}><Edit /> <span className="hidden md:flex">Edit</span></Button>
                )
            }
            {
                canDelete && (
                    <DeleteUserAkademik id={user.id} />
                )
            }
        </div>
    )
}