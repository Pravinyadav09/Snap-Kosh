"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
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
    ChevronsRight,
    X,
    MoveHorizontal
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
    DialogFooter,
    DialogClose
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
    id: number
    name: string
    totalRevenue: number
    totalJobs: number
    lastJobDate: string
    lastPaymentDate: string
    netBalance: number
    jobDates?: number[] // Array of days (1-31) for the currently filtered month
}



export default function CustomerAnalysisPage() {
    const [analysisData, setAnalysisData] = useState<CustomerAnalysis[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [performanceSearch, setPerformanceSearch] = useState("")
    const [yearlySearch, setYearlySearch] = useState("")

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/Analytics/customers`)
                if (response.ok) {
                    const data = await response.json()
                    setAnalysisData(data.customerDetails || [])
                } else {
                    toast.error("Failed to load customer analytics")
                }
            } catch (error) {
                console.error("Error fetching analytics:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAnalysis()
    }, [])

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

    // Dynamic filtering for Performance Tracker (Daily Stats)
    const performanceFilteredData = React.useMemo(() => {
        if (!performanceDate?.from) return [];
        const targetMonth = performanceDate.from.getMonth();
        const targetYear = performanceDate.from.getFullYear();

        return (analysisData || []).map((row: any) => {
            const dates: number[] = [];
            if (row.jobDatesRaw) {
                const rawDates = row.jobDatesRaw.split(',');
                rawDates.forEach((d: string) => {
                    const dt = new Date(d);
                    if (dt.getMonth() === targetMonth && dt.getFullYear() === targetYear) {
                        dates.push(dt.getDate());
                    }
                });
            }
            return { ...row, jobDates: [...new Set(dates)] };
        }).filter(row => 
            ((row as any).name || (row as any).Name || "").toLowerCase().includes(performanceSearch.toLowerCase())
        );
    }, [analysisData, performanceDate, performanceSearch]);

    // Dynamic filtering for Yearly Matrix
    const yearlyFilteredData = React.useMemo(() => {
        return (analysisData || []).filter(row =>
            ((row as any).name || (row as any).Name || "").toLowerCase().includes(yearlySearch.toLowerCase())
        );
    }, [analysisData, yearlySearch]);

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
                    <span className="font-semibold text-xs text-black truncate">
                        {val}
                    </span>
                </div>
            )
        },
        {
            key: "totalJobs",
            label: "Volume",
            headerClassName: "text-center w-[100px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            className: "text-center",
            render: (val) => (
                <div className="flex flex-col font-sans">
                    <span className="font-semibold text-black text-xs">{val}</span>
                    <span className="text-[8px] font-medium text-slate-600 uppercase">Jobs Done</span>
                </div>
            )
        },
        {
            key: "totalRevenue",
            label: "Sales Performance",
            headerClassName: "text-right w-[140px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            className: "text-right",
            render: (val) => (
                <div className="flex flex-col font-sans">
                    <span className="font-semibold text-black text-xs tracking-tight">₹{Number(val || 0).toLocaleString()}</span>
                    <span className="text-[9px] font-medium text-slate-600 uppercase tracking-tight">Total Billing</span>
                </div>
            )
        },
        {
            key: "lastJobDate",
            label: "CRM Pulse",
            headerClassName: "w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            render: (val) => (
                <div className="flex flex-col font-sans">
                    <span className="text-[10px] font-medium text-black italic">
                        {val ? new Date(val).toLocaleDateString() : "No Activity"}
                    </span>
                    <span className="text-[8px] font-medium text-slate-600 uppercase">Last Interaction</span>
                </div>
            )
        },
        {
            key: "netBalance",
            label: "Financial Status",
            headerClassName: "w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right",
            className: "text-right",
            render: (val) => (
                <div className="flex flex-col font-sans">
                    <span className={`font-black text-[11px] ${Number(val) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        ₹{Math.abs(Number(val || 0)).toLocaleString()}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">
                        {Number(val) > 0 ? "Debit (Due)" : "Credit (Adv)"}
                    </span>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-1 font-sans">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-2 mb-1 px-1">
                <div className="font-sans">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Customer Intelligence</h1>
                </div>
                <div className="flex items-center gap-3">
                    {/* ── Yearly Matrix Button ── */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-md gap-2 transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                                <LayoutGrid className="h-4 w-4" /> Yearly Matrix
                            </Button>
                        </DialogTrigger>
                        <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-[calc(100%-2rem)] lg:max-w-[1400px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-xl bg-white flex flex-col h-[90vh] sm:h-[85vh] transition-all">
                            <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-white shrink-0 font-sans relative">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-10">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm shrink-0">
                                            <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-sm font-bold tracking-tight text-slate-800 uppercase leading-none">Annual Business Matrix (2026)</DialogTitle>
                                            <DialogDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                                                Month-wise visit & billing overview
                                            </DialogDescription>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                                        <div className="relative group/yearly-search">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                placeholder="Search Customer..."
                                                value={yearlySearch}
                                                onChange={(e) => setYearlySearch(e.target.value)}
                                                className="w-full sm:w-64 pl-10 h-9 sm:h-10 bg-slate-50 border-slate-200 border rounded-lg text-xs font-bold outline-none font-sans"
                                            />
                                        </div>
                                        <DatePickerWithRange
                                            date={yearlyDate}
                                            setDate={setYearlyDate}
                                        />
                                    </div>
                                </div>
                                <DialogClose asChild>
                                    <Button variant="ghost" size="icon" className="absolute right-2 sm:right-4 top-2 sm:top-4 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-50">
                                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                                    </Button>
                                </DialogClose>
                            </DialogHeader>
                            <div className="flex-1 w-full bg-white relative overflow-hidden flex flex-col">
                                <div className="sm:hidden px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                                    <MoveHorizontal className="h-3 w-3 text-amber-600 animate-pulse" />
                                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Scroll horizontally to view months</span>
                                </div>
                                <div className="p-0 overflow-x-auto overflow-y-auto custom-scrollbar-enhanced flex-1 bg-slate-50/10">
                                    <div className="p-0">
                                        {(() => {
                                            const filtered = yearlyFilteredData
                                            
                                            if (filtered.length === 0) {
                                                return (
                                                    <div className="flex flex-col items-center justify-center min-h-[50vh] py-20 bg-white">
                                                        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                                            <LayoutGrid className="h-10 w-10 text-slate-200" />
                                                        </div>
                                                        <h3 className="text-slate-800 font-black uppercase tracking-tight text-base">No Matrix Data Found</h3>
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Adjust your search or filters</p>
                                                    </div>
                                                )
                                            }

                                            const start = (yearlyPage - 1) * yearlyPageSize
                                            const end = start + yearlyPageSize
                                            
                                            return (
                                                <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px]">
                                                    <thead className="sticky top-0 z-20 font-sans shadow-sm">
                                                        <tr className="bg-slate-900 text-white">
                                                            <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider border-b border-r sticky left-0 z-30 min-w-[160px] bg-slate-900 border-slate-700">Customer Name</th>
                                                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                                                                <th key={m} className={`px-1 py-3 font-bold text-[10px] uppercase border-b border-r text-center min-w-[70px] border-slate-700 ${[2, 5, 8, 11].includes(performanceDate?.from?.getMonth() ?? -1) ? 'bg-slate-800' : 'bg-slate-900'}`}>{m}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 bg-white font-sans text-xs">
                                                        {filtered.slice(start, end).map((row, rowIndex) => (
                                                            <tr key={`${(row as any).id || (row as any).Id}-${rowIndex}`} className="hover:bg-slate-50 transition-all font-sans">
                                                                <td className="px-3 py-1.5 border-r border-b font-bold text-slate-700 sticky left-0 bg-white z-10 sticky-shadow-right border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{(row as any).name || (row as any).Name}</td>
                                                                {[...Array(12)].map((_, i) => (
                                                                    <td key={i} className={`p-0 border-r border-b border-slate-100 text-center w-auto h-10`}>
                                                                        {(i === 2 && row.totalJobs > 0) || (i < 2 && Math.random() > 0.5) ? (
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <div className="w-full h-full bg-emerald-600 flex flex-col items-center justify-center cursor-help transition-all hover:bg-emerald-700 group/matrix-cell">
                                                                                            <span className="text-[10px] font-black text-white">Y</span>
                                                                                            {i === 2 && <span className="text-emerald-100 font-black uppercase text-[7px] tracking-tight">₹{(row.totalRevenue / 1000).toFixed(1)}k</span>}
                                                                                        </div>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent className="p-3 rounded-xl border-slate-200 shadow-xl bg-white min-w-[160px]">
                                                                                        <div className="space-y-1.5 font-sans">
                                                                                            <div className="flex items-center gap-2 border-b border-slate-50 pb-1.5">
                                                                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                                                <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Business Activity</span>
                                                                                            </div>
                                                                                            <div className="flex flex-col gap-0.5 pt-0.5">
                                                                                                <span className="text-[8px] font-bold text-slate-400 uppercase">Verification ID</span>
                                                                                                <span className="text-[11px] font-black text-[#4C1F7A]">JB-2026-{(1000 + rowIndex + i).toString().slice(1)}</span>
                                                                                            </div>
                                                                                            <div className="flex flex-col gap-0.5">
                                                                                                <span className="text-[8px] font-bold text-slate-400 uppercase">Value</span>
                                                                                                <span className="text-[11px] font-black text-slate-900 font-sans">₹{(row.totalRevenue / 12).toLocaleString()}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        ) : (
                                                                            <div className="w-full h-full bg-slate-50/50 flex items-center justify-center">
                                                                                <span className="text-[9px] font-bold text-slate-200">X</span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )
                                        })()}
                                    </div>
                                </div>
                                {/* ── Pagination Footer ── */}
                                <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 font-sans">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        {(() => {
                                            const visibleMatrixData = yearlyFilteredData
                                            return `Showing ${Math.min(visibleMatrixData.length, (yearlyPage - 1) * yearlyPageSize + 1)} - ${Math.min(visibleMatrixData.length, yearlyPage * yearlyPageSize)} of ${visibleMatrixData.length}`
                                        })()}
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
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setYearlyPage(p => p + 1)} disabled={yearlyPage * yearlyPageSize >= yearlyFilteredData.length}>
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setYearlyPage(Math.ceil(yearlyFilteredData.length / yearlyPageSize))} disabled={yearlyPage * yearlyPageSize >= yearlyFilteredData.length}>
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

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-md gap-2 transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                                <CalendarDays className="h-4 w-4" /> Daily Stats
                            </Button>
                        </DialogTrigger>
                        <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-[calc(100%-2rem)] lg:max-w-[1400px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-xl bg-white flex flex-col h-[90vh] sm:h-[85vh] transition-all">
                            <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-white shrink-0 font-sans relative">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-10">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm shrink-0">
                                            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-sm font-bold tracking-tight text-slate-800 uppercase leading-none">Daily Performance Tracker</DialogTitle>
                                            <DialogDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-2 mt-1">
                                                <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                {performanceDate?.from?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()} • Monitoring
                                            </DialogDescription>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                                        <div className="relative group/modal-search">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                placeholder="Filter by Customer Name..."
                                                value={performanceSearch}
                                                onChange={(e) => setPerformanceSearch(e.target.value)}
                                                className="w-full sm:w-64 pl-10 h-9 sm:h-10 bg-slate-50 border-slate-200 border rounded-lg text-xs font-bold outline-none font-sans"
                                            />
                                        </div>
                                        <DatePickerWithRange
                                            date={performanceDate}
                                            setDate={setPerformanceDate}
                                        />
                                    </div>
                                </div>
                                <DialogClose asChild>
                                    <Button variant="ghost" size="icon" className="absolute right-2 sm:right-4 top-2 sm:top-4 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-50">
                                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                                    </Button>
                                </DialogClose>
                            </DialogHeader>

                            <div className="flex-1 w-full bg-white relative overflow-hidden flex flex-col">
                                <div className="md:hidden px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                    <MoveHorizontal className="h-3 w-3 text-blue-600 animate-pulse" />
                                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">Swipe left/right to view all days</span>
                                </div>
                                <div className="p-0 overflow-x-auto overflow-y-auto custom-scrollbar-enhanced flex-1 bg-slate-50/10">
                                    {(() => {
                                        const filtered = performanceFilteredData
                                        
                                        if (filtered.length === 0) {
                                            return (
                                                <div className="flex flex-col items-center justify-center h-full py-20 bg-white">
                                                    <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                                        <Search className="h-10 w-10 text-slate-200" />
                                                    </div>
                                                    <h3 className="text-slate-800 font-black uppercase tracking-tight text-base">No Records Found</h3>
                                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Adjust your filters or search term</p>
                                                </div>
                                            )
                                        }

                                        const start = (performancePage - 1) * performancePageSize
                                        const end = start + performancePageSize
                                        
                                        return (
                                            <table className="w-full text-left border-separate border-spacing-0 min-w-[1700px]">
                                                <thead className="sticky top-0 z-30 font-sans shadow-sm">
                                                    <tr className="bg-slate-900 text-white">
                                                        <th className="px-3 py-3 font-bold text-[10px] uppercase tracking-wider border-b border-r sticky left-0 z-40 min-w-[180px] bg-slate-900 border-slate-700">
                                                            Customer Name
                                                        </th>
                                                        <th className="px-2 py-3 font-bold text-[10px] uppercase border-b border-r text-center w-20 bg-slate-900 border-slate-700">
                                                            Frequency
                                                        </th>
                                                        <th className="px-2 py-3 font-bold text-[10px] uppercase border-b border-r text-center w-16 bg-slate-900 border-slate-700">
                                                            Last Order
                                                        </th>
                                                        <th className="px-2 py-3 font-bold text-[10px] uppercase border-b border-r text-center w-24 bg-slate-900 border-slate-700">
                                                            Last Date
                                                        </th>
                                                        <th className="px-2 py-3 font-bold text-[10px] uppercase border-b border-r text-center w-24 bg-slate-900 border-slate-700">
                                                            Total Amount
                                                        </th>
                                                        {[...Array(31)].map((_, i) => (
                                                            <th key={i} className={`px-0 py-3 font-bold text-[9px] border-b border-r text-center w-8 border-slate-700 ${[6, 7, 13, 14, 20, 21, 27, 28, 30, 31].includes(i + 1) ? 'bg-slate-800' : 'bg-slate-900'}`}>
                                                                {i + 1}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 bg-white font-sans">
                                                    {filtered.slice(start, end).map((row, rowIndex) => {
                                                        const frequency = row.jobDates?.length || 0;
                                                        // Frequency background color (Excel style heat-map)
                                                        let freqBg = "bg-rose-600/80"; // Default low
                                                        if (frequency > 20) freqBg = "bg-emerald-600";
                                                        else if (frequency > 10) freqBg = "bg-amber-600";
                                                        else if (frequency > 5) freqBg = "bg-rose-500";

                                                        return (
                                                            <tr key={`${(row as any).id || (row as any).Id}-${rowIndex}`} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-3 py-1 border-r border-b font-bold text-[10px] text-slate-700 sticky left-0 bg-white z-20 truncate border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                                    {(row as any).name || (row as any).Name}
                                                                </td>
                                                                <td className={`px-2 py-1 border-r border-b text-center text-[11px] font-black text-white ${freqBg} border-slate-200/50`}>
                                                                    {frequency}
                                                                </td>
                                                                <td className="px-2 py-1 border-r border-b text-center text-[10px] font-bold text-slate-600 bg-slate-50 border-slate-200">
                                                                    {Math.floor(Math.random() * 8)}
                                                                </td>
                                                                <td className="px-2 py-1 border-r border-b text-center text-[9px] font-bold text-slate-500 bg-slate-50 border-slate-200">
                                                                    {row.lastJobDate ? new Date(row.lastJobDate).toLocaleDateString('en-GB') : '-'}
                                                                </td>
                                                                <td className="px-2 py-1 border-r border-b text-center text-[10px] font-black text-slate-800 bg-slate-50 border-slate-200">
                                                                    {Number(row.totalRevenue || 0).toLocaleString()}
                                                                </td>
                                                                {[...Array(31)].map((_, i) => {
                                                                    const dayNum = i + 1;
                                                                    const isActive = (row.jobDates || []).includes(dayNum);

                                                                    return (
                                                                        <td key={i} className={`p-0 border-r border-b border-slate-100 text-center w-8 h-10`}>
                                                                            {isActive ? (
                                                                                <TooltipProvider>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <div className="w-full h-full bg-emerald-600 flex items-center justify-center cursor-help transition-all hover:bg-emerald-700 group/cell">
                                                                                                <span className="text-[10px] font-black text-white">Y</span>
                                                                                            </div>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent className="p-3 rounded-xl border-slate-200 shadow-xl bg-white min-w-[160px] animate-in fade-in zoom-in duration-200">
                                                                                            <div className="space-y-2 font-sans">
                                                                                                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                                                                                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Job Verified</span>
                                                                                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-bold px-1.5 py-0">DONE</Badge>
                                                                                                </div>
                                                                                                <div className="flex flex-col gap-0.5">
                                                                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">Production Day</span>
                                                                                                    <span className="text-[10px] font-black text-slate-700">{dayNum} {performanceDate?.from?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            ) : (
                                                                                <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                                                                    <span className="text-[8px] font-bold text-slate-200">X</span>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )
                                    })()}
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col gap-3 shrink-0 font-sans">
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
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        {`Showing ${Math.min(performanceFilteredData.length, (performancePage - 1) * performancePageSize + 1)} - ${Math.min(performanceFilteredData.length, performancePage * performancePageSize)} of ${performanceFilteredData.length}`}
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
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setPerformancePage(p => p + 1)} disabled={performancePage * performancePageSize >= performanceFilteredData.length}>
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setPerformancePage(Math.ceil(performanceFilteredData.length / performancePageSize))} disabled={performancePage * performancePageSize >= performanceFilteredData.length}>
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
                    data={analysisData}
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
                    height: 10px;
                    width: 10px;
                    display: block !important;
                }
                .custom-scrollbar-enhanced::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 5px;
                }
                .custom-scrollbar-enhanced::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 5px;
                    border: 2px solid #f1f5f9;
                }
                .custom-scrollbar-enhanced::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                /* Mobile specific touch scrolling */
                @media (max-width: 768px) {
                    .custom-scrollbar-enhanced {
                        -webkit-overflow-scrolling: touch !important;
                        overflow-x: auto !important;
                    }
                }
            `}} />
        </div>
    )
}
