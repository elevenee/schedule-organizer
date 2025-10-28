import { Navbar } from "@/components/laylouts/protected-navbar";
import { AppSidebar } from "@/components/laylouts/sidebar";
import Logo from "@/components/ui/logo";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Session } from "next-auth";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
    session: Session | null;
};

export default async function LayoutDashboard({ children, session }: Props) {
    const role = typeof session?.user?.role === "string" ? session.user.role : undefined;

    return (
        <SidebarProvider>
            <AppSidebar role={role} />
            <SidebarInset>
                <Navbar sidebarTrigger={
                    <>
                        <div className="flex flex-row gap-2 items-center">
                            <div className="md:hidden flex flex-row gap-2 items-center flex-1"><Logo /> <span className="text-2xl font-bold">SCHD UINMA</span></div>
                            <SidebarTrigger className="-ml-1" />
                        </div>
                    </>
                }>

                </Navbar>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}