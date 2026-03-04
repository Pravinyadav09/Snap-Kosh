"use client"

import React, { useState } from "react"
import {
    Search, Download, ChevronDown,
    FileSpreadsheet, Calendar, BookOpen,
    Filter, ArrowUpRight, ArrowDownLeft,
    Layers, Hash, User, Activity
} from "lucide-react"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
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

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialLedger: LedgerEntry[] = [
    { id: "L-9001", date: "24 Feb 2026", jobId: "JB-2026-0035", paperName: "Chromo Paper (170GSM)", openingStock: 5000, quantityUsed: 1200, closingStock: 3800, operator: "Rahul", type: "Issue" },
    { id: "L-9002", date: "24 Feb 2026", jobId: "JB-2026-0038", paperName: "Art Card (300GSM)", openingStock: 2500, quantityUsed: 500, closingStock: 2000, operator: "Suresh", type: "Issue" },
    { id: "L-9003", date: "25 Feb 2026", jobId: "JB-2026-0035", paperName: "Chromo Paper (170GSM)", openingStock: 3800, quantityUsed: -50, closingStock: 3850, operator: "Rahul", type: "Return" },
    { id: "L-9004", date: "25 Feb 2026", jobId: "JB-2026-0042", paperName: "Bond Paper (90GSM)", openingStock: 15000, quantityUsed: 4000, closingStock: 11000, operator: "Vikram", type: "Issue" },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaperUsageLedgerPage() {
    const [ledger, setLedger] = useState<LedgerEntry[]>(initialLedger)
    const [search, setSearch] = useState("")

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h1 className="text-2xl font-bold tracking-tight">Paper Usage Ledger</h1>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-white border-none shadow-md" style={{ background: 'var(--primary)' }}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Usage (Monthly)</p>
                            <ArrowUpRight className="h-4 w-4 opacity-50" />
                        </div>
                        <p className="text-3xl font-black mt-2 italic">14,250 <span className="text-sm font-normal not-italic opacity-70">Sheets</span></p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-600 text-white border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Recycled / Returns</p>
                            <ArrowDownLeft className="h-4 w-4 opacity-50" />
                        </div>
                        <p className="text-3xl font-black mt-2 italic">480 <span className="text-sm font-normal not-italic opacity-70">Sheets</span></p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-500 text-white border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Waste % (Avg)</p>
                            <Activity className="h-4 w-4 opacity-50" />
                        </div>
                        <p className="text-3xl font-black mt-2 italic">4.2%</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-none bg-background">
                <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FileSpreadsheet className="h-4 w-4" />
                            <CardTitle className="text-sm font-medium">Stock Consumption Logs</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 gap-2 font-bold">
                                <Calendar className="h-4 w-4" /> This Month
                            </Button>
                            <Button className="h-9 font-bold px-5 text-white shadow-lg transition-all" style={{ background: 'var(--primary)' }}>
                                Print Ledger
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2 h-9">
                                <Download className="h-4 w-4" /> Export CSV
                            </Button>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Job ID or Paper..."
                                className="pl-8 h-9 bg-muted/20 border-none"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 uppercase text-[10px]">
                                    <TableHead className="font-black">Date</TableHead>
                                    <TableHead className="font-black">Job Ref</TableHead>
                                    <TableHead className="font-black">Paper Stock</TableHead>
                                    <TableHead className="font-black">Opening</TableHead>
                                    <TableHead className="font-black">Consumed</TableHead>
                                    <TableHead className="font-black">Closing</TableHead>
                                    <TableHead className="font-black">Operator</TableHead>
                                    <TableHead className="font-black">Type</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ledger.map(entry => (
                                    <TableRow key={entry.id} className="group hover:bg-muted/5">
                                        <TableCell className="text-xs font-medium">{entry.date}</TableCell>
                                        <TableCell>
                                            <span className="font-mono font-bold text-blue-600 text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 italic">
                                                {entry.jobId}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-bold text-sm text-slate-800">{entry.paperName}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{entry.openingStock}</TableCell>
                                        <TableCell className="font-black text-sm">
                                            <span className={entry.quantityUsed > 0 ? "text-rose-600" : "text-emerald-600"}>
                                                {entry.quantityUsed > 0 ? `-${entry.quantityUsed}` : `+${Math.abs(entry.quantityUsed)}`}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-bold text-sm">{entry.closingStock}</TableCell>
                                        <TableCell className="text-xs">{entry.operator}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`
                                                text-[10px] font-black uppercase h-5
                                                ${entry.type === 'Issue' ? 'border-rose-200 text-rose-700 bg-rose-50' :
                                                    entry.type === 'Return' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                                                        'border-slate-300 text-slate-700 bg-slate-50'}
                                            `}>
                                                {entry.type}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
