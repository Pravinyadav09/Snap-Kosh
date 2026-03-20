"use client"

import * as React from "react"
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Settings,
    LogOut,
    ChevronRight,
    Command,
    Calculator,
    Activity,
    Package,
    ShieldCheck,
    FileText,
    Gauge,
    Truck,
    Wallet,
    Calendar as CalendarIcon,
    Printer,
    FileClock,
    UserCircle,
    Boxes,
    Layers,
    MonitorPlay,
    ExternalLink,
    CreditCard,
    ShoppingCart,
    Tag,
    BarChart3,
    FileSpreadsheet,
    Landmark,
    UserCog,
    Percent,
    ClipboardList,
    Users2,
    Cog,
    Maximize2,
    Wrench,
    Clock,
    ClipboardCheck,
    AlertTriangle,
    Search,
    ChevronDown,
    User,
    Banknote
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Can } from "@/components/shared/permission-context"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    useSidebar,
    SidebarSeparator,
} from "@/components/ui/sidebar"

const menuGroups = [
    {
        label: "Core",
        items: [
            { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        ]
    },
    {
        label: "CRM & Sales",
        items: [
            { title: "Customers", url: "/customers", icon: UserCircle },
            { title: "Customer Analysis", url: "/customers/analysis", icon: BarChart3 },
            { title: "Quotations", url: "/estimator", icon: Calculator },
            { title: "Invoices", url: "/invoices", icon: FileText },
            { title: "Client Portals", url: "/portal/login", icon: ExternalLink },
        ]
    },
    {
        label: "Production",
        items: [
            { title: "Production Jobs", url: "/jobs", icon: Activity },
            { title: "Scheduler", url: "/scheduler", icon: CalendarIcon },
            { title: "Daily Readings", url: "/daily-readings", icon: BookOpen },
            { title: "Machines", url: "/machines", icon: Gauge },
            { title: "Dispatch Board", url: "/dispatch", icon: Truck },
        ]
    },
    {
        label: "Maintenance",
        items: [
            { title: "Maintenance Center", url: "/maintenance", icon: Wrench },
        ]
    },
    {
        label: "Inventory",
        items: [
            { title: "Paper Inventory", url: "/inventory", icon: Layers },
            { title: "Paper Stocks", url: "/inventory/paper-stocks", icon: Boxes },
            { title: "Media Stocks", url: "/inventory/media-stocks", icon: Maximize2 },
            { title: "Purchases", url: "/inventory/purchases", icon: ShoppingCart },
            { title: "Process Masters", url: "/management/processes", icon: Cog },
        ]
    },
    {
        label: "Outsource",
        items: [
            { title: "Vendors", url: "/outsource/vendors", icon: Users2 },
            { title: "Outsource Jobs", url: "/outsource/jobs", icon: ExternalLink },
        ]
    },
    {
        label: "Finance",
        items: [
            { title: "Expenses", url: "/finance/expenses", icon: CreditCard },
            { title: "Expense Categories", url: "/finance/categories", icon: Tag },
        ]
    },
    {
        label: "Reports",
        items: [
            { title: "Reports", url: "/reports", icon: BarChart3 },
            { title: "Paper Usage Ledger", url: "/reports/ledger", icon: FileSpreadsheet },
            { title: "GST Reports", url: "/reports/gst", icon: Landmark },
        ]
    },
    {
        label: "Management",
        items: [
            { title: "Users", url: "/management/users", icon: Users },
            { title: "Roles", url: "/management/roles", icon: UserCog },
            { title: "Settings", url: "/settings", icon: Settings },
        ]
    }
]

export function AppSidebar() {
    const pathname = usePathname()
    const { setOpenMobile, setOpen, isMobile, state } = useSidebar()

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false)
        }
    }

    const isCollapsed = state === "collapsed"

    return (
        <Sidebar collapsible="icon" className="border-r border-slate-200/80 bg-white">
            <SidebarHeader className="py-2.5 px-4 group-data-[collapsible=icon]:px-0 gap-2">
                <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent px-0 transition-all duration-300 group-data-[collapsible=icon]:justify-center">
                            <Link href="/dashboard" className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105 border border-slate-100">
                                    <Command className="size-6 text-primary" />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex flex-col gap-0.5 leading-none transition-all duration-300">
                                        <span className="text-sm font-black tracking-tight text-slate-800 uppercase">Digital ERP</span>
                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Enterprise Suite</span>
                                    </div>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {!isCollapsed && (
                    <div className="relative group/search mt-1 px-3">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 transition-colors group-focus-within/search:text-primary" />
                        <input 
                            placeholder="Quick find... (⌘K)"
                            className="w-full bg-slate-50 border border-slate-200/60 rounded-lg py-1.5 pl-9 pr-3 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 focus:ring-1 focus:ring-primary/20 transition-all outline-none focus:bg-white focus:border-primary/30"
                        />
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="px-3 pb-4 group-data-[collapsible=icon]:px-0">
                {menuGroups.map((group) => {
                    const permMap: Record<string, string> = {
                        "Core": "dashboard",
                        "CRM & Sales": "sales",
                        "Production": "production",
                        "Maintenance": "maintenance",
                        "Inventory": "inventory",
                        "Human Resources": "hr",
                        "Outsource": "outsource",
                        "Finance": "finance",
                        "Reports": "reports",
                        "Management": "users"
                    }
                    const permissionId = permMap[group.label] || group.label.toLowerCase()

                    return (
                        <Can key={group.label} I="view" a={permissionId}>
                            <SidebarGroup className="mb-0 group-data-[collapsible=icon]:px-0 p-1">
                                {!isCollapsed && (
                                    <SidebarGroupLabel className="mb-0.5 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/40 font-sans h-auto pt-2">
                                        {group.label}
                                    </SidebarGroupLabel>
                                )}
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.url
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                size="default"
                                                isActive={isActive}
                                                tooltip={item.title}
                                                onClick={handleLinkClick}
                                                className={cn(
                                                    "relative flex items-center gap-3 rounded-lg transition-all duration-200 group/item",
                                                    isActive 
                                                        ? "bg-primary/10 text-primary shadow-sm" 
                                                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                                    isCollapsed && "justify-center px-0 w-full"
                                                )}
                                            >
                                                <Link href={item.url} className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "gap-3 px-3 w-full")}>
                                                    <item.icon className={cn(
                                                        "size-5 shrink-0 transition-all duration-200 group-hover/item:scale-115",
                                                        isActive ? "text-primary opacity-100" : "opacity-80"
                                                    )} />
                                                    {!isCollapsed && (
                                                        <span className="text-[13px] font-semibold transition-all duration-200 truncate">{item.title}</span>
                                                    )}
                                                    {isActive && (
                                                        <div className={cn(
                                                            "absolute bg-primary rounded-full transition-all duration-300",
                                                            isCollapsed 
                                                                ? "right-0 w-1 h-6 translate-x-1" 
                                                                : "left-0 w-1 h-5 rounded-r-full"
                                                        )} />
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                            </SidebarGroup>
                        </Can>
                    )
                })}
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter className="p-2 group-data-[collapsible=icon]:px-0">
                <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                    {!isCollapsed && (
                        <SidebarMenuItem className="mb-1 px-1">
                             <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200/60 shadow-sm">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                                    <User className="size-4" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-[11px] font-bold text-slate-800">Admin User</span>
                                    <span className="text-[10px] font-medium text-slate-400 tracking-tight">admin@digitalerp.com</span>
                                </div>
                             </div>
                        </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild 
                            size="default" 
                            className="w-full justify-start rounded-lg hover:bg-destructive/10 hover:text-destructive group transition-colors px-3 h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" 
                            onClick={handleLinkClick}
                        >
                            <Link href="/login" className="flex items-center gap-3">
                                <LogOut className="size-4.5 opacity-70 group-hover:opacity-100" />
                                {!isCollapsed && <span className="text-[13px] font-semibold">Sign Out</span>}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

