import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export const ForgotPasswordAlert = () => {
    return (
        <AlertDialog>
            <AlertDialogTrigger>
                <span className="cursor-pointer ml-auto text-sm underline-offset-4 hover:underline">Lupa password?</span>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Information</AlertDialogTitle>
                    <AlertDialogDescription>
                        Silahkan hubungi bagian akademik untuk mereset password.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Tutup</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
} 