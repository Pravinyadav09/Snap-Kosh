"use client"

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect } from "react"
import { 
    Download, Printer, 
    ArrowUpRight, ArrowDownRight, 
    TrendingUp, DollarSign, Wallet,
    PieChart as PieChartIcon, Search, List
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

type Expense = {
    id: number
    title: string
    category: string
    amount: number
    expenseDate?: string
}

export default function FinancialStatementsPage() {
    const [stats, setStats] = useState({ revenue: 0, expenses: 0 })
    const [expenseRecords, setExpenseRecords] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSummary = fetch(`${API_BASE}/api/Dashboard/admin-summary`).then(res => res.json())
        const fetchExpenses = fetch(`${API_BASE}/api/Expenses`).then(res => res.json())

        Promise.all([fetchSummary, fetchExpenses])
            .then(([summary, expenses]) => {
                setStats({
                    revenue: summary.monthlyRevenue || 0,
                    expenses: summary.monthlyExpenses || 0
                })
                setExpenseRecords(expenses || [])
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const formatCurrency = (val: number = 0) => `₹${(val || 0).toLocaleString()}`

    // Categorize expenses
    const directCosts = expenseRecords.filter(e => 
        e.category?.toLowerCase().includes('machine') || 
        e.category?.toLowerCase().includes('material') ||
        e.category?.toLowerCase().includes('inventory')
    )
    const opExpenses = expenseRecords.filter(e => !directCosts.includes(e))

    const totalDirect = directCosts.reduce((s, e) => s + e.amount, 0)
    const totalOp = opExpenses.reduce((s, e) => s + e.amount, 0)
    
    const displayDirect = totalDirect > 0 ? totalDirect : (stats.expenses * 0.7)
    const displayOp = totalOp > 0 ? totalOp : (stats.expenses * 0.3)

    const pnlRows = [
        { group: "Operating Revenue", items: [
            { label: "Sales Revenue (MTD)", amount: stats.revenue, status: "up" },
        ], total: stats.revenue },
        { group: "Direct Costs (COGS)", items: directCosts.length > 0 ? directCosts.slice(0, 5).map(e => ({ label: e.title, amount: e.amount, status: "down" })) : [
            { label: "Estimated Material Costs", amount: stats.expenses * 0.7, status: "down" }
        ], total: displayDirect },
        { group: "Operating Expenses (OPEX)", items: opExpenses.length > 0 ? opExpenses.slice(0, 5).map(e => ({ label: e.title, amount: e.amount, status: "neutral" })) : [
            { label: "Estimated Admin Costs", amount: stats.expenses * 0.3, status: "neutral" }
        ], total: displayOp }
    ]

    const netProfit = stats.revenue - (displayDirect + displayOp)

    const columns: ColumnDef<Expense>[] = [
        { key: "id", label: "ID", className: "w-12", render: (v) => <span className="font-bold text-slate-400">#{v}</span> },
        { key: "title", label: "Expense Entry", render: (v) => <span className="font-bold text-slate-800">{v as string}</span> },
        { key: "category", label: "Category", render: (v) => <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-500 border-slate-200">{v as string}</Badge> },
        { key: "amount", label: "Value", className: "text-right", render: (v) => <span className="font-black text-rose-600">{formatCurrency(v as number)}</span> },
        { key: "expenseDate", label: "Date", render: (v) => <span className="text-[10px] font-bold text-slate-400">{v ? new Date(v as string).toLocaleDateString() : 'Today'}</span> }
    ]

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 uppercase font-bold text-left">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl tracking-tight text-slate-900">Financial Performance</h1>
                    <p className="text-[10px] text-muted-foreground tracking-widest px-0.5">Fiscal Period: Current Month (Actuals)</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-10 px-4 text-[10px] uppercase tracking-widest gap-2 rounded-xl border-slate-200">
                        <Printer className="h-4 w-4" /> Print Statement
                    </Button>
                    <Button className="h-10 px-6 text-white text-[10px] uppercase tracking-widest gap-2 shadow-xl rounded-xl" style={{ background: 'var(--primary)' }}>
                        <Download className="h-4 w-4" /> Export Ledger
                    </Button>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <TrendingUp className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0 text-white">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                            Gross Revenue (MTD)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold truncate">
                            {formatCurrency(stats.revenue)}
                        </div>
                        <p className="text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full">
                            Billing Volume
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <ArrowDownRight className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0 text-white">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                            Total Expenses (Actual)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold truncate">
                            {formatCurrency(displayDirect + displayOp)}
                        </div>
                        <p className="text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full">
                            Cash Outflow
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <DollarSign className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0 text-white">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                            Net Profit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold truncate">
                            {formatCurrency(netProfit)}
                        </div>
                        <p className="text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full">
                            Net Viability
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* P&L and Grid Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Detail Table */}
                    <Card className="border border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="py-4 bg-slate-50 border-b">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                Profit & Loss Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <tbody>
                                        {pnlRows.map((group, gIdx) => (
                                            <React.Fragment key={gIdx}>
                                                <tr className="bg-slate-50/50">
                                                    <td colSpan={3} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        {group.group}
                                                    </td>
                                                </tr>
                                                {group.items.map((item, iIdx) => (
                                                    <tr key={iIdx} className="border-b group hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-3.5">
                                                            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                                                        </td>
                                                        <td className="px-6 py-3.5 text-right">
                                                            <span className="text-sm font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                                                        </td>
                                                        <td className="px-6 py-3.5 text-right w-16 text-slate-300">
                                                            <ArrowUpRight className="h-3.5 w-3.5 ml-auto" />
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="border-b bg-slate-50/20">
                                                    <td className="px-6 py-2.5">
                                                        <span className="text-[10px] font-black text-slate-900 uppercase">Subtotal {group.group}</span>
                                                    </td>
                                                    <td className="px-6 py-2.5 text-right">
                                                        <span className="text-xs font-black text-slate-900">{formatCurrency(group.total)}</span>
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                        <tr className="bg-slate-900 text-white">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black uppercase tracking-widest">Final Net Profit</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-lg font-black">{formatCurrency(netProfit)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge className={`border-none font-bold text-[9px] ${netProfit >= 0 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
                                                    {netProfit >= 0 ? "STABLE" : "ADJUST"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expense Ledger */}
                    <Card className="border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <List className="h-4 w-4 text-blue-500" /> Full Expense Registry
                            </CardTitle>
                        </div>
                        <CardContent className="p-0">
                             <DataGrid 
                                data={expenseRecords} 
                                columns={columns} 
                                isLoading={loading}
                                hideTitle={true}
                                searchPlaceholder="Search by title, category..." 
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="py-4 bg-slate-50 border-b text-left">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <PieChartIcon className="h-4 w-4 text-blue-500" /> Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-48 flex items-center justify-center bg-slate-50/50 text-[10px] text-muted-foreground uppercase font-bold">
                            Interactive Chart Component
                        </CardContent>
                    </Card>
                    <Card className="border border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="py-4 bg-slate-50 border-b text-left">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" /> Projection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-48 flex items-center justify-center bg-slate-50/50 text-[10px] text-muted-foreground uppercase font-bold">
                            Interactive Chart Component
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
