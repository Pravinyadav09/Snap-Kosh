"use client"

import React from "react"
import {
    Mail, Phone, Facebook, Instagram, Twitter, Linkedin,
    Search, ShoppingBag, User, LogOut,
    LayoutDashboard, ShoppingCart, MapPin, Ticket, UserCircle,
    ChevronRight
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/portal/dashboard" },
        { label: "My Orders", icon: ShoppingCart, href: "/portal/orders" },
        { label: "Profile", icon: UserCircle, href: "/portal/profile" },
        { label: "Logout", icon: LogOut, href: "/portal/login", variant: "danger" }
    ]

    // If it's the login page, don't show the dashboard layout (sidebar, header, footer)
    const isLoginPage = pathname?.startsWith('/portal/login');

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="portal-theme min-h-screen bg-[#F8F9FA] font-sans flex flex-col">

            {/* ── Header ── */}
            <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
                    <Link href="/portal/dashboard" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform" style={{ background: 'var(--primary)' }}>
                            M
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-none">Mann Graphics</span>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] mt-1">Creative Print Solutions</span>
                        </div>
                    </Link>

                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-64 shrink-0">
                        <Card className="rounded-3xl border-none text-white shadow-2xl p-8 relative overflow-hidden group sticky top-24" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #3d1862 100%)' }}>
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 mb-6 px-1">Main Menu</h3>
                                    <nav className="space-y-2">
                                        {navItems.map((item) => {
                                            const isActive = pathname === item.href;
                                            return (
                                                <Link
                                                    key={item.label}
                                                    href={item.href}
                                                    className={`
                                                        flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group/item
                                                        ${isActive 
                                                            ? "bg-white text-[var(--primary)] shadow-lg shadow-black/20 font-black" 
                                                            : item.variant === "danger"
                                                                ? "text-rose-200 hover:bg-rose-500/20 hover:text-white"
                                                                : "text-white/70 hover:bg-white/10 hover:text-white"
                                                        }
                                                    `}
                                                >
                                                    <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover/item:scale-110'}`} />
                                                    <span className="text-sm tracking-tight">{item.label}</span>
                                                    {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/5 rounded-full blur-3xl" />
                        </Card>
                    </aside>

                    {/* ── Main Content ── */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>

            {/* ── Footer ── */}
            <footer className="bg-[#1A1A1A] text-white pt-16 pb-8 px-6 mt-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-6">
                            <h4 className="text-lg font-black uppercase tracking-wider">About Us</h4>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                Welcome to our premium e-commerce store. We consider our customers as our family and we love to serve them with high-quality printing solutions.
                            </p>
                            <div className="space-y-4 pt-2">
                                <div className="flex items-start gap-3 group shrink-0">
                                    <MapPin className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
                                    <span className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-white transition-colors">Vill Raipur D48, Meerut, UP</span>
                                </div>
                                <div className="flex items-center gap-3 group shrink-0">
                                    <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                                    <span className="text-xs text-slate-400 font-medium group-hover:text-white transition-colors">09540046568</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-lg font-black uppercase tracking-wider">Quick Links</h4>
                            <ul className="space-y-3">
                                {["Home", "Shop", "Categories", "Pricing", "Order Tracking"].map(link => (
                                    <li key={link}>
                                        <Link href="#" className="text-sm text-slate-400 hover:text-blue-500 font-medium transition-colors flex items-center gap-2 group">
                                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all font-black text-blue-500" />
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-lg font-black uppercase tracking-wider">Support</h4>
                            <ul className="space-y-3">
                                {["Contact Us", "FAQ", "Private Policy", "Terms & Conditions", "Returns"].map(link => (
                                    <li key={link}>
                                        <Link href="#" className="text-sm text-slate-400 hover:text-blue-500 font-medium transition-colors flex items-center gap-2 group">
                                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all font-black text-blue-500" />
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-lg font-black uppercase tracking-wider">Newsletter</h4>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                Subscribe to our newsletter for latest updates and offers regarding our print services.
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter your email"
                                    className="h-11 rounded-lg bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-blue-500/20"
                                />
                                <Button className="h-11 px-6 font-bold rounded-lg shadow-lg text-white" style={{ background: 'var(--primary)' }}>
                                    Subscribe
                                </Button>
                            </div>
                            <div className="flex items-center gap-4 pt-4 opacity-50">
                                <Facebook className="h-5 w-5 hover:text-blue-500 cursor-pointer transition-colors" />
                                <Instagram className="h-5 w-5 hover:text-pink-500 cursor-pointer transition-colors" />
                                <Twitter className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors" />
                                <Linkedin className="h-5 w-5 hover:text-blue-600 cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        <p>© 2026 MANN GRAPHICS • DIGITAL ERP PORTAL. ALL RIGHTS RESERVED.</p>
                        <div className="flex items-center gap-6">
                            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                            <span className="hover:text-white cursor-pointer transition-colors">System Status</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
