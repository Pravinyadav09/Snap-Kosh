"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import {
    Search, Download, ChevronDown,
    FileSpreadsheet, Calendar, BookOpen,
    Filter, ArrowUpRight, ArrowDownLeft,
    Layers, Hash, User, Activity
} from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// ─── Types ──────────────────────────────────────────────────────────────────
type LedgerEntry = {
    id: string
    date: string
    jobId: string
    paperName: string
    openingStock: number
    quantityUsed: number
    closingStock: number
    operator: string
    type: "Issue" | "Return" | "Adjustment"
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaperUsageLedgerPage() {
    const [ledger, setLedger] = useState<LedgerEntry[]>([])

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/inventory/history`)
                if (res.ok) {
                    const data = await res.json()
                    const mapped = data.map((t: any) => ({
                        id: `L-${t.id}`,
                        date: new Date(t.transactionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        jobId: t.referenceType === 'JobCard' ? `JB-${t.referenceId}` : '-',
                        paperName: `Material #${t.inventoryItemId}`,
                        openingStock: 0,
                        quantityUsed: t.type === 'Outward' ? t.quantity : -t.quantity,
                        closingStock: 0,
                        operator: "System",
                        type: t.type === 'Outward' ? "Issue" : t.type === 'Inward' ? "Return" : "Adjustment"
                    }))
                    setLedger(mapped)
                }
            } catch (err) {
                console.error(err)
                setLedger([])
            }
        }
        fetchLedger()
    }, [])


    const columns: ColumnDef<LedgerEntry>[] = [
        { key: "date", label: "Date", type: "date", initialWidth: 120 },
        {
            key: "jobId",
            label: "Job Ref",
            initialWidth: 150,
            render: (val) => (
                <span className="font-sans font-bold text-blue-600 text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {val}
                </span>
            )
        },
        { key: "paperName", label: "Paper Stock", className: "font-bold text-sm text-slate-800", initialWidth: 200 },
        { key: "openingStock", label: "Opening", className: "text-xs text-muted-foreground", type: "number", initialWidth: 100 },
        {
            key: "quantityUsed",
            label: "Consumed",
            type: "number",
            initialWidth: 100,
            render: (val: number) => (
                <span className={val > 0 ? "text-rose-600 font-bold text-sm" : "text-emerald-600 font-bold text-sm"}>
                    {val > 0 ? `-${val}` : `+${Math.abs(val)}`}
                </span>
            )
        },
        { key: "closingStock", label: "Closing", className: "font-bold text-sm", type: "number", initialWidth: 100 },
        { key: "operator", label: "Operator", className: "text-xs", initialWidth: 120 },
        {
            key: "type",
            label: "Type",
            initialWidth: 120,
            render: (val: string) => (
                <Badge variant="outline" className={`text-[10px] font-bold uppercase h-5 ${val === 'Issue' ? 'border-rose-200 text-rose-700 bg-rose-50' : val === 'Return' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-slate-300 text-slate-700 bg-slate-50'}`}>
                    {val}
                </Badge>
            )
        }
    ]

    const totalConsumption = ledger.filter(l => l.type === 'Issue').reduce((sum, l) => sum + Math.abs(l.quantityUsed), 0);
    const returnsCredit = ledger.filter(l => l.type === 'Return').reduce((sum, l) => sum + Math.abs(l.quantityUsed), 0);
    const efficiencyWarning = totalConsumption > 0 ? ((returnsCredit / totalConsumption) * 100).toFixed(1) : "0.0";

    return (
        <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans uppercase">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Consumption Ledger</h1>
                <Button className="h-11 px-6 text-white font-bold text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                    <Download className="h-4 w-4" /> Export Excel
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="relative overflow-hidden border-none shadow-xl bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Total Consumption
                        </CardTitle>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-500 shadow-sm border border-blue-100">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter">{totalConsumption.toLocaleString()} <span className="text-sm font-bold uppercase opacity-40">Qty</span></div>
                        <div className="mt-2 flex items-center gap-2">
                             <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold text-[9px] uppercase">+5% vs Last Period</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-none shadow-xl bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Returns / Credit
                        </CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100">
                            <ArrowDownLeft className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter">{returnsCredit.toLocaleString()} <span className="text-sm font-bold uppercase opacity-40">Qty</span></div>
                        <div className="mt-2 flex items-center gap-2">
                             <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] uppercase">Stable</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-none shadow-xl bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Efficiency Index
                        </CardTitle>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-500 shadow-sm border border-amber-100">
                            <Activity className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter">{efficiencyWarning}% <span className="text-sm font-bold uppercase opacity-40">Waste</span></div>
                        <div className="mt-2 flex items-center gap-2">
                             <Badge className="bg-amber-500/10 text-amber-600 border-none font-bold text-[9px] uppercase">Optimal</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DataGrid
                data={ledger}
                columns={columns}
                searchPlaceholder="Search by Job ID or Paper..."
                enableDateRange={true}
                dateFilterKey="date"
                enableSelection={true}
            />
        </div>
    )
}
