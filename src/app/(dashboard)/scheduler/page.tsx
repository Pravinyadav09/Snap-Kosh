"use client"

import React, { useState, useMemo } from "react"
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Layers,
    Activity,
    Printer,
    Scissors
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type JobProcess = "Printing" | "Binding" | "Lamination" | "Finishing"
type JobStatus = "In Progress" | "Completed"

type ScheduledJob = {
    id: string
    customer: string
    date: Date
    status: JobStatus
    process: JobProcess
}

const generateMockJobs = (): ScheduledJob[] => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    return [
        { id: "JOB-42380", customer: "Powlow", date: new Date(year, month, 1), status: "In Progress", process: "Printing" },
        { id: "JOB-83077", customer: "Hyatt-Kutch", date: new Date(year, month, 1), status: "In Progress", process: "Binding" },
        { id: "JOB-88403", customer: "Crona Group", date: new Date(year, month, 1), status: "In Progress", process: "Finishing" },
        { id: "JOB-13664", customer: "Powlow", date: new Date(year, month, 2), status: "In Progress", process: "Printing" },
        { id: "JOB-27009", customer: "Kuhlman", date: new Date(year, month, 2), status: "In Progress", process: "Lamination" },
        { id: "JOB-46608", customer: "Crona G", date: new Date(year, month, 2), status: "In Progress", process: "Finishing" },
        { id: "JOB-56871", customer: "Harris", date: new Date(year, month, 2), status: "In Progress", process: "Binding" },
        { id: "JOB-56246", customer: "Crona Group", date: new Date(year, month, 3), status: "In Progress", process: "Binding" },
        { id: "JOB-60956", customer: "Harris", date: new Date(year, month, 3), status: "In Progress", process: "Printing" },
        { id: "JOB-00207", customer: "Barton", date: new Date(year, month, 4), status: "In Progress", process: "Binding" },
        { id: "JOB-26284", customer: "Barton", date: new Date(year, month, 5), status: "In Progress", process: "Printing" },
        { id: "JOB-36922", customer: "Hegmann", date: new Date(year, month, 6), status: "In Progress", process: "Finishing" },
        { id: "JB-2026-0033", customer: "Denesik", date: new Date(year, month, 6), status: "Completed", process: "Printing" },
        { id: "JB-2026-0033", customer: "Denesik", date: new Date(year, month, 9), status: "In Progress", process: "Lamination" },
        { id: "JB-2026-0034", customer: "Denesik", date: new Date(year, month, 11), status: "Completed", process: "Lamination" },
        { id: "JB-2026-0034", customer: "Denesik", date: new Date(year, month, 13), status: "In Progress", process: "Finishing" },
        { id: "JOB-41706", customer: "Senger", date: new Date(year, month, 4), status: "In Progress", process: "Printing" },
        { id: "JOB-51824", customer: "Kuhlman", date: new Date(year, month, 4), status: "In Progress", process: "Binding" },
        { id: "JOB-54761", customer: "Schuster", date: new Date(year, month, 4), status: "In Progress", process: "Lamination" },
        { id: "JOB-90891", customer: "Glover", date: new Date(year, month, 6), status: "In Progress", process: "Lamination" },
    ]
}

export default function ProductionSchedulerPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState("month")

    const mockJobs = useMemo(() => generateMockJobs(), [])

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

    const listJobs = useMemo(() => {
        return [...mockJobs].sort((a, b) => a.date.getTime() - b.date.getTime())
    }, [mockJobs])

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

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    const renderCellContent = (date: Date) => {
        const cellJobs = mockJobs.filter(
            job =>
                job.date.getDate() === date.getDate() &&
                job.date.getMonth() === date.getMonth() &&
                job.date.getFullYear() === date.getFullYear()
        )

        return (
            <div className="flex-1 overflow-y-auto space-y-[2px] no-scrollbar pb-1 px-1">
                <TooltipProvider delayDuration={0}>
                    {cellJobs.map((job, jIdx) => {
                        const isPrimary = job.status !== "In Progress"
                        const prefix = job.status === "In Progress" ? "Due:" : "Start:"

                        const ProcessIcon =
                            job.process === "Printing" ? Printer :
                                job.process === "Binding" ? Layers :
                                    job.process === "Lamination" ? Activity : Scissors

                        return (
                            <Tooltip key={jIdx}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`px-1.5 py-0.5 rounded-[3px] text-white text-[10px] font-sans truncate cursor-pointer hover:opacity-90 transition-opacity ${!isPrimary ? 'bg-[#d9534f]' : ''}`}
                                        style={isPrimary ? { background: 'var(--primary)' } : {}}
                                    >
                                        {prefix} {job.id} - {job.customer}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-white text-slate-800 border-2 border-slate-100 p-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] max-w-[240px] z-50 animate-in zoom-in-95 duration-200">
                                    <div className="space-y-2">
                                        <div className="font-black text-sm tracking-tight border-b pb-1.5" style={{ borderBottomColor: isPrimary ? 'color-mix(in srgb, var(--primary), white 80%)' : '#e2e8f0' }}>{job.id}</div>
                                        <div className="text-xs text-slate-600 font-medium">Customer: <b className="text-slate-900">{job.customer}</b></div>
                                        <div
                                            className="text-[10px] font-bold uppercase w-fit px-2 py-0.5 rounded-md"
                                            style={isPrimary ? { background: 'color-mix(in srgb, var(--primary), white 90%)', color: 'var(--primary)' } : { background: '#d9534f1a', color: '#d9534f' }}
                                        >
                                            Status: {job.status}
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                            <div className="p-1.5 rounded-md bg-slate-100 border border-slate-200">
                                                <ProcessIcon className="h-3.5 w-3.5 text-slate-600" />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Process: {job.process}</span>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </TooltipProvider>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] font-sans bg-white p-6 pt-0">
            {/* Header / Title */}
            <div className="flex items-center gap-3 mb-2 pt-2">
                <CalendarIcon className="h-5 w-5 text-slate-500" />
                <h1 className="text-xl text-slate-700">Production Scheduler</h1>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center rounded-md border border-slate-300 text-slate-600 bg-white">
                    <button onClick={prev} className="px-3 py-1.5 hover:bg-slate-50 border-r border-slate-300 flex items-center justify-center transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={next} className="px-3 py-1.5 hover:bg-slate-50 border-r border-slate-300 flex items-center justify-center transition-colors">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button onClick={today} className="px-5 py-1.5 text-[0.9rem] hover:bg-slate-50 pb-[0.4rem] transition-colors">
                        today
                    </button>
                </div>

                <div className="text-2xl text-slate-700 font-sans">
                    {view === 'week' ? `Week of ${currentDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}` : `${monthNames[month]} ${year}`}
                </div>

                <div className="flex items-center rounded-md border border-slate-300 bg-white overflow-hidden text-[0.9rem]">
                    <button
                        onClick={() => setView('month')}
                        className={`px-4 py-1.5 border-r border-slate-300 pb-[0.4rem] transition-colors ${view === 'month' ? 'text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                        style={view === 'month' ? { background: 'var(--primary)' } : {}}
                    >month</button>
                    <button
                        onClick={() => setView('week')}
                        className={`px-4 py-1.5 border-r border-slate-300 pb-[0.4rem] transition-colors ${view === 'week' ? 'text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                        style={view === 'week' ? { background: 'var(--primary)' } : {}}
                    >week</button>
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-1.5 pb-[0.4rem] transition-colors ${view === 'list' ? 'text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                        style={view === 'list' ? { background: 'var(--primary)' } : {}}
                    >list</button>
                </div>
            </div>

            {/* View Container */}
            <div className="flex-1 flex flex-col border border-slate-300 rounded-sm overflow-hidden bg-white scrollbar-hide">
                {view !== 'list' ? (
                    <>
                        <div className="grid grid-cols-7 border-b border-slate-300">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                                <div key={dayName} className="text-center py-2 text-[0.8rem]" style={{ color: 'var(--primary)' }}>
                                    {dayName}
                                </div>
                            ))}
                        </div>

                        <div className={`flex-1 grid grid-cols-7 ${view === 'month' ? 'auto-rows-fr' : ''}`}>
                            {(view === 'month' ? calendarCells : weekCells).map((cell, idx) => {
                                const isToday =
                                    new Date().getDate() === cell.date.getDate() &&
                                    new Date().getMonth() === cell.date.getMonth() &&
                                    new Date().getFullYear() === cell.date.getFullYear()

                                return (
                                    <div key={idx} className={`border-r border-b border-slate-200 last:border-r-0 p-0.5 flex flex-col ${view === 'week' ? 'min-h-[400px]' : 'min-h-[100px]'}`}>
                                        <div className="text-right px-1 pb-1">
                                            <span
                                                className={`inline-block text-[13px] font-sans p-1 px-1.5 ${!cell.isCurrentMonth && view === 'month' ? 'text-slate-400' : 'cursor-pointer hover:underline'} ${isToday ? 'bg-[#dc3545] text-white rounded-[3px] min-w-[24px] text-center hover:no-underline font-medium' : ''}`}
                                                style={(!cell.isCurrentMonth && view === 'month') || isToday ? {} : { color: 'var(--primary)' }}
                                            >
                                                {cell.date.getDate()}
                                            </span>
                                        </div>
                                        {renderCellContent(cell.date)}
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-y-auto bg-slate-50/30">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-[#f8f9fa] border-b border-slate-300 z-10">
                                <tr className="text-[0.75rem] font-bold text-slate-600">
                                    <th className="px-6 py-3 border-r border-slate-300">Date</th>
                                    <th className="px-6 py-3 border-r border-slate-300">Job ID</th>
                                    <th className="px-6 py-3 border-r border-slate-300">Customer</th>
                                    <th className="px-6 py-3 border-r border-slate-300">Process</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white font-sans text-[0.85rem]">
                                {listJobs.map((job, idx) => (
                                    <tr key={idx} className="border-b border-slate-200 hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 border-r border-slate-200 text-slate-500 whitespace-nowrap">
                                            {job.date.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 border-r border-slate-200 font-bold" style={{ color: 'var(--primary)' }}>
                                            {job.id}
                                        </td>
                                        <td className="px-6 py-4 border-r border-slate-200 text-slate-700">
                                            {job.customer}
                                        </td>
                                        <td className="px-6 py-4 border-r border-slate-200 text-slate-600 italic">
                                            {job.process}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider"
                                                style={job.status !== "In Progress" ? { background: 'color-mix(in srgb, var(--primary), white 90%)', color: 'var(--primary)' } : { background: '#d9534f1a', color: '#d9534f' }}
                                            >
                                                {job.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
