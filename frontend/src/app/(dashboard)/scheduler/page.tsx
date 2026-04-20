"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn, parseJobDescription } from "@/lib/utils"
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, Layers,
    Activity, Printer, RefreshCcw, Eye, Settings2, FileText, Filter, X
} from "lucide-react"
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/shared/date-range-picker"
import { Button } from "@/components/ui/button"
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { UpdateStatusModal } from "@/components/shared/UpdateStatusModal"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// ─── Types ──────────────────────────────────────────────────────────────────
type JobCard = {
    id: number
    jobNumber: string
    customerName?: string
    jobDescription: string
    machineType: string
    quantity: number
    dispatchedQuantity: number
    jobStatus: string
    dueDate: string
    createdAt: string
    completedAt?: string
    designFilePath?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const getProcessIcon = (machine: string) => {
    if (machine?.includes("Offset")) return Printer
    if (machine?.includes("Digital")) return Printer
    if (machine?.includes("Wide")) return Activity
    return Layers
}

const statusColorMap: Record<string, string> = {
    "Pending": "bg-amber-100 text-amber-700 border-amber-200",
    "Designing": "bg-sky-100 text-sky-700 border-sky-200",
    "Printing": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Finishing": "bg-purple-100 text-purple-700 border-purple-200",
    "Completed": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Dispatched": "bg-slate-100 text-slate-700 border-slate-200",
    "Cancelled": "bg-rose-100 text-rose-700 border-rose-200"
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductionSchedulerPage() {
    const router = useRouter()
    const [jobs, setJobs] = useState<JobCard[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState("month")
    const [isLoading, setIsLoading] = useState(true)
    const [selectedDetailJob, setSelectedDetailJob] = useState<JobCard | null>(null)
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    })

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/jobcards?page=1&size=1000`)
            if (res.ok) {
                const data = await res.json()
                setJobs(data.items)
            }
        } catch (err) {
            toast.error("Failed to sync factory schedule")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const calendarCells = useMemo(() => {
        const cells = []
        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push({
                date: new Date(year, month - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
                isCurrentMonth: false
            })
        }
        for (let i = 1; i <= daysInMonth; i++) {
            cells.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            })
        }
        const totalCells = Math.ceil(cells.length / 7) * 7
        const remainingDays = totalCells - cells.length
        for (let i = 1; i <= remainingDays; i++) {
            cells.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            })
        }
        return cells
    }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth])

    const weekCells = useMemo(() => {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek)
            date.setDate(startOfWeek.getDate() + i)
            return { date, isCurrentMonth: date.getMonth() === month }
        })
    }, [currentDate, month])

    const next = () => {
        if (view === 'month') setCurrentDate(new Date(year, month + 1, 1))
        else if (view === 'week') {
            const nextWeek = new Date(currentDate)
            nextWeek.setDate(currentDate.getDate() + 7)
            setCurrentDate(nextWeek)
        }
    }

    const prev = () => {
        if (view === 'month') setCurrentDate(new Date(year, month - 1, 1))
        else if (view === 'week') {
            const prevWeek = new Date(currentDate)
            prevWeek.setDate(currentDate.getDate() - 7)
            setCurrentDate(prevWeek)
        }
    }

    const today = () => setCurrentDate(new Date())

    const filteredJobs = useMemo(() => {
        if (!dateRange?.from) return jobs;
        
        // Normalize search dates to start/end of day
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        
        const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
        toDate.setHours(23, 59, 59, 999);

        return jobs.filter(job => {
            if (!job.dueDate) return false;
            const jobDate = new Date(job.dueDate);
            return jobDate >= fromDate && jobDate <= toDate;
        });
    }, [jobs, dateRange])

    const renderCellContent = (date: Date) => {
        const cellJobs = jobs.filter(job => {
            const d = new Date(job.dueDate)
            const c = job.completedAt ? new Date(job.completedAt) : null
            
            const matchesDue = d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
            const matchesComp = c && c.getDate() === date.getDate() && c.getMonth() === date.getMonth() && c.getFullYear() === date.getFullYear()
            
            return matchesDue || matchesComp
        })

        return (
            <div className="flex-1 overflow-y-auto space-y-[4px] no-scrollbar pb-1 px-1 mt-1">
                {cellJobs.map((job, idx) => {
                    const statusStyle = statusColorMap[job.jobStatus] || "bg-slate-100 text-slate-500 border-slate-200"

                    return (
                        <div 
                            key={idx} 
                            onClick={() => setSelectedDetailJob(job)}
                            className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-tight truncate border-l-[3px] shadow-sm cursor-pointer hover:translate-x-1 transition-all ${statusStyle}`}
                        >
                            {job.jobNumber}
                        </div>
                    )
                })}
            </div>
        )
    }

    const listColumns: ColumnDef<JobCard>[] = [
        {
            key: 'dueDate',
            label: 'Production Deadline',
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400",
            render: (val) => <span className="text-xs font-bold text-rose-600">{new Date(val as string).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        },
        {
            key: 'jobNumber',
            label: 'Ticket#',
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400",
            className: "font-bold text-[#4C1F7A] text-[11px]",
        },
        {
            key: 'customerName',
            label: 'Customer Identity',
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400",
            render: (val) => <span className="text-xs font-bold text-slate-800 uppercase">{val || "Unknown Client"}</span>
        },
        {
            key: 'jobStatus',
            label: 'Factory Status',
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400",
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    <Badge className={`font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm border-none shadow-sm ${statusColorMap[val as string] || 'bg-slate-100'}`}>
                        {val as string}
                    </Badge>
                    <UpdateStatusModal job={row} onUpdate={fetchJobs} />
                </div>
            )
        }
    ]

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] font-sans mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pt-2 uppercase font-sans border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE]">
                        <CalendarIcon className="h-5 w-5 text-[#4C1F7A]" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-none">Factory Schedule</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <Button variant="outline" size="sm" onClick={fetchJobs} className="h-9 px-4 border-slate-200 text-slate-600 font-bold text-[10px] rounded-xl uppercase">
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Sync Factory
                    </Button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between py-4 gap-4 uppercase font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center rounded-xl border border-slate-200 text-slate-600 bg-white shadow-sm overflow-hidden w-full sm:w-auto">
                        <button onClick={prev} className="flex-1 sm:flex-none px-4 py-2 hover:bg-slate-50 border-r border-slate-200 flex items-center justify-center transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={next} className="flex-1 sm:flex-none px-4 py-2 hover:bg-slate-50 border-r border-slate-200 flex items-center justify-center transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button onClick={today} className="flex-[2] sm:flex-none px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Today</button>
                    </div>

                    <div className="text-xl text-slate-800 font-bold uppercase tracking-tight hidden sm:block">
                        {view === 'week' ? `Week of ${currentDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}` : `${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}`}
                    </div>
                </div>

                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 p-1 overflow-hidden w-full sm:w-auto">
                    <button
                        onClick={() => setView('month')}
                        className={`flex-1 sm:flex-none px-6 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all rounded-lg ${view === 'month' ? 'bg-[#4C1F7A] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                    >Month</button>
                    <button
                        onClick={() => setView('week')}
                        className={`flex-1 sm:flex-none px-6 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all rounded-lg ${view === 'week' ? 'bg-[#4C1F7A] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                    >Week</button>
                    <button
                        onClick={() => setView('list')}
                        className={`flex-1 sm:flex-none px-6 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all rounded-lg ${view === 'list' ? 'bg-[#4C1F7A] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                    >List</button>
                </div>
            </div>

            <div className="flex-1 flex flex-col border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm scrollbar-hide">
                {view !== 'list' ? (
                    <>
                        <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                                <div key={dayName} className="text-center py-2 text-[10px] font-bold uppercase tracking-widest text-[#4C1F7A]">
                                    {dayName}
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className={`grid grid-cols-7 min-h-full ${view === 'month' ? 'auto-rows-fr' : ''}`}>
                            {((view === 'month' ? calendarCells : weekCells) as any[]).map((cell, idx) => {
                                const isToday =
                                    new Date().getDate() === cell.date.getDate() &&
                                    new Date().getMonth() === cell.date.getMonth() &&
                                    new Date().getFullYear() === cell.date.getFullYear()

                                return (
                                    <div key={idx} className={`border-r border-b border-slate-50 last:border-r-0 p-1 flex flex-col transition-colors hover:bg-slate-50/30 ${!cell.isCurrentMonth && view === 'month' ? 'opacity-30' : ''} ${view === 'week' ? 'min-h-[400px]' : 'min-h-[100px]'}`}>
                                        <div className="text-right px-1 pb-1">
                                            <span className={`inline-block text-[11px] font-bold p-1 px-1.5 ${isToday ? 'bg-rose-600 text-white rounded-md min-w-[24px] text-center shadow-lg' : 'text-slate-400'}`}>
                                                {cell.date.getDate()}
                                            </span>
                                        </div>
                                        {renderCellContent(cell.date)}
                                    </div>
                                )
                            })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 p-0 overflow-y-auto w-full custom-scrollbar">
                        <DataGrid 
                            columns={listColumns} 
                            data={filteredJobs} 
                            isLoading={isLoading}
                            searchPlaceholder="Audit factory timeline by Ticket# or Customer..." 
                            hideTitle={true}
                        />
                    </div>
                )}
            </div>

            <Dialog open={!!selectedDetailJob} onOpenChange={(open) => !open && setSelectedDetailJob(null)}>
                <DialogContent showCloseButton={false} className="p-0 border-none max-w-[400px] overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-300 shadow-2xl">

                   {selectedDetailJob && (() => {
                       const job = selectedDetailJob;
                       const statusStyle = statusColorMap[job.jobStatus] || "bg-slate-100 text-slate-500 border-slate-200";
                       return (
                           <div className="flex flex-col bg-white dark:bg-slate-900 max-h-[85vh]">
                                {/* Refined Header */}
                                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                <Layers className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Ticket #{job.jobNumber}</DialogTitle>
                                                    <Badge className={cn("text-[8px] font-bold border-none shadow-none px-2 py-0.5 rounded uppercase tracking-wider", statusStyle)}>
                                                        {job.jobStatus}
                                                    </Badge>
                                                </div>
                                                <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Operational Manifest Record</DialogDescription>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-800"
                                            onClick={() => setSelectedDetailJob(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">

                                    {/* Core Information Section */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Client Identity Card */}
                                        <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">

                                            <div className="flex items-center gap-2 mb-2">
                                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Client Identity</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase truncate">
                                                {job.customerName || "WALK-IN CLIENT"}
                                            </p>
                                        </div>

                                        {/* Product Spec Card */}
                                        <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">

                                            <div className="flex items-center gap-2 mb-2">
                                                <Settings2 className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Job Specifications</span>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border-l-2 border-indigo-500">
                                                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                                                    {parseJobDescription(job.jobDescription)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Production Analytics Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Printer className="h-3 w-3 text-slate-400" />
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Print Unit</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase break-words">{job.machineType}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Activity className="h-3 w-3 text-emerald-500" />
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Output Volume</span>
                                            </div>
                                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">{job.quantity.toLocaleString()} Units</p>
                                        </div>


                                        {/* Design Preview Section */}
                                        {job.designFilePath && (
                                            <div className="col-span-2 p-4 rounded-xl border border-indigo-100 bg-indigo-50/20">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <FileText className="h-4 w-4 text-indigo-500" />
                                                    <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Design Reference</span>
                                                </div>
                                                {/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(job.designFilePath) ? (
                                                    <img 
                                                        src={job.designFilePath.startsWith('http') ? job.designFilePath : `${API_BASE}/${job.designFilePath}`}
                                                        className="w-full h-32 object-contain rounded-lg border border-indigo-100 bg-white shadow-sm"
                                                        alt="Design"
                                                    />
                                                ) : (
                                                    <div className="h-16 flex items-center justify-center bg-white rounded-lg border border-indigo-100">
                                                        <a 
                                                            href={job.designFilePath.startsWith('http') ? job.designFilePath : `${API_BASE}/${job.designFilePath}`}
                                                            target="_blank" rel="noreferrer"
                                                            className="text-[10px] font-bold text-indigo-600 uppercase underline"
                                                        >
                                                            View/Download Document
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timeline Matrix */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Created Date</p>
                                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{new Date(job.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">Deadline</p>
                                                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">{new Date(job.dueDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: "70%" }}
                                                className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)] shadow-indigo-500/30"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Console */}
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <UpdateStatusModal job={job} onUpdate={() => { fetchJobs(); setSelectedDetailJob(null); }} />
                                    </div>
                                    <Button 
                                        className="h-10 px-6 bg-slate-900 border-none dark:bg-white dark:text-slate-900 text-white font-bold uppercase text-[10px] tracking-wider rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center gap-2"
                                        onClick={() => router.push("/jobs")}
                                    >
                                        <Eye className="h-3.5 w-3.5" /> Full Record
                                    </Button>
                                </div>
                           </div>
                       );
                   })()}
                </DialogContent>
            </Dialog>
        </div>
    )
}
