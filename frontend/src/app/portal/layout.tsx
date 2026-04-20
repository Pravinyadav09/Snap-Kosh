"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { API_BASE } from '@/lib/api'
import { 
    LayoutDashboard, 
    ShoppingCart, 
    FileText, 
    History, 
    Settings, 
    LogOut, 
    ChevronRight,
    Search,
    User,
    Menu,
    X,
    Bell,
    MapPin,
    Phone,
    Mail,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Ticket,
    UserCircle,
    PanelLeft,
    PanelLeftClose
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
    Sheet, 
    SheetContent, 
    SheetTrigger
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

interface NavItem {
    label: string
    href: string
    icon: any
    variant?: "default" | "danger"
}

const navItems: NavItem[] = [
    { label: "My Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
    { label: "Order Status", href: "/portal/orders", icon: ShoppingCart },
    { label: "My Estimates", href: "/portal/quotations", icon: Ticket },
    { label: "Account Ledger", href: "/portal/ledger", icon: FileText },
    { label: "Service Support", href: "/portal/support", icon: History },
    { label: "Portal Settings", href: "/portal/settings", icon: Settings },
    { label: "Logout System", href: "/login?tab=client", icon: LogOut, variant: "danger" },
]

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [customer, setCustomer] = useState<any>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const stored = localStorage.getItem("portal_customer")
        if (!stored && pathname !== "/login") {
            router.push("/login?tab=client")
        } else if (stored) {
            const parsed = JSON.parse(stored)
            setCustomer(parsed)
            fetchNotifications(parsed.id)
        }
    }, [pathname, router])

    const fetchNotifications = async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/portal/notifications/${id}`)
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
                setUnreadCount(data.filter((n: any) => !n.isRead).length)
            }
        } catch (err) {}
    }

    const markAsRead = async (nid: number) => {
        try {
            await fetch(`${API_BASE}/api/portal/notifications/read/${nid}`, { method: 'POST' })
            if (customer) fetchNotifications(customer.id)
        } catch (err) {}
    }

    const isLoginPage = pathname?.startsWith("/portal/login")

    if (isLoginPage) {
        return <div className="portal-theme min-h-screen bg-slate-50">{children}</div>
    }

    const SidebarContent = ({ isMobile = false }) => (
        <div className="flex flex-col h-full overflow-hidden">
            <div className={`p-5 min-h-[80px] border-b border-slate-100 bg-slate-50 flex items-center ${!isSidebarOpen && !isMobile ? 'justify-center' : 'px-8'}`}>
                <Link href="/portal/dashboard" className="flex items-center gap-3 group shrink-0">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:rotate-12 transition-all duration-500 shrink-0" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #3d1862 100%)' }}>
                        M
                    </div>
                    { (isSidebarOpen || isMobile) && (
                        <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-sm font-black text-slate-800 uppercase tracking-[0.1em] leading-none font-heading whitespace-nowrap italic">Enterprise Portal</span>
                            <span className="text-[8px] uppercase font-bold text-slate-500 tracking-[0.2em] mt-1.5 font-sans whitespace-nowrap">Digital Operations Core</span>
                        </div>
                    )}
                </Link>
            </div>

            <nav className={`flex-1 overflow-y-auto p-4 space-y-2 pt-6 scrollbar-none font-sans ${!isSidebarOpen && !isMobile ? 'items-center' : ''}`}>
                <p className={`px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 font-heading transition-opacity duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 h-0 my-0 overflow-hidden' : 'opacity-40'}`}>Core Platform</p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    if (item.variant === "danger") return null;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            title={!isSidebarOpen ? item.label : ""}
                            className={`
                                flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group relative
                                ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}
                                ${isActive 
                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200/50 font-bold" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }
                            `}
                        >
                            <item.icon className={`h-5 w-5 transition-all duration-500 shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`} />
                            {(isSidebarOpen || isMobile) && <span className="text-[13px] tracking-tight font-bold whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-300">{item.label}</span>}
                            {isActive && (isSidebarOpen || isMobile) && <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] ml-auto shadow-lg shadow-[var(--primary)]/50" />}
                        </Link>
                    );
                })}

                <div className={`pt-8 transition-opacity duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 h-0 my-0 overflow-hidden' : 'opacity-40'}`}>
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 font-heading whitespace-nowrap">Support & Exit</p>
                </div>
                {navItems.filter(i => i.variant === "danger").map(item => (
                    <Link
                        key={item.label}
                        href={item.href}
                        title={!isSidebarOpen ? item.label : ""}
                        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group font-medium ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}`}
                    >
                        <item.icon className="h-5 w-5 group-hover:scale-110 shrink-0" />
                        {(isSidebarOpen || isMobile) && <span className="text-[13px] tracking-tight font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-300">{item.label}</span>}
                    </Link>
                ))}
            </nav>

            <div className={`p-6 border-t border-slate-100 bg-slate-50 transition-all duration-300 ${!isSidebarOpen && !isMobile ? 'px-4' : ''}`}>
                <div className={`flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}`}>
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-black shrink-0">
                        <Search className="h-4 w-4" />
                    </div>
                    {(isSidebarOpen || isMobile) && (
                        <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider font-heading whitespace-nowrap">Quick Search</span>
                            <span className="text-[9px] font-medium text-slate-500 font-sans whitespace-nowrap">Shortcut: Ctrl+K</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="portal-theme h-screen bg-[#F8F9FA] font-sans flex flex-col overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* ── Desktop Sidebar ── */}
                <aside className={`
                    hidden lg:flex flex-col bg-white text-slate-900 shrink-0 border-r border-slate-100 relative z-50 
                    transition-all duration-300 ease-in-out sticky top-0 h-screen overflow-hidden
                    ${isSidebarOpen ? 'w-72' : 'w-20'}
                `}>
                    <SidebarContent />
                </aside>

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden font-sans">
                    {/* ── Header ── */}
                    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-40 backdrop-blur-md bg-white/80">
                        <div className="flex items-center gap-4">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-900 border border-slate-100 shadow-sm transition-all active:scale-95">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 bg-white border-none w-72">
                                    <SidebarContent isMobile />
                                </SheetContent>
                            </Sheet>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="hidden lg:flex h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-900 border border-slate-100 shadow-sm transition-all active:scale-95"
                            >
                                {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                            </Button>

                            <div className="hidden lg:block space-y-0.5 ml-1">
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none font-heading">Enterprise Management</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Digital Operations Core</p>
                            </div>
                            
                            <div className="lg:hidden flex flex-col">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-[0.1em] leading-none font-heading italic">Digital ERP</span>
                                <span className="text-[8px] font-bold text-[var(--primary)] uppercase tracking-widest mt-1">PORTAL PRO</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 lg:h-10 lg:w-10 text-slate-400 hover:bg-white hover:text-slate-900 transition-all rounded-xl relative group">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border-2 border-slate-50 group-hover:border-white animate-pulse" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 p-0 rounded-2xl border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" align="end" sideOffset={8}>
                                    <DropdownMenuLabel className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Notifications Center</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">System Updates & Alerts</span>
                                        </div>
                                        <Badge className="bg-[var(--primary)] text-white text-[8px] font-black">{unreadCount} New</Badge>
                                    </DropdownMenuLabel>
                                    <ScrollArea className="h-[350px]">
                                        {notifications.length === 0 ? (
                                            <div className="p-12 text-center space-y-3">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto border border-slate-100 opacity-40">
                                                    <Bell className="h-6 w-6 text-slate-300" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Inbox is Refreshing...</p>
                                            </div>
                                        ) : (
                                            notifications.map((n, i) => (
                                                <DropdownMenuItem 
                                                    key={n.id} 
                                                    onClick={() => markAsRead(n.id)}
                                                    className="flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-slate-50/80 border-b border-slate-50 last:border-none group relative transition-all"
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <Badge variant="outline" className={`h-4 text-[7px] font-black uppercase tracking-widest ${
                                                            n.type === 'PRODUCTION' ? 'border-amber-500/20 text-amber-500' :
                                                            n.type === 'PAYMENT' ? 'border-emerald-500/20 text-emerald-500' :
                                                            'border-slate-500/20 text-slate-500'
                                                        }`}>
                                                            {n.type}
                                                        </Badge>
                                                        <span className="text-[8px] font-bold text-slate-300 uppercase italic">
                                                            {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'Just now'}
                                                        </span>
                                                    </div>
                                                    <h6 className="text-[11px] font-black text-slate-800 tracking-tight leading-snug group-hover:text-[var(--primary)] transition-colors">{n.title}</h6>
                                                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed font-sans line-clamp-2" dangerouslySetInnerHTML={{ __html: n.message }} />
                                                    {!n.isRead && <div className="absolute top-1/2 -right-0.5 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-sm shadow-[var(--primary)]/50" />}
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                    </ScrollArea>
                                    <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                                        <Button variant="ghost" className="w-full h-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[var(--primary)] hover:bg-white transition-all">Clear All History</Button>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* ── Main Content Area ── */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide scroll-smooth bg-slate-50/30">
                        <div className="max-w-[1600px] mx-auto w-full h-full space-y-12 pb-24">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

        </div>
    )
}
