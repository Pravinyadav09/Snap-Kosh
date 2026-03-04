"use client"

import React, { useState } from "react"
import {
    Wallet,
    ArrowDownCircle,
    ArrowUpCircle,
    TrendingUp,
    Receipt,
    FileText,
    Plus,
    Filter,
    Download,
    CreditCard,
    Building,
    ChevronRight,
    Search,
    IndianRupee,
    Briefcase,
    Zap,
    Coffee,
    Settings
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

// ─── Types ──────────────────────────────────────────────────────────────────
type LedgerEntry = {
    id: string
    category: string
    description: string
    gst: string
    amount: number
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialLedger: LedgerEntry[] = [
    { id: "1", category: "Utilities", description: "Electricity Bill - Jan", gst: "₹342", amount: 5200 },
    { id: "2", category: "Pantry", description: "Daily Tea & Snacks", gst: "₹24", amount: 180 },
    { id: "3", category: "Maint", description: "Konica Machine Service", gst: "₹510", amount: 2840 },
    { id: "4", category: "Wages", description: "Staff Advance Part", gst: "No", amount: 5000 },
]

export default function FinancePage() {
    const [ledger] = useState<LedgerEntry[]>(initialLedger)

    const columns: ColumnDef<LedgerEntry>[] = [
        {
            key: "category",
            label: "Category",
            render: (val) => (
                <Badge variant="outline" className="text-[10px] font-black uppercase bg-slate-50 border-slate-200 text-slate-500 tracking-wider">
                    {val}
                </Badge>
            )
        },
        {
            key: "description",
            label: "Description",
            render: (val) => <span className="font-bold text-sm text-slate-800">{val}</span>
        },
        {
            key: "gst",
            label: "GST Input",
            render: (val) => <span className="text-xs font-medium text-slate-400">{val}</span>
        },
        {
            key: "amount",
            label: "Amount",
            className: "text-right",
            render: (val) => (
                <span className="font-black text-sm text-rose-600">
                    ₹{val.toLocaleString()}
                </span>
            )
        }
    ]

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 font-heading">Finance Overview</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Consolidated financial tracking and operational expenditure
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold gap-2 hover:bg-slate-50 transition-all">
                        <Download className="h-4 w-4 text-slate-400" /> Export P&L
                    </Button>
                    <Button className="h-11 px-8 rounded-xl font-bold gap-2 shadow-lg transition-all text-white" style={{ background: 'var(--primary)' }}>
                        <Plus className="h-4 w-4" /> Add Ledger Entry
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-rose-50/50 rounded-2xl overflow-hidden relative group transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Monthly Expenses</CardTitle>
                        <ArrowDownCircle className="h-5 w-5 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">₹42,500</div>
                        <p className="text-[10px] font-bold text-rose-600/70 mt-1 uppercase">Burn rate up by 12%</p>
                    </CardContent>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="h-16 w-16" />
                    </div>
                </Card>
                <Card className="border-none shadow-sm bg-indigo-50/50 rounded-2xl overflow-hidden relative group transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Material Costs</CardTitle>
                        <Briefcase className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">₹1,28,000</div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Paper & Ink Inventory</p>
                    </CardContent>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="h-16 w-16" />
                    </div>
                </Card>
                <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl overflow-hidden relative group transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-wider">GST Input Credit</CardTitle>
                        <Receipt className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">₹8,450</div>
                        <p className="text-[10px] font-black text-emerald-600 mt-1 uppercase tracking-tighter">Tax recoverable pool</p>
                    </CardContent>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <IndianRupee className="h-16 w-16" />
                    </div>
                </Card>
                <Card className="border-none shadow-sm bg-slate-900 text-white rounded-2xl overflow-hidden relative group transition-all hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Estimated P&L</CardTitle>
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white tracking-tighter">+₹1,82,000</div>
                        <p className="text-[10px] font-bold text-emerald-400 mt-1 uppercase">Projected Net Profit</p>
                    </CardContent>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard className="h-16 w-16" />
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <div className="col-span-4 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Operational Ledger</h2>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all" style={{ color: 'var(--primary)' }}>View Category Report</Button>
                    </div>
                    <DataGrid
                        data={ledger}
                        columns={columns}
                        searchPlaceholder="Search ledger entries..."
                    />
                </div>

                <div className="col-span-3 space-y-6">
                    {/* GST Summary - Floating look */}
                    <Card className="shadow-2xl border-none bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-[2rem] p-4 text-center">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">GST Input Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-5xl font-black text-white tracking-tighter">₹8,450.00</p>
                                <p className="text-[10px] font-bold text-emerald-100 uppercase opacity-70">Total Refundable Credit Available</p>
                            </div>
                            <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-black uppercase tracking-widest text-xs h-12 rounded-[1.2rem] shadow-lg">Download GSTR-2B Report</Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-none bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="pb-4 border-b bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-500">Recent Purchases</CardTitle>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white transition-all hover:border-indigo-100 hover:bg-indigo-50/10 group">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">Art Paper - 20 Reams</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] font-black uppercase px-1.5 py-0 border-slate-200">Reliable Paper Mart</Badge>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">30 Jan</span>
                                    </div>
                                </div>
                                <span className="font-black text-rose-600 tracking-tighter">₹18,500</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white transition-all hover:border-indigo-100 hover:bg-indigo-50/10 group">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">CMYK Toner Set</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] font-black uppercase px-1.5 py-0 border-slate-200">Xerox India Ltd</Badge>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">29 Jan</span>
                                    </div>
                                </div>
                                <span className="font-black text-rose-600 tracking-tighter">₹24,800</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
