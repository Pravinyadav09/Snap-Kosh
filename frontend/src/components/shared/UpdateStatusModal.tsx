"use client"
import { API_BASE } from '@/lib/api'

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit2, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

const statuses = [
    { label: "Pending",   dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"  },
    { label: "Designing", dot: "bg-sky-400",      text: "text-sky-700",     bg: "bg-sky-50",     border: "border-sky-200"    },
    { label: "Printing",  dot: "bg-indigo-500",   text: "text-indigo-700",  bg: "bg-indigo-50",  border: "border-indigo-200" },
    { label: "Finishing", dot: "bg-purple-500",   text: "text-purple-700",  bg: "bg-purple-50",  border: "border-purple-200" },
    { label: "Completed", dot: "bg-emerald-500",  text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200"},
    { label: "Dispatched",dot: "bg-slate-500",    text: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200"  },
    { label: "Cancelled", dot: "bg-rose-500",     text: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200"   },
]

interface UpdateStatusModalProps {
    job: any
    onUpdate: () => void
}

export function UpdateStatusModal({ job, onUpdate }: UpdateStatusModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState<string | null>(null)

    const handleUpdate = async (status: string) => {
        setIsUpdating(status)
        try {
            const res = await fetch(`${API_BASE}/api/jobcards/${job.id}/status?status=${status}`, {
                method: "PATCH"
            })
            if (res.ok) {
                toast.success(`Status updated to ${status}`, {
                    description: `Job ${job.jobNumber} is now ${status}.`
                })
                setIsOpen(false)
                onUpdate()
            } else {
                toast.error("Status update failed")
            }
        } catch {
            toast.error("Network error — try again.")
        } finally {
            setIsUpdating(null)
        }
    }

    const [dynamicStatuses, setDynamicStatuses] = useState<any[]>([])

    React.useEffect(() => {
        if (isOpen) {
            fetch(`${API_BASE}/api/dropdowns/JobStatus`)
                .then(r => r.ok ? r.json() : [])
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setDynamicStatuses(data.map((d: any) => {
                           let meta = {}
                           try { if (d.metadata) meta = JSON.parse(d.metadata) } catch {}
                           // Merge with default styling if missing
                           const fallback = statuses.find(s => s.label === d.label) || statuses[0]
                           return { ...fallback, ...meta, label: d.label, value: d.value }
                        }))
                    } else {
                        setDynamicStatuses(statuses)
                    }
                })
                .catch(() => setDynamicStatuses(statuses))
        }
    }, [isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-md"
                >
                    <Edit2 className="h-3 w-3" />
                </Button>
            </DialogTrigger>            <DialogContent className="sm:max-w-[380px] p-0 border border-slate-200 rounded-2xl shadow-2xl bg-white font-sans overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header - Compact Theme */}
                <DialogHeader className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 relative">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-1.5 rounded-lg border border-indigo-100 bg-white text-indigo-600 shadow-sm">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 not-italic leading-none">
                                Update Production State
                            </DialogTitle>
                            <DialogDescription className="hidden">Synchronize the factory floor production stage in real-time.</DialogDescription>
                            <div className="flex items-center gap-3 mt-1.5">
                                <p className="text-xs font-black text-slate-800 tracking-tight font-sans uppercase">{job.jobNumber}</p>
                                <span className="text-[8px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase tracking-widest border border-indigo-100">Live</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Status Selection Area - Grid Layout */}
                <div className="px-5 py-4 space-y-3 font-sans">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Select Department Stage</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                        {dynamicStatuses.map((s) => {
                            const isActive = job.jobStatus === s.label
                            const loading = isUpdating === s.label
                            return (
                                <button
                                    key={s.label}
                                    disabled={!!isUpdating}
                                    onClick={() => !isActive && handleUpdate(s.label)}
                                    className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200 text-left
                                        ${isActive
                                            ? `bg-indigo-50/30 border-indigo-200`
                                            : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 text-slate-600'
                                        }
                                        ${!!isUpdating && !loading ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer active:scale-[0.98]'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-white shadow-sm' : 'bg-slate-50 group-hover:bg-white'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${isActive ? 'ring-2 ring-indigo-500/20' : ''}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase tracking-wider transition-colors font-sans ${isActive ? 'text-indigo-600' : 'text-slate-700'}`}>
                                                {s.label}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter font-sans">
                                                {isActive ? "ACTIVE STAGE" : "Proceed to " + s.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {loading
                                            ? <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                                            : isActive
                                                ? <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                                                : <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                                        }
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Simplified Footer */}
                <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 font-sans">
                        Persistent Factory Synchronization Active
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
