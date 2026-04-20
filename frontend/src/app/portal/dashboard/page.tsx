"use client"
import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
    Eye,
    MessageSquare,
    Headset,
    HelpCircle,
    LifeBuoy,
    ShoppingCart,
    User,
    ShieldCheck
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"

export default function ClientPortalDashboard() {
    const router = useRouter()
    const [customer, setCustomer] = useState<any>(null)
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({ 
        creditLimit: 0, 
        usedCredit: 0, 
        balance: 0,
        totalOrders: 0,
        activeJobs: 0,
        completedOrders: 0,
        pendingPayment: 0
    })

    useEffect(() => {
        const stored = localStorage.getItem("portal_customer")
        if (stored) {
            const cust = JSON.parse(stored)
            setCustomer(cust)
            
            // Fetch everything and set loading false when done
            Promise.all([
                fetchOrders(cust.id),
                fetchInvoices(cust.id)
            ]).finally(() => {
                setIsLoading(false)
            })
            
            setStats(prev => ({ ...prev, creditLimit: cust.creditLimit || 0, balance: cust.creditLimit || 0 }))
        } else {
            router.push("/portal/login")
        }
    }, [])

    const orderColumns: ColumnDef<any>[] = [
        { 
            key: "id", 
            label: "Order #",
            render: (val) => <span className="text-xs font-black text-[var(--primary)] hover:underline cursor-pointer">#{val}</span>
        },
        { 
            key: "date", 
            label: "Booking Date",
            render: (val) => <span className="text-xs font-bold text-slate-500 tabular-nums">{val}</span>
        },
        { 
            key: "status", 
            label: "Status",
            render: (val) => (
                <Badge className={`border-none font-bold text-[9px] uppercase tracking-wider h-6 px-4 rounded-full ${
                    val === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                    val === 'In Production' ? 'bg-amber-50 text-amber-600' :
                    val === 'Pending' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                    {val}
                </Badge>
            )
        },
        { 
            key: "approved", 
            label: "Verification",
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    {row.isApproved ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[9px] uppercase tracking-wider">
                            <ShieldCheck className="h-3 w-3" /> Approved
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-wider italic">
                            Awaiting Tech Review
                        </div>
                    )}
                </div>
            )
        },
        { 
            key: "total", 
            label: "Total Amount",
            render: (val) => <span className="text-xs font-black text-slate-900">{val}</span>
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={!row.isApproved}
                    className={cn(
                        "h-8 px-4 rounded-xl border-slate-200 font-bold text-[9px] uppercase tracking-widest transition-all",
                        row.isApproved 
                            ? "text-slate-600 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)]" 
                            : "text-slate-300 border-slate-100 italic"
                    )} 
                    asChild={row.isApproved}
                >
                    {row.isApproved ? (
                        <Link href={`/portal/orders?id=${row.id}`}>View Job Card</Link>
                    ) : (
                        <span>Locked</span>
                    )}
                </Button>
            )
        }
    ]

    const fetchOrders = async (id: number) => {
        try {
            const response = await fetch(`${API_BASE}/api/portal/jobs/${id}`)
            if (response.ok) {
                const data = await response.json()
                const mappedOrders = (data || []).map((job: any) => ({
                    id: job.jobNumber,
                    date: new Date(job.bookingDate || job.createdAt).toLocaleDateString('en-GB'),
                    status: job.status,
                    isApproved: job.isApproved,
                    total: `₹${(job.totalCost || 0).toLocaleString()}`,
                    rawCost: job.totalCost || 0,
                    service: job.jobName || "Standard Printing"
                }))
                setRecentOrders(mappedOrders.slice(0, 5))
                
                const active = (data || []).filter((j: any) => j.status !== 'Completed' && j.status !== 'Delivered').length
                const completed = (data || []).filter((j: any) => j.status === 'Completed' || j.status === 'Delivered').length
                
                setStats(prev => ({ 
                    ...prev, 
                    totalOrders: data.length,
                    activeJobs: active,
                    completedOrders: completed
                }))
            }
        } catch (err) {}
    }

    const fetchInvoices = async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/portal/invoices/${id}`)
            if (res.ok) {
                const data = await res.json()
                let used = 0
                let pendingAmount = 0
                data.forEach((inv: any) => { 
                    if(inv.paymentStatus === 'Unpaid' || inv.paymentStatus === 'Part Paid') {
                        used += inv.grandTotal 
                        pendingAmount += inv.grandTotal
                    }
                })
                setStats(prev => ({
                    ...prev,
                    usedCredit: used,
                    balance: prev.creditLimit - used,
                    pendingPayment: pendingAmount
                }))
            }
        } catch (err) {}
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* ── 1. Top Performance KPIs Skeleton ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="rounded-2xl border-none shadow-lg h-32 bg-slate-200/50">
                            <CardHeader className="pb-2">
                                 <Skeleton className="h-3 w-20 bg-slate-300" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-24 bg-slate-300 mb-2" />
                                <Skeleton className="h-3 w-16 bg-slate-300 rounded-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── 2. Welcome Message Skeleton ── */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-11 w-11 rounded-xl bg-slate-100" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48 bg-slate-100" />
                                    <Skeleton className="h-3 w-32 bg-slate-100" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full max-w-xl ml-14 bg-slate-50" />
                            <Skeleton className="h-4 w-3/4 max-w-xl ml-14 bg-slate-50" />
                        </div>
                        <div className="flex shrink-0 items-center gap-6 px-6 border-l border-slate-100">
                             <div className="space-y-2">
                                <Skeleton className="h-3 w-24 bg-slate-100" />
                                <Skeleton className="h-8 w-32 bg-slate-200" />
                                <Skeleton className="h-3 w-28 bg-slate-100" />
                             </div>
                        </div>
                    </div>
                </div>

                {/* ── 3. Recent Transactions Skeleton ── */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Skeleton className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        <Skeleton className="h-3 w-40 bg-slate-200" />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Skeleton key={i} className="h-4 w-20 bg-slate-100" />
                                ))}
                            </div>
                            {[1, 2, 3, 4, 5].map(row => (
                                <div key={row} className="flex justify-between py-2">
                                    {[1, 2, 3, 4, 5].map(col => (
                                        <Skeleton key={col} className="h-4 w-20 bg-slate-50" />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* ── 1. Top Performance KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full px-0.5 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
                {/* 1. Total Orders */}
                <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 min-w-0">
                    <div className="absolute top-0 right-0 p-1.5 sm:p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <ShoppingCart className="size-6 sm:size-16" />
                    </div>
                    <CardHeader className="p-3 sm:pb-2 space-y-0">
                        <CardTitle className="text-[7px] sm:text-[11px] font-black uppercase tracking-widest opacity-80 leading-none truncate font-heading">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                        <div className="text-base sm:text-3xl font-black tabular-nums font-heading">{stats.totalOrders}</div>
                        <p className="hidden sm:block text-[7px] sm:text-[10px] font-black mt-1 bg-white/20 w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">Order History</p>
                    </CardContent>
                </Card>

                {/* 2. Active Jobs */}
                <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 min-w-0">
                    <div className="absolute top-0 right-0 p-1.5 sm:p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Clock className="size-6 sm:size-16 animate-spin-slow" />
                    </div>
                    <CardHeader className="p-3 sm:pb-2 space-y-0">
                        <CardTitle className="text-[7px] sm:text-[11px] font-black uppercase tracking-widest opacity-80 leading-none truncate font-heading">Active Jobs</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                        <div className="text-base sm:text-3xl font-black tabular-nums truncate font-heading">{stats.activeJobs}</div>
                        <p className="hidden sm:block text-[7px] sm:text-[10px] font-black mt-1 bg-white/20 w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">In Process</p>
                    </CardContent>
                </Card>

                {/* 3. Pending Payment */}
                <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 min-w-0">
                    <div className="absolute top-0 right-0 p-1.5 sm:p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <IndianRupee className="size-6 sm:size-16" />
                    </div>
                    <CardHeader className="p-3 sm:pb-2 space-y-0">
                        <CardTitle className="text-[7px] sm:text-[11px] font-black uppercase tracking-widest opacity-80 leading-none truncate font-heading">Dues Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                        <div className="text-base sm:text-3xl font-black tabular-nums truncate font-heading">₹{stats.pendingPayment >= 1000 ? (stats.pendingPayment / 1000).toFixed(1) + 'k' : stats.pendingPayment}</div>
                        <p className="hidden sm:block text-[7px] sm:text-[10px] font-black mt-1 bg-white/20 w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">Regulatory Dues</p>
                    </CardContent>
                </Card>

                {/* 4. Completed Orders */}
                <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 min-w-0">
                    <div className="absolute -bottom-2 -right-2 opacity-20 transform group-hover:rotate-12 transition-transform duration-700">
                        <CheckCircle2 className="size-10 sm:size-24" />
                    </div>
                    <CardHeader className="p-3 sm:pb-2 space-y-0">
                        <CardTitle className="text-[7px] sm:text-[11px] font-black uppercase tracking-widest opacity-80 leading-none truncate font-heading">Completed</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                        <div className="text-base sm:text-3xl font-black tabular-nums truncate font-heading">{stats.completedOrders}</div>
                        <p className="hidden sm:block text-[7px] sm:text-[10px] font-black mt-1 bg-white/20 w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">Delivered</p>
                    </CardContent>
                </Card>
            </div>

            {/* ── 2. Welcome Message ── */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center text-[var(--primary)] shadow-sm">
                                <UserCircle className="h-6 w-6" />
                            </div>
                            <div className="space-y-0.5">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                                    Hello, <span className="text-[var(--primary)]">{customer?.companyName || "Valued Client"}</span>
                                </h1>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none font-heading">Enterprise Intelligence Core</p>
                            </div>
                        </div>
                        <p className="text-[12px] font-medium text-slate-500 leading-relaxed max-w-xl ml-14">
                            Your digital dashboard for tracking job production, financial ledgers, and priority support.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-6 px-6 border-l border-slate-100">
                         <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available Credit</p>
                            <p className="text-xl font-black text-emerald-500 tracking-tight">₹{stats.balance.toLocaleString()}</p>
                            <Link href="/portal/ledger" className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-wider hover:underline">VIEW LEDGER STATEMENT</Link>
                         </div>
                    </div>
                </div>
            </div>



            {/* ── 4. Recent Transactions DataGrid ── */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Operational Intelligence Ledger</h3>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden px-2">
                    <DataGrid 
                        data={recentOrders}
                        columns={orderColumns}
                        hideTitle
                        pageSizeOptions={[5, 10]}
                        initialPageSize={5}
                        enableSelection={false}
                        toolbarClassName="border-none bg-transparent"
                    />
                </div>
            </div>
        </div>
    )
}
