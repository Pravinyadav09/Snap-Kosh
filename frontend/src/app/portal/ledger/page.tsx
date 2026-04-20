"use client"

import React, { useState, useEffect } from "react"
import { 
    FileText, 
    TrendingUp, 
    TrendingDown, 
    ArrowUpRight, 
    Download, 
    Printer, 
    Search,
    Filter,
    CreditCard,
    DollarSign,
    Calendar,
    ChevronRight,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { toast } from "sonner"
import { API_BASE } from "@/lib/api"

interface LedgerEntry {
    id: string
    date: string
    refNo: string
    type: "Invoice" | "Payment" | "Credit Note" | "Debit Note"
    description: string
    debit: number
    credit: number
    balance: number
    status: "Paid" | "Pending" | "Partial" | "Overdue"
}

interface LedgerStats {
    balance: number
    creditLimit: number
    monthlySpend: number
    safetyLimit: number
}

export default function LedgerPage() {
    const [entries, setEntries] = useState<LedgerEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<LedgerStats>({
        balance: 0,
        creditLimit: 0,
        monthlySpend: 0,
        safetyLimit: 0
    })

    useEffect(() => {
        const stored = localStorage.getItem("portal_customer")
        if (stored) {
            const cust = JSON.parse(stored)
            setStats(prev => ({ 
                ...prev, 
                creditLimit: cust.creditLimit || 0,
                safetyLimit: (cust.creditLimit || 0) * 0.8 // 80% as safety
            }))
            fetchLedger(cust.id)
        } else {
            window.location.href = "/portal/login"
        }
    }, [])

    const fetchLedger = async (customerId: number) => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/portal/ledger/${customerId}`)
            if (res.ok) {
                const data = await res.json()
                let rollingBalance = 0
                let spendThisMonth = 0
                const currentMonth = new Date().getMonth()
                
                const mapped = data.map((item: any) => {
                    rollingBalance += (item.debit || 0) - (item.credit || 0)
                    if (item.debit > 0 && new Date(item.date).getMonth() === currentMonth) {
                        spendThisMonth += item.debit
                    }
                    return {
                        ...item,
                        id: `${item.refNo}-${item.date}`,
                        balance: rollingBalance
                    }
                })

                setEntries([...mapped].reverse())
                setStats(prev => ({
                    ...prev,
                    balance: rollingBalance,
                    monthlySpend: spendThisMonth
                }))
            }
        } catch (err) {
            toast.error("Account sync offline")
        } finally {
            setLoading(false)
        }
    }

    const columns: ColumnDef<LedgerEntry>[] = [
        {
            key: "date",
            label: "Date",
            sortable: true,
            filterable: true,
            type: 'date',
            render: (val: any) => (
                <span className="text-[11px] font-bold text-slate-500">{new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
            )
        },
        {
            key: "refNo",
            label: "Reference",
            sortable: true,
            filterable: true,
            render: (val: any, item: LedgerEntry) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-900 text-[10px] tracking-wider uppercase">{item.refNo}</span>
                    <span className="text-[8px] font-bold uppercase text-slate-400">{item.type}</span>
                </div>
            )
        },
        {
            key: "description",
            label: "Details",
            filterable: true,
            render: (val: any) => (
                <p className="text-[11px] font-medium text-slate-500 truncate max-w-[180px]">{val}</p>
            )
        },
        {
            key: "debit",
            label: "Debit (+)",
            sortable: true,
            filterable: true,
            type: 'number',
            render: (val: any) => (
                <span className={`text-[11px] font-black ${Number(val) > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                    {Number(val) > 0 ? `₹${Number(val).toLocaleString()}` : '—'}
                </span>
            )
        },
        {
            key: "credit",
            label: "Credit (-)",
            sortable: true,
            filterable: true,
            type: 'number',
            render: (val: any) => (
                <span className={`text-[11px] font-black ${Number(val) > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {Number(val) > 0 ? `₹${Number(val).toLocaleString()}` : '—'}
                </span>
            )
        },
        {
            key: "balance",
            label: "Balance",
            sortable: true,
            type: 'number',
            render: (val: any) => (
                <span className="text-[11px] font-black text-slate-900">₹{Number(val).toLocaleString()}</span>
            )
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            filterable: true,
            render: (val: any) => {
                const styles: any = {
                    Paid: "bg-emerald-50 text-emerald-600",
                    Unpaid: "bg-amber-50 text-amber-600",
                    Pending: "bg-amber-50 text-amber-600",
                    Partial: "bg-blue-50 text-blue-600",
                    Overdue: "bg-rose-50 text-rose-600"
                }
                return (
                    <Badge className={`h-5 text-[8px] font-black tracking-widest border-none rounded-full px-3 ${styles[val] || 'bg-slate-50'} shadow-none uppercase`}>
                        {val || 'Unknown'}
                    </Badge>
                )
            }
        }
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--primary)]/10">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading uppercase">Financial Ledger</h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Account Transaction Core</p>
                    </div>
                </div>
            </div>

            {/* ── Financial Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                {[
                    { label: "O/S Balance", value: `₹${stats.balance.toLocaleString()}`, icon: DollarSign, gradient: "from-indigo-600 to-indigo-700", trend: "Current Due" },
                    { label: "Credit Limit", value: `₹${stats.creditLimit.toLocaleString()}`, icon: CreditCard, gradient: "from-emerald-500 to-emerald-600", trend: "Approved Cap" },
                    { label: "This Month", value: `₹${stats.monthlySpend.toLocaleString()}`, icon: TrendingUp, gradient: "from-sky-500 to-sky-600", trend: "MTD Billing" },
                    { label: "Safety Limit", value: `₹${stats.safetyLimit.toLocaleString()}`, icon: TrendingDown, gradient: "from-rose-500 to-rose-600", trend: "Watch Threshold" }
                ].map((stat, i) => (
                    <Card key={i} className={`border-none shadow-lg bg-gradient-to-br ${stat.gradient} text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 rounded-2xl`}>
                        <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                            <stat.icon className="size-10 sm:size-16" />
                        </div>
                        <CardHeader className="pb-1 sm:pb-2 space-y-0">
                            <CardTitle className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest opacity-80">{stat.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-black tracking-tight">{stat.value}</div>
                            <p className="text-[8px] sm:text-[9px] font-black mt-1.5 bg-white/20 w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {stat.trend}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Ledger DataGrid ── */}
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-2">
                    <DataGrid 
                        columns={columns} 
                        data={entries} 
                        isLoading={loading}
                        enableSelection={true}
                        enableCardView={true}
                        enableDateRange={true}
                        title="Ledger Intelligence History"
                        searchPlaceholder="Filter all records..."
                    />
                </CardContent>
            </Card>

        </div>
    )
}
