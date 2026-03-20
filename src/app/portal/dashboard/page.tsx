"use client"

import React, { useState } from "react"
import {
    LayoutDashboard,
    CreditCard,
    ArrowUpRight,
    History,
    CheckCircle2,
    Clock,
    FileText,
    Download,
    LogOut,
    ChevronRight,
    Search,
    IndianRupee,
    AlertCircle,
    UserCircle,
    Eye
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const recentOrders = [
    { id: "ORD-YDK6I8QORO", date: "13 Feb, 2026", status: "Received", total: "₹2,297.46" },
]

export default function ClientPortalDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase tracking-wider">Dashboard</h1>
            </div>

            {/* ── Welcome Message ── */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--primary)]/10 bg-gradient-to-br from-[var(--primary)]/10 via-white to-white p-8 shadow-sm group">
                <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shadow-lg">
                            <UserCircle className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            Welcome back, <span className="text-[var(--primary)] underline decoration-wavy underline-offset-8 decoration-[var(--primary)]/30">Praveen Kumar!</span>
                        </h2>
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl ml-12">
                        From your account dashboard, you can easily check & view your recent orders, manage your shipping and billing addresses and edit your password and account details.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 bg-[var(--primary)]/5 rounded-full blur-3xl" />
            </div>

            {/* ── Financial Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl border-none bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 shadow-xl shadow-[var(--primary)]/20 p-6 relative overflow-hidden group">
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Credit Limit</p>
                            <CreditCard className="h-4 w-4 text-white/50" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">₹50,000.00</h2>
                    </div>
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                </Card>

                <Card className="rounded-2xl border-none bg-gradient-to-br from-rose-500 to-rose-600 shadow-xl shadow-rose-500/20 p-6 relative overflow-hidden group">
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-100/70">Used Credit</p>
                            <History className="h-4 w-4 text-rose-100/50" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">₹0.00</h2>
                    </div>
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                </Card>

                <Card className="rounded-2xl border-none bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/20 p-6 relative overflow-hidden group">
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/70">Available Balance</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/20">30 Days</span>
                                <IndianRupee className="h-4 w-4 text-emerald-100/50" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">₹50,000.00</h2>
                    </div>
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                </Card>
            </div>

            {/* ── Recent Orders ── */}
            <div className="space-y-6 pt-4">
                <div className="flex items-end justify-between border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            Recent Orders
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your latest transactions</p>
                    </div>
                    <Button variant="link" className="text-[var(--primary)] font-black text-[10px] uppercase tracking-wider p-0 h-auto" asChild>
                        <Link href="/portal/orders" className="flex items-center gap-1 group">
                            View All <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Order #</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-[var(--primary)] hover:underline cursor-pointer">{order.id}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-600 tabular-nums uppercase">{order.date}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[9px] uppercase tracking-wider h-6 px-4 rounded-full">
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-slate-900 tracking-tight">{order.total}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Button size="sm" variant="outline" className="h-9 px-6 rounded-full border-slate-200 text-slate-600 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95" asChild>
                                                <Link href={`/portal/orders?id=${order.id}`}>View Details</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
