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
    LifeBuoy,
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
    Banknote,
    Undo2,
    Database,
    ListChecks,
    PackageMinus
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/components/shared/permission-context"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
    SidebarSeparator,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const menuGroups = [
    {
        label: "Core",
        icon: LayoutDashboard,
        items: [
            { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, moduleId: "dashboard" },
        ]
    },
    {
        label: "CRM & Sales",
        icon: Users,
        items: [
            { title: "Customers", url: "/customers", icon: UserCircle, moduleId: "customers" },
            { title: "Customer Analysis", url: "/customers/analysis", icon: BarChart3, moduleId: "customers_analysis" },
            { title: "Quotations", url: "/estimator", icon: Calculator, moduleId: "quotations" },
            { title: "Invoices", url: "/invoices", icon: FileText, moduleId: "invoices" },
            { title: "Client Portals", url: "/login?tab=client", icon: ExternalLink, moduleId: "client_portals" },
        ]
    },
    {
        label: "Production",
        icon: Activity,
        items: [
            { title: "Create Job Card", url: "/jobs", icon: Activity, moduleId: "production" },
            { title: "Scheduler", url: "/scheduler", icon: CalendarIcon, moduleId: "scheduler" },
            { title: "Daily Readings", url: "/daily-readings", icon: BookOpen, moduleId: "readings" },
        ]
    },
    {
        label: "Inventory",
        icon: Package,
        items: [
            { title: "Purchase Order", url: "/inventory/purchases", icon: ShoppingCart, moduleId: "purchases" },
            { title: "GRN (Stock In)", url: "/inventory", icon: Layers, moduleId: "inventory" },
            { title: "Return to Supplier", url: "/inventory/returns", icon: Undo2, moduleId: "returns" },
            { title: "Item Consumption", url: "/inventory/consumption", icon: PackageMinus, moduleId: "inventory" },
            { title: "Stock", url: "/inventory/stock", icon: Package, moduleId: "stock" },
        ]
    },
    {
        label: "Masters",
        icon: Database,
        items: [
            { title: "Master Hub", url: "/masters", icon: Database, moduleId: "masters" },
            { title: "Machine Master", url: "/machines", icon: Gauge, moduleId: "machines" },
            { title: "Paper Stocks Master", url: "/inventory/paper-stocks", icon: Boxes, moduleId: "paper_stocks" },
            { title: "Media Stocks Master", url: "/inventory/media-stocks", icon: Maximize2, moduleId: "media_stocks" },
            { title: "Suppliers Master", url: "/inventory/suppliers", icon: Users2, moduleId: "suppliers" },
            { title: "Process Masters", url: "/management/processes", icon: Cog, moduleId: "processes" },
            { title: "User Master", url: "/management/users", icon: Users, moduleId: "users" },
            { title: "Role Master", url: "/management/roles", icon: UserCog, moduleId: "roles" },
            { title: "Dropdown Master", url: "/settings/dropdowns", icon: ListChecks, moduleId: "dropdowns" },
        ]
    },
    {
        label: "Logistics",
        icon: Truck,
        items: [
            { title: "Dispatch Board", url: "/dispatch", icon: Truck, moduleId: "dispatch" },
        ]
    },
    {
        label: "Finance",
        icon: Wallet,
        items: [
            { title: "Job Finance", url: "/finance/job-finance", icon: Banknote, moduleId: "job_finance" },
            { title: "Expenses", url: "/finance/expenses", icon: CreditCard, moduleId: "finance" },
            { title: "Expense Categories", url: "/finance/categories", icon: Tag, moduleId: "expense_categories" },
        ]
    },
    {
        label: "Outsource",
        icon: ExternalLink,
        items: [
            { title: "Vendors", url: "/outsource/vendors", icon: Users2, moduleId: "vendors" },
            { title: "Outsource Jobs", url: "/outsource/jobs", icon: ExternalLink, moduleId: "outsource_jobs" },
        ]
    },
    {
        label: "Maintenance",
        icon: Wrench,
        items: [
            { title: "Maintenance Center", url: "/maintenance", icon: Wrench, moduleId: "maintenance" },
            { title: "My Tasks", url: "/tasks", icon: ClipboardCheck, moduleId: "tasks" },
        ]
    },
    {
        label: "Reports",
        icon: BarChart3,
        items: [
            { title: "Reports", url: "/reports", icon: BarChart3, moduleId: "reports" },
            { title: "Paper Usage Ledger", url: "/reports/ledger", icon: FileSpreadsheet, moduleId: "ledger" },
            { title: "GST Reports", url: "/reports/gst", icon: Landmark, moduleId: "gst" },
        ]
    },
    {
        label: "Management",
        icon: Settings,
        items: [
            { title: "Support Intelligence", url: "/management/support", icon: LifeBuoy, moduleId: "support" },
            { title: "Settings", url: "/settings", icon: Settings, moduleId: "settings" },
        ]
    },
    {
        label: "Assistant",
        icon: CalendarIcon,
        items: [
            { title: "Google Tasks", url: "/google-tasks", icon: ClipboardList, moduleId: "tasks" },
        ]
    }
]

export function AppSidebar() {
    const pathname = usePathname()
    const { setOpenMobile, setOpen, isMobile, state } = useSidebar()

    const [userName, setUserName] = React.useState("")
    const [userEmail, setUserEmail] = React.useState("")

    React.useEffect(() => {
        const name = localStorage.getItem("user_name")
        const email = localStorage.getItem("user_email")
        if (name && name !== "undefined") setUserName(name)
        if (email && email !== "undefined") setUserEmail(email)
    }, [])

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("erp_token")
        localStorage.removeItem("user_name")
        localStorage.removeItem("user_role")
        localStorage.removeItem("user_email")
        handleLinkClick()
    }

    const isCollapsed = state === "collapsed"

    return (
        <Sidebar collapsible="icon" className="border-r border-slate-200/80 bg-white font-sans">
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
                                        <span className="text-sm font-bold tracking-tight text-slate-800 uppercase">Digital ERP</span>
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
                <SidebarMenu>
                    {menuGroups.map((group) => {
                        const { hasPermission, isAdmin } = usePermissions()
                        
                        // Filter items that the user has "view" permission for
                        const visibleItems = group.items.filter(item => 
                            isAdmin || hasPermission(item.moduleId || "", "view")
                        )

                        // If no items are visible, hide the whole group
                        if (visibleItems.length === 0) return null

                        const hasSubItems = visibleItems.length > 1
                        const isAnySubActive = visibleItems.some(item => pathname === item.url)

                        return (
                            <React.Fragment key={group.label}>
                                {hasSubItems ? (
                                    isCollapsed ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                    <SidebarMenuButton 
                                                        tooltip={group.label}
                                                        isActive={isAnySubActive}
                                                        className={cn(
                                                            "w-full flex-col justify-center items-center h-auto min-h-[52px] py-2 gap-1 transition-all duration-300 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:!size-auto",
                                                            isAnySubActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        <group.icon className="size-4 shrink-0 transition-transform group-hover:scale-110" />
                                                        <span className="text-[9px] font-bold uppercase tracking-tight leading-none truncate max-w-[56px] text-center opacity-80">{group.label}</span>
                                                    </SidebarMenuButton>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="right" align="start" className="w-56 ml-2 p-2 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border-slate-200 bg-white/95 backdrop-blur-md">
                                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-black px-2 py-1.5">{group.label}</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-slate-100 mx-1 mb-1" />
                                                <div className="space-y-0.5">
                                                    {visibleItems.map((subItem) => {
                                                        const isSubActive = pathname === subItem.url
                                                        return (
                                                            <DropdownMenuItem key={subItem.title} asChild>
                                                                <Link 
                                                                    href={subItem.url} 
                                                                    onClick={handleLinkClick}
                                                                    className={cn(
                                                                        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all outline-none",
                                                                        isSubActive 
                                                                            ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5" 
                                                                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                                                    )}
                                                                >
                                                                    <subItem.icon className={cn("size-4 shrink-0 transition-colors", isSubActive ? "text-primary" : "opacity-70")} />
                                                                    <span className="text-sm">{subItem.title}</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )
                                                    })}
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Collapsible
                                            asChild
                                            defaultOpen={isAnySubActive}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton 
                                                        tooltip={group.label}
                                                        className="w-full text-slate-800 hover:bg-slate-50 font-bold transition-colors"
                                                    >
                                                        <group.icon className="size-5 shrink-0" />
                                                        {!isCollapsed && <span>{group.label}</span>}
                                                        <ChevronRight className="ml-auto size-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 text-slate-300" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub className="ml-4 border-l border-slate-100 gap-0.5 py-1">
                                                        {visibleItems.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton 
                                                                    asChild 
                                                                    isActive={pathname === subItem.url}
                                                                    className={cn(
                                                                        "h-8 transition-all px-3",
                                                                        pathname === subItem.url ? "bg-primary/5 text-primary" : "text-slate-500 hover:text-slate-900"
                                                                    )}
                                                                >
                                                                    <Link href={subItem.url} onClick={handleLinkClick} className="flex items-center gap-2.5">
                                                                        <subItem.icon className={cn("size-3.5", pathname === subItem.url ? "text-primary" : "opacity-60")} />
                                                                        <span className="text-[12px] font-medium">{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    )
                                ) : (
                                    <SidebarMenuItem>
                                        {(() => {
                                            const Icon = visibleItems[0].icon
                                            const shortLabel = visibleItems[0].title.split(' ')[0]
                                            return (
                                                <SidebarMenuButton
                                                    asChild
                                                    tooltip={visibleItems[0].title}
                                                    isActive={pathname === visibleItems[0].url}
                                                    className={cn(
                                                        "w-full font-bold transition-all duration-300",
                                                        pathname === visibleItems[0].url ? "bg-primary/10 text-primary" : "text-slate-800 hover:bg-slate-50",
                                                        isCollapsed && "flex-col justify-center items-center h-auto min-h-[52px] py-2 gap-1 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:!size-auto"
                                                    )}
                                                >
                                                    <Link href={visibleItems[0].url} onClick={handleLinkClick} className={cn("flex items-center gap-2", isCollapsed && "flex-col gap-1")}>
                                                        <Icon className={cn("shrink-0 transition-transform group-hover:scale-110", isCollapsed ? "size-4" : "size-5")} />
                                                        {isCollapsed 
                                                            ? <span className="text-[9px] font-bold uppercase tracking-tight leading-none text-slate-600 truncate max-w-[56px] text-center opacity-80">{shortLabel}</span>
                                                            : <span>{visibleItems[0].title}</span>
                                                        }
                                                    </Link>
                                                </SidebarMenuButton>
                                            )
                                        })()}
                                    </SidebarMenuItem>
                                )}
                            </React.Fragment>
                        )
                    })}
                </SidebarMenu>
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
                                    <span className="text-[11px] font-bold text-slate-800">{userName}</span>
                                    <span className="text-[10px] font-medium text-slate-400 tracking-tight">{userEmail}</span>
                                </div>
                             </div>
                        </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            asChild 
                            size="default" 
                            className="w-full justify-start rounded-lg hover:bg-destructive/10 hover:text-destructive group transition-colors px-3 h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" 
                            onClick={handleLogout}
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

