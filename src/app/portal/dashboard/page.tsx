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
            <div className="bg-[#D3E9E0] border border-[#B8DDCF] p-5 rounded-xl shadow-sm relative overflow-hidden group">
                <div className="flex flex-col gap-2 relative z-10">
                    <h2 className="text-xl font-black text-[#2D5A47]">Welcome back, <span className="underline decoration-wavy decoration-[#5CB85C] underline-offset-4">Praveen Kumar!</span></h2>
                    <p className="text-sm font-medium text-[#4A856D] leading-relaxed max-w-3xl">
                        From your account dashboard, you can easily check & view your recent orders, manage your shipping and billing addresses and edit your password and account details.
                    </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-200/20 to-transparent pointer-events-none" />
            </div>

            {/* ── Financial Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-xl border-none bg-blue-600 shadow-xl shadow-blue-200 p-6 relative overflow-hidden group">
                    <div className="space-y-2 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Credit Limit</p>
                        <h2 className="text-3xl font-black text-white leading-none">₹50,000.00</h2>
                    </div>
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                </Card>

                <Card className="rounded-xl border-none bg-rose-500 shadow-xl shadow-rose-200 p-6 relative overflow-hidden group">
                    <div className="space-y-2 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-100">Used Credit</p>
                        <h2 className="text-3xl font-black text-white leading-none">₹0.00</h2>
                    </div>
                </Card>

                <Card className="rounded-xl border-none bg-emerald-600 shadow-xl shadow-emerald-200 p-6 relative overflow-hidden group flex justify-between items-center">
                    <div className="space-y-2 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">Available Balance</p>
                        <h2 className="text-3xl font-black text-white leading-none">₹50,000.00</h2>
                    </div>
                    <div className="text-right z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 bg-emerald-700 px-3 py-1 rounded-full border border-emerald-500/30">30 Days</span>
                    </div>
                </Card>
            </div>

            {/* ── Recent Orders ── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Orders</h3>
                    <Button variant="link" className="text-blue-600 font-bold text-xs uppercase tracking-wider" asChild>
                        <Link href="#">View All</Link>
                    </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order #</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="group hover:bg-slate-50/30 transition-all border-b border-slate-100 last:border-0">
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">{order.id}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-slate-600 uppercase">{order.date}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <Badge className="bg-slate-200 text-slate-600 border-none font-bold text-[9px] uppercase tracking-tighter h-5 px-3">
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-black text-slate-800">{order.total}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Button size="sm" variant="outline" className="h-8 px-4 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-[10px] uppercase tracking-wider shadow-sm">
                                                View
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
