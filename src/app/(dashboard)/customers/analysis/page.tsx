"use client"

import React, { useState } from "react"
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Search,
    Filter,
    Calendar,
    ArrowUpDown,
    UserCircle,
    Download,
    LayoutGrid,
    Check,
    CalendarDays
} from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

// ─── Types ──────────────────────────────────────────────────────────────────
type CustomerAnalysis = {
    id: string
    name: string
    monthlyVolume: number
    visitStatus: "Yes" | "No"
    lastVisitDate: string
    jobCardLink?: string
    growth: number
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockAnalysisData: CustomerAnalysis[] = [
    {
        id: "CUST-001",
        name: "Shabdolok Publications",
        monthlyVolume: 42500,
        visitStatus: "Yes",
        lastVisitDate: "2026-03-01",
        jobCardLink: "/jobs?id=JB-2026-0052",
        growth: 12
    },
    {
        id: "CUST-002",
        name: "Gaur City Center Admin",
        monthlyVolume: 12800,
        visitStatus: "Yes",
        lastVisitDate: "2026-03-02",
        jobCardLink: "/jobs?id=JB-2026-0084",
        growth: -5
    },
    {
        id: "CUST-003",
        name: "Reliable Printers",
        monthlyVolume: 0,
        visitStatus: "No",
        lastVisitDate: "2026-01-15",
        growth: -100
    },
    {
        id: "CUST-004",
        name: "Apex Branding",
        monthlyVolume: 85000,
        visitStatus: "Yes",
        lastVisitDate: "2026-02-28",
        jobCardLink: "/jobs?id=JB-2026-0041",
        growth: 24
    },
    {
        id: "CUST-005",
        name: "Shubham Plastic",
        monthlyVolume: 2033,
        visitStatus: "Yes",
        lastVisitDate: "2026-03-01",
        jobCardLink: "/jobs?id=JB-2026-0067",
        growth: 8
    }
]

export default function CustomerAnalysisPage() {
    const [filterStatus, setFilterStatus] = useState<string>("all")

    const columns: ColumnDef<CustomerAnalysis>[] = [
        {
            key: "name",
            label: "Customer Name",
            headerClassName: "text-[10px] font-bold uppercase tracking-wider text-slate-400",
            render: (val, row) => (
                <div className="flex items-center gap-2 font-sans">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <UserCircle className="h-4 w-4" />
                    </div>
                    <Link href={`/customers/${row.id}`} className="font-bold text-xs text-slate-700 hover:text-[#4C1F7A] transition-colors truncate">
                        {val}
                    </Link>
                </div>
            )
        },
        {
            key: "monthlyVolume",
            label: "Monthly Volume",
            headerClassName: "text-right w-[140px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            className: "text-right",
            render: (val) => (
                <div className="flex flex-col font-sans">
                    <span className="font-bold text-slate-900 text-xs tracking-tight">₹{val.toLocaleString()}</span>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">Total Billing</span>
                </div>
            )
        },
        {
            key: "visitStatus",
            label: "Visit Status",
            headerClassName: "w-[130px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            render: (val, row) => {
                const isYes = val === "Yes"
                return (
                    <div className="flex items-center gap-2 font-sans">
                        {isYes ? (
                            <Link href={row.jobCardLink || "#"}>
                                <Badge className="bg-emerald-600 text-white border-none px-2 py-0.5 rounded-sm font-bold text-[10px] cursor-pointer group flex items-center gap-1 shadow-sm">
                                    {val}
                                    <ArrowUpRight className="h-2.5 w-2.5 opacity-70" />
                                </Badge>
                            </Link>
                        ) : (
                            <Badge className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-sm font-bold text-[10px] shadow-none">
                                {val}
                            </Badge>
                        )}
                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tight">
                            {isYes ? "Active" : "Inactive"}
                        </span>
                    </div>
                )
            }
        },
        {
            key: "lastVisitDate",
            label: "Last Visit",
            headerClassName: "w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            render: (val) => (
                <div className="flex items-center gap-1.5 font-sans">
                    <Calendar className="h-3 w-3 text-slate-300" />
                    <span className="text-[11px] font-medium text-slate-600">{val}</span>
                </div>
            )
        },
        {
            key: "growth",
            label: "Growth Pulse",
            headerClassName: "w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            render: (val) => (
                <div className={`flex items-center gap-1 font-sans ${val >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {val >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    <span className="font-bold text-[11px] tracking-tight">{Math.abs(val)}%</span>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-4 font-sans bg-slate-50/30 p-4 rounded-lg">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4 mb-2 px-1">
                <div className="font-sans">
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">Customer Intelligence</h1>
                    <p className="text-xs font-medium text-slate-500">Relationships, Revenue Pattern & Business Volume Analysis</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* ── Yearly Matrix Button ── */}
                    <Dialog rotate-right>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-9 px-4 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans">
                                <LayoutGrid className="h-4 w-4 text-[#4C1F7A]" /> Yearly Matrix
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white flex flex-col max-h-[90vh]">
                            <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white shrink-0 font-sans">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md bg-[#F5F3FF] text-[#4C1F7A] border border-[#EDE9FE]">
                                        <LayoutGrid className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">Annual Business Matrix (2026)</DialogTitle>
                                        <DialogDescription className="text-[10px] text-slate-400 font-medium">Month-wise visit & billing overview</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="flex-1 w-full bg-white relative overflow-hidden flex flex-col">
                                <div className="p-0 overflow-x-auto overflow-y-auto custom-scrollbar-enhanced flex-1">
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead className="sticky top-0 bg-white z-20 font-sans shadow-sm">
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b border-r sticky left-0 z-30 min-w-[180px]">Customer Name</th>
                                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                                                    <th key={m} className="px-2 py-3 bg-slate-50 font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b text-center min-w-[70px]">{m}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {mockAnalysisData.map((row) => (
                                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors font-sans">
                                                    <td className="px-4 py-3 border-r font-bold text-xs text-slate-700 sticky left-0 bg-white z-10">{row.name}</td>
                                                    {[...Array(12)].map((_, i) => (
                                                        <td key={i} className="px-2 py-3 text-center text-[10px] font-bold tabular-nums">
                                                            {(i === 2 && row.visitStatus === "Yes") || (i < 2 && Math.random() > 0.5) ? (
                                                                <div className="flex flex-col items-center">
                                                                    <div className="h-5 w-5 rounded-md bg-emerald-500 flex items-center justify-center mx-auto mb-1 shadow-sm">
                                                                        <Check className="h-3 w-3 text-white stroke-[3px]" />
                                                                    </div>
                                                                    {i === 2 && <span className="text-slate-400 font-medium uppercase text-[8px]">₹{(row.monthlyVolume / 1000).toFixed(1)}k</span>}
                                                                </div>
                                                            ) : <span className="text-slate-200">-</span>}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* ── Daily Performance Button ── */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-9 px-4 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans">
                                <CalendarDays className="h-4 w-4 text-[#4C1F7A]" /> Daily Stats
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[1200px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white flex flex-col max-h-[90vh]">
                            <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white shrink-0 font-sans">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
                                            <CalendarDays className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">Daily Performance Tracker</DialogTitle>
                                            <DialogDescription className="text-[10px] text-slate-400 font-medium">March 2026 • Live Monitoring</DialogDescription>
                                        </div>
                                    </div>
                                    <Select defaultValue="march">
                                        <SelectTrigger className="h-8 w-32 border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-md">
                                            <SelectItem value="march" className="text-xs">March 2026</SelectItem>
                                            <SelectItem value="february" className="text-xs">February 2026</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 w-full bg-white relative overflow-hidden flex flex-col">
                                <div className="p-0 overflow-x-auto overflow-y-auto custom-scrollbar-enhanced flex-1">
                                    <table className="w-full text-left border-separate border-spacing-0 min-w-[1600px]">
                                        <thead className="sticky top-0 z-30 font-sans shadow-sm">
                                            <tr>
                                                <th className="px-5 py-3 bg-slate-50 font-bold text-[10px] uppercase tracking-tight text-slate-400 border-b border-r sticky left-0 z-40 min-w-[240px]">
                                                    Customer / Day
                                                </th>
                                                {[...Array(31)].map((_, i) => (
                                                    <th key={i} className={`px-1 py-3 bg-slate-50 font-bold text-[10px] uppercase border-b text-center w-12 ${[6, 7, 13, 14, 20, 21, 27, 28].includes(i + 1) ? 'text-rose-500' : 'text-slate-400'}`}>
                                                        {i + 1}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {mockAnalysisData.map((row) => (
                                                <tr key={row.id} className="group hover:bg-slate-50/50 transition-all font-sans">
                                                    <td className="px-5 py-3 border-r font-bold text-[11px] text-slate-600 sticky left-0 bg-white z-20 transition-colors truncate">
                                                        {row.name}
                                                    </td>
                                                    {[...Array(31)].map((_, i) => {
                                                        const dayNum = i + 1;
                                                        const isActive = (row.id === "CUST-001" && [1, 5, 12, 18, 25].includes(dayNum)) ||
                                                            (row.id === "CUST-004" && [2, 10, 15, 22, 29].includes(dayNum)) ||
                                                            (row.id === "CUST-005" && [1, 15, 30].includes(dayNum));

                                                        return (
                                                            <td key={i} className="px-1 py-3 text-center">
                                                                {isActive ? (
                                                                    <div className="h-6 w-6 rounded-md bg-emerald-500 shadow-sm flex items-center justify-center mx-auto transition-transform hover:scale-105">
                                                                        <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-1 w-1 rounded-full bg-slate-200 mx-auto opacity-30" />
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0 font-sans">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Job Done</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Pending</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 text-[#4C1F7A] font-bold text-[10px] uppercase tracking-wider hover:bg-[#F5F3FF]">
                                    <Download className="h-3 w-3 mr-2" /> Download Report
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="h-9 px-4 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans">
                        <Download className="h-3.5 w-3.5" /> Export Data
                    </Button>
                </div>
            </div>

            {/* ── Filters ───────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-md border border-slate-200 shadow-sm font-sans">
                <div className="flex items-center gap-2 flex-1 w-full">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            placeholder="Find Customer..."
                            className="w-full pl-9 h-9 bg-slate-50 border-slate-200 border rounded-md text-[11px] font-bold outline-none focus:ring-1 focus:ring-[#4C1F7A] transition-all font-sans"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Select defaultValue="all" onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-9 w-32 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-500">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3 w-3" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                            <SelectItem value="all" className="text-xs">All Activity</SelectItem>
                            <SelectItem value="yes" className="text-xs">Visited Only</SelectItem>
                            <SelectItem value="no" className="text-xs">Missing Only</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select defaultValue="march">
                        <SelectTrigger className="h-9 w-32 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-500">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                            {["January", "February", "March", "April", "May", "June"].map(m => (
                                <SelectItem key={m} value={m.toLowerCase()} className="text-xs">{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="h-9 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-[#4C1F7A] bg-[#F5F3FF] border-[#DDD6FE]">
                        <ArrowUpDown className="h-3 w-3 mr-2" /> Top Customers
                    </Button>
                </div>
            </div>

            {/* ── Data Grid ────────────────────────────────────────────── */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                <DataGrid
                    data={mockAnalysisData}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    searchPlaceholder="Filter current dataset..."
                    toolbarClassName="border-b px-4 py-3 bg-white"
                />
            </div>

            {/* ── Global Styles for Scrollbars ───────────────────────────── */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-enhanced::-webkit-scrollbar {
                    height: 14px;
                    width: 14px;
                    display: block !important;
                }
                .custom-scrollbar-enhanced::-webkit-scrollbar-track {
                    background: #f8fafc;
                    border-radius: 10px;
                }
                .custom-scrollbar-enhanced::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                    border: 4px solid #f8fafc;
                }
                .custom-scrollbar-enhanced::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                /* Ensure it's never hidden by Radix */
                [data-radix-scroll-area-viewport] {
                    scrollbar-width: thin !important;
                }
            `}} />
        </div>
    )
}
