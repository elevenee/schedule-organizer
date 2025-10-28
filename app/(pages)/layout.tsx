import LayoutDashboard from "@/components/laylouts/layout-component";
import { getSessionOrRedirect } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getSessionOrRedirect();
    return <LayoutDashboard session={session}>{children}</LayoutDashboard>;
}