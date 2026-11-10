import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function DeniedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
            <Card className="max-w-md w-full text-center shadow-lg">
                <CardHeader className="space-y-2 flex flex-col items-center">
                    <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                        <ShieldAlert className="w-12 h-12" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Akses Ditolak</CardTitle>
                    <CardDescription>
                        Anda tidak memiliki hak akses (role) yang sesuai untuk membuka halaman ini.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Jika Anda merasa ini adalah sebuah kesalahan, silakan hubungi administrator sistem untuk memperbarui hak akses akun Anda.
                    </p>
                    <div className="flex justify-center gap-2">
                        <Button asChild variant="default">
                            <Link href="/dashboard">Kembali ke Dashboard</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

