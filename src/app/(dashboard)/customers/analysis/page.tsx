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
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react"
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/shared/date-range-picker"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { SearchableSelect } from "@/components/shared/searchable-select"
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
    const [performanceSearch, setPerformanceSearch] = useState("")
    const [yearlySearch, setYearlySearch] = useState("")

    const [performancePage, setPerformancePage] = useState(1)
    const [performancePageSize, setPerformancePageSize] = useState(10)
    const [yearlyPage, setYearlyPage] = useState(1)
    const [yearlyPageSize, setYearlyPageSize] = useState(10)

    const [performanceDate, setPerformanceDate] = useState<DateRange | undefined>({
        from: new Date(2026, 2, 1),
        to: new Date(2026, 2, 31)
    })
    const [yearlyDate, setYearlyDate] = useState<DateRange | undefined>({
        from: new Date(2026, 0, 1),
        to: new Date(2026, 11, 31)
    })

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
                    <Link href={`/customers/${row.id}`} className="font-bold text-xs text-slate-700 hover:text-primary transition-colors truncate">
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
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">Customer Intelligence</h1>
                </div>
                <div className="flex items-center gap-3">
                    {/* ── Yearly Matrix Button ── */}
                    <Dialog rotate-right>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-md gap-2 transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                                <LayoutGrid className="h-4 w-4" /> Yearly Matrix
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white flex flex-col max-h-[90vh]">
                            <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white shrink-0 font-sans">
                                <div className="flex items-center justify-between pr-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                                            <LayoutGrid className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">Annual Business Matrix (2026)</DialogTitle>
                                            <DialogDescription className="text-[10px] text-slate-400 font-medium">Month-wise visit & billing overview</DialogDescription>
                                        </div>
                                    </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative group/yearly-search">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/yearly-search:text-primary transition-colors" />
                                        <input
                                            placeholder="Search Customer..."
                                            value={yearlySearch}
                                            onChange={(e) => setYearlySearch(e.target.value)}
                                            className="w-56 pl-9 h-8 bg-slate-50 border-slate-200 border rounded-md text-[11px] font-bold outline-none focus:ring-1 focus:ring-primary transition-all font-sans"
                                        />
                                    </div>
                                    <DatePickerWithRange
                                        date={yearlyDate}
                                        setDate={setYearlyDate}
                                    />
                                </div>
                                </div>
                            </DialogHeader>
                            <div className="flex-1 w-full bg-white relative overflow-hidden flex flex-col">
                                <div className="p-0 overflow-x-auto overflow-y-auto custom-scrollbar-enhanced flex-1">
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead className="sticky top-0 bg-white z-20 font-sans shadow-sm">
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b border-r sticky left-0 z-30 min-w-[180px] sticky-shadow-right">Customer Name</th>
                                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                                                    <th key={m} className="px-2 py-3 bg-slate-50 font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b text-center min-w-[70px]">{m}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(() => {
                                                const filtered = mockAnalysisData.filter(row =>
                                                    row.name.toLowerCase().includes(yearlySearch.toLowerCase())
                                                )
                                                const start = (yearlyPage - 1) * yearlyPageSize
                                                const end = start + yearlyPageSize
                                                return filtered.slice(start, end).map((row, rowIndex) => (
                                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors font-sans group/matrix-row">
                                                        <td className="px-4 py-3 border-r font-bold text-xs text-slate-700 sticky left-0 bg-white z-10 sticky-shadow-right transition-colors group-hover/matrix-row:bg-slate-50/80">{row.name}</td>
                                                        {[...Array(12)].map((_, i) => (
                                                            <td key={i} className="px-2 py-3 text-center text-[10px] font-bold tabular-nums">
                                                                {(i === 2 && row.visitStatus === "Yes") || (i < 2 && Math.random() > 0.5) ? (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div className="flex flex-col items-center cursor-help">
                                                                                    <div className="h-5 w-5 rounded-md bg-emerald-500 flex items-center justify-center mx-auto mb-1 shadow-sm">
                                                                                        <Check className="h-3 w-3 text-white stroke-[3px]" />
                                                                                    </div>
                                                                                    {i === 2 && <span className="text-slate-400 font-medium uppercase text-[8px]">₹{(row.monthlyVolume / 1000).toFixed(1)}k</span>}
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="p-3 rounded-xl border-slate-200 shadow-xl bg-white min-w-[140px]">
                                                                                <div className="space-y-1.5 font-sans">
                                                                                    <div className="flex items-center gap-2 border-b border-slate-50 pb-1.5">
                                                                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                                        <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Job Verified</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col gap-0.5 pt-0.5">
                                                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Order ID</span>
                                                                                        <span className="text-[11px] font-black text-[#4C1F7A]">JB-2026-{(1000 + rowIndex + i).toString().slice(1)}</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col gap-0.5">
                                                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Monthly Billing</span>
                                                                                        <span className="text-[11px] font-black text-slate-900">₹{(row.monthlyVolume || 2500).toLocaleString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                ) : <span className="text-slate-200">-</span>}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                                {/* ── Pagination Footer ── */}
                                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0 font-sans">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        Showing {Math.min(mockAnalysisData.filter(r => r.name.toLowerCase().includes(yearlySearch.toLowerCase())).length, (yearlyPage - 1) * yearlyPageSize + 1)} - {Math.min(mockAnalysisData.filter(r => r.name.toLowerCase().includes(yearlySearch.toLowerCase())).length, yearlyPage * yearlyPageSize)} of {mockAnalysisData.filter(r => r.name.toLowerCase().includes(yearlySearch.toLowerCase())).length}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-white">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setYearlyPage(1)} disabled={yearlyPage === 1}>
                                                <ChevronsLeft className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setYearlyPage(p => Math.max(1, p - 1))} disabled={yearlyPage === 1}>
                                                <ChevronLeft className="h-3.5 w-3.5" />
                                            </Button>
                                            <span className="px-2 text-[10px] font-black">{yearlyPage}</span>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setYearlyPage(p => p + 1)} disabled={yearlyPage * yearlyPageSize >= mockAnalysisData.filter(r => r.name.toLowerCase().includes(yearlySearch.toLowerCase())).length}>
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setYearlyPage(Math.ceil(mockAnalysisData.filter(r => r.name.toLowerCase().includes(yearlySearch.toLowerCase())).length / yearlyPageSize))} disabled={yearlyPage * yearlyPageSize >= mockAnalysisData.filter(r => r.name.toLowerCase().includes(yearlySearch.toLowerCase())).length}>
                                                <ChevronsRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <SearchableSelect 
                                            options={[
                                                { value: "5", label: "5 rows" },
                                                { value: "10", label: "10 rows" },
                                                { value: "20", label: "20 rows" },
                                                { value: "50", label: "50 rows" }
                                            ]}
                                            value={String(yearlyPageSize)} 
                                            onValueChange={(val: any) => { setYearlyPageSize(Number(val)); setYearlyPage(1); }}
                                            placeholder="Size"
                                            className="h-8 w-[90px] bg-white border-slate-200 rounded-lg text-[10px] font-bold shadow-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* ── Daily Performance Button ── */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-md gap-2 transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                                <CalendarDays className="h-4 w-4" /> Daily Stats
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[1200px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white flex flex-col max-h-[90vh]">
                            <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white shrink-0 font-sans">
                                <div className="flex items-center justify-between pr-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
                                            <CalendarDays className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">Daily Performance Tracker</DialogTitle>
                                            <DialogDescription className="text-[10px] text-slate-400 font-medium">March 2026 • Live Monitoring</DialogDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative group/modal-search">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/modal-search:text-primary transition-colors" />
                                            <input
                                                placeholder="Search Customer..."
                                                value={performanceSearch}
                                                onChange={(e) => setPerformanceSearch(e.target.value)}
                                                className="w-56 pl-9 h-8 bg-slate-50 border-slate-200 border rounded-md text-[11px] font-bold outline-none focus:ring-1 focus:ring-primary transition-all font-sans"
                                            />
                                        </div>
                                        <DatePickerWithRange
                                            date={performanceDate}
                                            setDate={setPerformanceDate}
                                        />
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 w-full bg-white relative overflow-hidden flex flex-col">
                                <div className="p-0 overflow-x-auto overflow-y-auto custom-scrollbar-enhanced flex-1">
                                    <table className="w-full text-left border-separate border-spacing-0 min-w-[1600px]">
                                        <thead className="sticky top-0 z-30 font-sans shadow-sm">
                                            <tr>
                                                <th className="px-5 py-3 bg-slate-50 font-bold text-[10px] uppercase tracking-tight text-slate-400 border-b border-r sticky left-0 z-40 min-w-[240px] sticky-shadow-right">
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
                                            {(() => {
                                                const filtered = mockAnalysisData.filter(row =>
                                                    row.name.toLowerCase().includes(performanceSearch.toLowerCase())
                                                )
                                                const start = (performancePage - 1) * performancePageSize
                                                const end = start + performancePageSize
                                                return filtered.slice(start, end).map((row, rowIndex) => (
                                                    <tr key={row.id} className="group hover:bg-slate-50/50 transition-all font-sans">
                                                        <td className="px-5 py-3 border-r font-bold text-[11px] text-slate-600 sticky left-0 bg-white z-20 transition-colors truncate sticky-shadow-right group-hover:bg-slate-50/80">
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
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <div className="h-6 w-6 rounded-md bg-emerald-500 shadow-sm flex items-center justify-center mx-auto transition-transform hover:scale-110 cursor-help active:scale-95">
                                                                                        <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                                                                                    </div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent className="p-3 rounded-xl border-slate-200 shadow-xl bg-white min-w-[160px] animate-in fade-in zoom-in duration-200">
                                                                                    <div className="space-y-2 font-sans">
                                                                                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                                                                            <span className="text-[10px] font-black uppercase text-[#4C1F7A] tracking-wider">Job Executed</span>
                                                                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-bold px-1.5 py-0">LIVE</Badge>
                                                                                        </div>
                                                                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                                                                            <div className="flex flex-col gap-0.5">
                                                                                                <span className="text-[8px] font-bold text-slate-400 uppercase">Job Code</span>
                                                                                                <span className="text-[10px] font-black text-slate-700">JB-26-{dayNum.toString().padStart(2, '0')}</span>
                                                                                            </div>
                                                                                            <div className="flex flex-col gap-0.5">
                                                                                                <span className="text-[8px] font-bold text-slate-400 uppercase">Operator</span>
                                                                                                <span className="text-[10px] font-black text-slate-700">Staff #0{rowIndex + 1}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-50">
                                                                                            <span className="text-[8px] font-bold text-slate-400 uppercase italic">Verification Stamp</span>
                                                                                            <span className="text-[9px] font-medium text-slate-400">Digital Handshake Completed</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    ) : (
                                                                        <div className="h-1 w-1 rounded-full bg-slate-200 mx-auto opacity-30" />
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="px-6 py-3 border-t border-slate-100 bg-white flex flex-col gap-3 shrink-0 font-sans">
                                <div className="flex items-center justify-between">
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
                                    <Button variant="ghost" size="sm" className="h-8 text-primary font-bold text-[10px] uppercase tracking-wider hover:bg-primary/10">
                                        <Download className="h-3 w-3 mr-2" /> Download Report
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        Showing {Math.min(mockAnalysisData.filter(r => r.name.toLowerCase().includes(performanceSearch.toLowerCase())).length, (performancePage - 1) * performancePageSize + 1)} - {Math.min(mockAnalysisData.filter(r => r.name.toLowerCase().includes(performanceSearch.toLowerCase())).length, performancePage * performancePageSize)} of {mockAnalysisData.filter(r => r.name.toLowerCase().includes(performanceSearch.toLowerCase())).length}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setPerformancePage(1)} disabled={performancePage === 1}>
                                                <ChevronsLeft className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setPerformancePage(p => Math.max(1, p - 1))} disabled={performancePage === 1}>
                                                <ChevronLeft className="h-3.5 w-3.5" />
                                            </Button>
                                            <span className="px-2 text-[10px] font-black">{performancePage}</span>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setPerformancePage(p => p + 1)} disabled={performancePage * performancePageSize >= mockAnalysisData.filter(r => r.name.toLowerCase().includes(performanceSearch.toLowerCase())).length}>
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setPerformancePage(Math.ceil(mockAnalysisData.filter(r => r.name.toLowerCase().includes(performanceSearch.toLowerCase())).length / performancePageSize))} disabled={performancePage * performancePageSize >= mockAnalysisData.filter(r => r.name.toLowerCase().includes(performanceSearch.toLowerCase())).length}>
                                                <ChevronsRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <SearchableSelect 
                                            options={[
                                                { value: "5", label: "5 rows" },
                                                { value: "10", label: "10 rows" },
                                                { value: "20", label: "20 rows" },
                                                { value: "50", label: "50 rows" }
                                            ]}
                                            value={String(performancePageSize)} 
                                            onValueChange={(val: any) => { setPerformancePageSize(Number(val)); setPerformancePage(1); }}
                                            placeholder="Size"
                                            className="h-8 w-[90px] bg-white border-slate-200 rounded-lg text-[10px] font-bold shadow-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>


                </div>
            </div>



            {/* ── Data Grid ────────────────────────────────────────────── */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                <DataGrid
                    data={mockAnalysisData}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    enableDateRange={true}
                    dateFilterKey="lastVisitDate"
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
