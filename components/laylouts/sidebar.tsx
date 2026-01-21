'use client'
import { Box, Building, Calendar, CalendarCheck, CalendarMinus, ChevronRight, LayoutDashboardIcon, User, Users } from "lucide-react";
import * as React from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import Logo from "../ui/logo";
import { Separator } from "../ui/separator";

/* eslint-disable */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { role } = props;
    const base = "";
    const COMMON_MENU = [
        {
            title: "Aplication",
            group: true,
            items: [
                { url: `${base}/dashboard`, title: "Dashboard", icon: LayoutDashboardIcon },
                { url: `${base}/profil`, title: "Profil Saya", icon: User },
            ]
        }
    ];

    const ADMIN_MENU = [
        {
            title: "Application",
            group: true,
            items: [
                { url: `${base}/dashboard`, title: "Dashboard", icon: LayoutDashboardIcon }
            ]
        },
        {
            title: "Master",
            url: "#",
            group: true,
            items: [
                { url: `${base}/admin/tahun-akademik`, title: "Tahun Akademik", icon: Calendar },
                { url: `${base}/admin/fakultas`, title: "Fakultas", icon: Building },
                { url: `${base}/admin/program-studi`, title: "Program Studi", icon: Box },
                { url: `${base}/admin/mata-kuliah`, title: "Mata Kuliah", icon: Box },
                { url: `${base}/admin/dosen`, title: "Dosen", icon: Users },
                { url: `${base}/admin/dosen-tidak-tetap`, title: "Dosen Tidak Tetap", icon: Users },
            ]
        },
        {
            title: "Jadwal",
            url: "#",
            group: true,
            items: [
                {
                    title: "Jadwal Dosen",
                    icon: Calendar,
                    url: `${base}/admin/jadwal`
                },
                {
                    title: "Sisa SKS",
                    icon: CalendarMinus,
                    url: `${base}/admin/sisa-sks`
                },
                {
                    title: "Pengaturan Jadwal Dosen",
                    icon: Calendar,
                    url: `${base}/admin/pengaturan-jadwal`
                },
            ]
        },
        {
            title: "Users",
            url: "#",
            group: true,
            items: [
                { url: `${base}/admin/user`, title: "User", icon: User },
            ]
        }

    ];

     const FAKULTAS_MENU = [
        {
            title: "Aplication",
            group: true,
            items: [
                { url: `${base}/dashboard`, title: "Dashboard", icon: LayoutDashboardIcon },
                { url: `${base}/fakultas/pengajuan-jadwal`, title: "Pengajuan Jadwal", icon: Calendar },
                { url: `${base}/fakultas/jadwal`, title: "Jadwal Disetujui", icon: CalendarCheck },
                { url: `${base}/fakultas/dosen-tidak-tetap`, title: "Dosen Tidak Tetap", icon: Users },
            ]
        }
    ];

    const links = role === "ADMIN"
            ? ADMIN_MENU
            : role === "FAKULTAS"
                ? FAKULTAS_MENU
                : COMMON_MENU;
    return (
        <Sidebar {...props}>
            <SidebarHeader className="flex flex-row gap-2 items-center justify-center">
                <Logo width={47} /> <span className="text-2xl font-bold">OFFERING</span>
            </SidebarHeader>
            <Separator />
            <SidebarContent className="gap-0 px-2 text-2xl">
                {
                    links.map((item, key) => item?.group ? (
                        <div key={key}>
                            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                            <SidebarMenu>
                                {"items" in item && (item.items ?? []).map((subItem: any) => (
                                    <SidebarMenuItemChild key={subItem.title} {...subItem} />
                                ))}
                            </SidebarMenu>
                        </div>
                    ) : (
                        <SidebarMenu key={item.title}>
                            <SidebarMenuItemChild key={item.title} {...item} />
                        </SidebarMenu>
                    ))
                }
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}

const SidebarMenuItemChild = (item: any) => {
    return (
        <>
            {'items' in item ? (
                <Collapsible className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                                {item.icon && <item.icon />}
                                {item.title}
                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.items?.map((subItem: any) => (
                                    <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuButton asChild isActive={subItem.isActive}>
                                            <a href={subItem.url}>
                                                {subItem.icon && <subItem.icon />}
                                                <span>{subItem.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            ) : (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                        <a href={item.url}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
        </>
    )
}