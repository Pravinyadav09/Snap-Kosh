"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
    Truck, Package, Plus, Search, Filter, ArrowUpRight, MapPin,
    CheckCircle2, Clock, User, ChevronRight, Info, Calendar,
    Printer, FileText, ExternalLink, Box, History, MoreVertical,
    Zap, AlertCircle, RefreshCcw, Eye, BadgeIndianRupee
} from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Can } from "@/components/shared/permission-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { cn } from "@/lib/utils"

// --- Types ---
type JobCard = {
    id: number
    jobNumber: string
    customerName?: string
    jobDescription: string
    quantity: number
    dispatchedQuantity: number
    jobStatus: string
    dueDate: string
    priority?: string // Custom logic if not in DB
}

// --- Main Page ---
export default function DispatchBoardPage() {
    const router = useRouter()
    const [jobs, setJobs] = useState<JobCard[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showDispatchModal, setShowDispatchModal] = useState(false)
    const [selectedJob, setSelectedJob] = useState<JobCard | null>(null)
    const [dispatchQty, setDispatchQty] = useState<number>(0)
    const [deliveryMode, setDeliveryMode] = useState("Staff")
    const [deliveryModes, setDeliveryModes] = useState<{label: string, value: string}[]>([])
    const [trackingRef, setTrackingRef] = useState("")
    const [showDetailsModal, setShowDetailsModal] = useState(false)

    // Bulk Dispatch
    const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [bulkDispatchItems, setBulkDispatchItems] = useState<{job: JobCard, qty: number}[]>([])
    const [isProcessingBulk, setIsProcessingBulk] = useState(false)

    // History Stats
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [historyLogs, setHistoryLogs] = useState<any[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    const fetchDropdowns = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/dropdowns/DeliveryMode`)
            if (res.ok) {
                const data = await res.json()
                const options = data.map((d: any) => ({
                    label: d.label || d.Label,
                    value: d.value || d.Value
                }))
                setDeliveryModes(options)
                if (options.length > 0 && !deliveryMode) setDeliveryMode(options[0].value)
            }
        } catch (err) {
            console.error("Failed to fetch delivery modes")
        }
    }

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/jobcards?page=1&size=1000`)
            if (res.ok) {
                const data = await res.json()
                // Filter for jobs that are in stages ready for dispatch or already being dispatched
                const dispatchable = (data.items || []).filter((j: JobCard) => 
                    ["Completed", "Partial", "Printing", "Finishing"].includes(j.jobStatus)
                )
                setJobs(dispatchable)
            }
        } catch (err) {
            toast.error("Failed to sync dispatch queue")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
        fetchDropdowns()
    }, [])

    const handleOpenDispatch = (job: JobCard) => {
        setSelectedJob(job)
        setDispatchQty(job.quantity - job.dispatchedQuantity)
        setTrackingRef("")
        setShowDispatchModal(true)
    }

    const handleConfirmDispatch = async () => {
        if (!selectedJob) return

        if (dispatchQty <= 0 || dispatchQty > (selectedJob.quantity - selectedJob.dispatchedQuantity)) {
            toast.error("Invalid Quantity", { description: "Shipment volume exceeds factory balance." })
            return
        }

        try {
            const params = new URLSearchParams({
                qty: dispatchQty.toString(),
                mode: deliveryMode,
                trackingRef: trackingRef || "Internal"
            })
            const res = await fetch(`${API_BASE}/api/jobcards/${selectedJob.id}/dispatch?${params.toString()}`, {
                method: "POST"
            })

            if (res.ok) {
                toast.success("Shipment Dispatched", {
                    description: `${dispatchQty} units registered for ${selectedJob.jobNumber}`,
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                })
                setShowDispatchModal(false)
                fetchJobs()
            } else {
                toast.error("Dispatch Failed", { description: "Broker rejected the shipment request." })
            }
        } catch (err) {
            toast.error("Network Error", { description: "Check server connectivity." })
        }
    }

    const handleOpenBulkDispatch = () => {
        const itemsToDispatch = jobs.filter(j => selectedJobIds.includes(j.id.toString()))
            .map(j => ({
                job: j,
                qty: j.quantity - j.dispatchedQuantity
            }))
        
        if (itemsToDispatch.length === 0) {
            toast.error("Selection Empty", { description: "Please select jobs from the list first." })
            return
        }
        
        setBulkDispatchItems(itemsToDispatch)
        setTrackingRef("")
        setShowBulkModal(true)
    }

    const handleConfirmBulkDispatch = async () => {
        setIsProcessingBulk(true)
        const batchId = `BATCH-${Date.now()}`
        let successCount = 0
        let failCount = 0

        for (const item of bulkDispatchItems) {
            if (item.qty <= 0) continue

            try {
                // Formatting trackingRef to include Batch ID for grouping in History
                const finalTrackingRef = `${trackingRef || "Bulk Dispatch"} [${batchId}]`
                
                const params = new URLSearchParams({
                    qty: item.qty.toString(),
                    mode: deliveryMode,
                    trackingRef: finalTrackingRef
                })
                const res = await fetch(`${API_BASE}/api/jobcards/${item.job.id}/dispatch?${params.toString()}`, {
                    method: "POST"
                })

                if (res.ok) successCount++
                else failCount++
            } catch (err) {
                failCount++
            }
        }

        setIsProcessingBulk(false)
        setShowBulkModal(false)
        setSelectedJobIds([])
        fetchJobs()

        if (successCount > 0) {
            toast.success("Bulk Operation Complete", { 
                description: `Successfully dispatched ${successCount} jobs.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
                icon: <Zap className="h-4 w-4 text-amber-500" />
            })
        } else if (failCount > 0) {
            toast.error("Bulk Operation Failed", { description: `Failed to dispatch ${failCount} jobs.` })
        }
    }

    const handleViewHistory = async (job: JobCard) => {
        setIsLoadingHistory(true)
        setSelectedJob(job)
        setShowHistoryModal(true)
        try {
            const res = await fetch(`${API_BASE}/api/audit/entity/JobCard/${job.id}?v=${Date.now()}`)
            if (res.ok) {
                const logsData = await res.json()
                const logs = logsData.items || logsData || []
                
                // Flexible filter for 'Action' or 'action' and different cases of 'DISPATCH'
                const filtered = logs.filter((l: any) => {
                    const actionVal = (l.action || l.Action || "")?.toString().toUpperCase()
                    return actionVal === "DISPATCH"
                })
                setHistoryLogs(filtered)
            }
        } catch (err) {
            toast.error("Failed to fetch history")
        } finally {
            setIsLoadingHistory(false)
        }
    }

    const columns: ColumnDef<JobCard>[] = [
        {
            key: "jobNumber",
            label: "Ticket#",
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400 font-sans",
            render: (val) => <span className="text-[11px] font-bold text-[#4C1F7A] uppercase">#{val}</span>
        },
        {
            key: "jobDescription",
            label: "Order Details",
            render: (val, row) => {
                let summary = val;
                try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        summary = parsed.map(i => i.description).join(", ");
                    }
                } catch (e) {}
                
                return (
                    <div className="flex flex-col gap-0.5 py-1 max-w-[300px]">
                        <span className="font-sans text-sm font-bold text-slate-800 tracking-tight leading-tight line-clamp-1">{summary}</span>
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 uppercase tracking-tight">
                            <User className="h-2.5 w-2.5 opacity-50" /> {row.customerName || "REGULAR CLIENT"}
                        </span>
                    </div>
                )
            }
        },
        {
            key: "quantity",
            label: "Production Load",
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400 font-sans",
            render: (val, row) => (
                <div className="flex flex-col gap-1.5 ">
                    <span className="text-[12px] font-bold text-slate-700">{val.toLocaleString()} Units</span>
                    <div className="w-24 bg-slate-100 rounded-full overflow-hidden h-1.5 border border-slate-100 shadow-inner-sm">
                        <div 
                            className="h-full bg-emerald-500 shadow-lg shadow-emerald-200" 
                            style={{ width: `${(row.dispatchedQuantity / row.quantity) * 100}%` }}
                        />
                    </div>
                </div>
            )
        },
        {
            key: "dispatchedQuantity",
            label: "Transit Status",
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400 font-sans",
            render: (val, row) => {
                const balance = row.quantity - (val as number)
                return (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[12px] font-bold tabular-nums ${balance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {balance.toLocaleString()} Left
                            </span>
                            {balance > 0 && (val as number) > 0 && <Badge className="text-[8px] h-3.5 px-1 bg-amber-100 text-amber-600 border-none uppercase font-bold shadow-inner-sm">Partial</Badge>}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Shipped: {val.toLocaleString()} Units</span>
                    </div>
                )
            }
        },
        {
            key: "dueDate",
            label: "Shipment Goal",
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400 font-sans",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-300" />
                    <span className="text-[11px] font-bold text-slate-600">{new Date(val as string).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</span>
                </div>
            )
        },
        {
            key: "actions",
            label: "Operations",
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400 font-sans",
            className: "text-right",
            render: (_, row) => {
                const balance = row.quantity - row.dispatchedQuantity
                return (
                    <div className="flex items-center justify-end gap-1.5 px-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setSelectedJob(row); setShowDetailsModal(true); }}
                            className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 transition-all font-sans rounded-full"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        {row.dispatchedQuantity > 0 && (
                            <>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleViewHistory(row)}
                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all rounded-full"
                                >
                                    <History className="h-4 w-4" />
                                </Button>
                                {row.dispatchedQuantity > 0 && (
                                    <Can I="create" a="finance">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => router.push(`/invoices?jobId=${row.id}`)}
                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                                            title="Convert to Invoice"
                                        >
                                            <BadgeIndianRupee className="h-4 w-4" />
                                        </Button>
                                    </Can>
                                )}
                            </>
                        )}
                        {balance > 0 ? (
                            <Button 
                                type="button"
                                onClick={() => handleOpenDispatch(row)}
                                className="h-8 px-4 text-[9px] font-bold uppercase tracking-widest text-white shadow-xl flex items-center gap-2 transition-all active:scale-95 rounded-lg"
                                style={{ background: 'var(--primary)' }}
                            >
                                <Truck className="h-3 w-3" /> Ship Load
                            </Button>
                        ) : (
                            <Badge className="h-8 px-4 bg-emerald-50 text-emerald-600 border-none shadow-inner-sm flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest rounded-lg">
                                <CheckCircle2 className="h-3 w-3" /> Arrived
                            </Badge>
                        )}
                    </div>
                )
            }
        }
    ]

    return (
        <div className="space-y-2 font-sans px-1">
            <div className="flex flex-row items-center justify-between gap-2 px-1 pb-1 mb-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-100 text-orange-600">
                        <Truck className="h-4 w-4" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">Dispatch Board</h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/dispatch/history')}
                        className="h-10 px-5 rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans shadow-sm"
                    >
                        <History className="h-4 w-4 text-indigo-500" /> Transit Archive
                    </Button>

                    {selectedJobIds.length > 0 && (
                        <>
                            <Button 
                                size="sm"
                                onClick={handleOpenBulkDispatch}
                                className="h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white gap-2 transition-all active:scale-95 shadow-lg shadow-amber-100 animate-in fade-in slide-in-from-right-4"
                                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                            >
                                <Zap className="h-4 w-4" /> Bulk Dispatch ({selectedJobIds.length})
                            </Button>
                            
                            <Can I="create" a="finance">
                                <Button 
                                    size="sm"
                                    onClick={() => router.push(`/invoices?jobIds=${selectedJobIds.join(',')}`)}
                                    className="h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-100 animate-in fade-in slide-in-from-right-4"
                                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                                >
                                    <BadgeIndianRupee className="h-4 w-4" /> Bulk Invoice ({selectedJobIds.length})
                                </Button>
                            </Can>
                        </>
                    )}

                    <div className="bg-slate-50 border border-slate-100 px-6 py-2 rounded-xl flex items-center gap-6 sm:gap-10">
                        <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Queue</p>
                            <p className="text-xl font-bold text-rose-600 tabular-nums leading-none tracking-tighter">{jobs.filter(j => (j.quantity - j.dispatchedQuantity) > 0).length}</p>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cleared</p>
                            <p className="text-xl font-bold text-emerald-600 tabular-nums leading-none tracking-tighter">{jobs.filter(j => j.jobStatus === 'Delivered').length}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchJobs} className="h-10 px-4 border-slate-200 text-slate-600 font-bold text-[10px] rounded-xl uppercase">
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Transit
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-inner-sm overflow-hidden">
                <DataGrid
                    data={jobs}
                    columns={columns}
                    isLoading={isLoading}
                    title="None"
                    hideTitle={true}
                    enableSelection={true}
                    onSelectionChange={setSelectedJobIds}
                    searchPlaceholder="Audit Transit History by Customer, Ticket# or Job Details..."
                    toolbarClassName="border-b px-6 py-4 bg-slate-50/20"
                    initialPageSize={10}
                    cardRender={(row: JobCard) => {
                        const balance = row.quantity - row.dispatchedQuantity;
                        const progress = (row.dispatchedQuantity / row.quantity) * 100;
                        
                        let summary = row.jobDescription;
                        try {
                            const parsed = JSON.parse(row.jobDescription);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                summary = parsed.map(i => i.description).join(", ");
                            }
                        } catch (e) {}

                        return (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full font-sans">
                                {/* Card Header */}
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-[#4C1F7A] uppercase tracking-wider">#{row.jobNumber}</span>
                                    <Badge variant="outline" className={cn(
                                        "text-[9px] font-bold uppercase tracking-tighter h-5 px-1.5",
                                        balance === 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                    )}>
                                        {balance === 0 ? "Fully Shipped" : "Active Transit"}
                                    </Badge>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{summary}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
                                            <User className="h-3 w-3 opacity-40" /> {row.customerName || "REGULAR CLIENT"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Load</p>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-slate-700">{row.quantity.toLocaleString()} <span className="text-[9px] opacity-60 font-medium">PCS</span></span>
                                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-emerald-500 shadow-sm" 
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Balance</p>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-baseline gap-1">
                                                    <span className={cn("text-xs font-black tabular-nums", balance === 0 ? "text-emerald-600" : "text-rose-600")}>
                                                        {balance.toLocaleString()}
                                                    </span>
                                                    {balance > 0 && row.dispatchedQuantity > 0 && <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Partial</span>}
                                                </div>
                                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Shipped: {row.dispatchedQuantity.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3 text-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-500">{new Date(row.dueDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3 w-3 text-slate-300" />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Factory Floor</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer / Actions */}
                                <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={(e) => { e.stopPropagation(); setSelectedJob(row); setShowDetailsModal(true); }}
                                            className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-full transition-all"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {row.dispatchedQuantity > 0 && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={(e) => { e.stopPropagation(); handleViewHistory(row); }}
                                                className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all"
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {row.dispatchedQuantity > 0 && (
                                            <Can I="create" a="finance">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={(e) => { e.stopPropagation(); router.push(`/invoices?jobId=${row.id}`); }}
                                                    className="h-8 w-8 text-emerald-600 hover:bg-white rounded-full transition-all"
                                                >
                                                    <BadgeIndianRupee className="h-4 w-4" />
                                                </Button>
                                            </Can>
                                        )}
                                    </div>

                                    {balance > 0 ? (
                                        <Button 
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); handleOpenDispatch(row); }}
                                            className="h-8 px-4 text-[9px] font-bold uppercase tracking-widest text-white shadow-md flex items-center gap-2 rounded-lg"
                                            style={{ background: 'var(--primary)' }}
                                        >
                                            <Truck className="h-3 w-3" /> Ship Load
                                        </Button>
                                    ) : (
                                        <div className="h-8 px-3 bg-emerald-100/50 text-emerald-700 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg border border-emerald-100">
                                            <CheckCircle2 className="h-3 w-3" /> Arrived
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }}
                />
            </div>

            <Dialog open={showDispatchModal} onOpenChange={setShowDispatchModal}>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[550px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[92vh] flex flex-col font-sans uppercase">
                    <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                <Truck className="h-4 w-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-bold text-slate-800 leading-none uppercase">Log Outward Shipment</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ticket: #{selectedJob?.jobNumber} • {selectedJob?.customerName}</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="px-6 py-6 space-y-6">
                            {/* Summary Card - Updated to White/Indigo Theme */}
                            <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform" />
                                <div className="flex justify-between items-end relative z-10">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Production Balance</p>
                                        <p className="text-3xl font-black tabular-nums leading-none text-indigo-600">{(selectedJob ? selectedJob.quantity - selectedJob.dispatchedQuantity : 0).toLocaleString()} <span className="text-[10px] font-bold text-slate-400 uppercase">Units</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Job Commitment</p>
                                        <p className="text-sm font-black text-slate-900 tabular-nums">{selectedJob?.quantity.toLocaleString()} Nos</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 1: Shipment Volume */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Box className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shipment Details</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Loading Quantity <span className="text-rose-500">*</span></Label>
                                        <Input 
                                            type="number" 
                                            value={dispatchQty}
                                            onChange={(e) => setDispatchQty(Math.min(Number(e.target.value), (selectedJob ? selectedJob.quantity - selectedJob.dispatchedQuantity : 0)))}
                                            className="h-10 border-slate-200 bg-white font-bold text-sm rounded-md focus:bg-white shadow-none" 
                                        />
                                        <p className="text-[9px] text-slate-400 font-bold tracking-tight">Units ready for logistics rollout</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Transit Reference</Label>
                                        <Input 
                                            placeholder="PO# or Vehicle Card"
                                            value={trackingRef}
                                            onChange={(e) => setTrackingRef(e.target.value)}
                                            className="h-10 border-slate-200 bg-white font-medium text-sm rounded-md shadow-none uppercase" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Route & Logistics */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logistics Configuration</span>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Delivery Route / Service Mode</Label>
                                    <SearchableSelect 
                                        options={deliveryModes}
                                        value={deliveryMode}
                                        onValueChange={setDeliveryMode}
                                        placeholder="Select Master Route..."
                                        className="h-10 text-sm font-bold uppercase tracking-widest"
                                    />
                                    <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-tighter italic mt-1 flex items-center gap-1">
                                        <Info className="h-2.5 w-2.5" /> Managed via Registry Master
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => setShowDispatchModal(false)} 
                            className="h-10 px-4 rounded-md text-xs font-bold text-slate-500 hover:text-slate-800"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleConfirmDispatch}
                            className="h-10 px-8 text-white font-bold text-xs shadow-xl rounded-md transition-all active:scale-95 whitespace-nowrap"
                            style={{ background: 'var(--primary)' }}
                        >
                            Authorize Dispatch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Bulk Dispatch Modal --- */}
            <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[750px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-xl bg-white max-h-[95vh] flex flex-col font-sans">
                    <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-amber-50 border border-amber-100 text-amber-600">
                                <Zap className="h-4 w-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-bold text-slate-800 leading-none uppercase tracking-tight">Bulk Shipment Orchestration</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configuring {bulkDispatchItems.length} jobs for unified logistics rollout</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="px-6 py-4 space-y-6">
                            {/* Unified Logistics Config */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Route / Service Mode</Label>
                                    <SearchableSelect 
                                        options={deliveryModes}
                                        value={deliveryMode}
                                        onValueChange={setDeliveryMode}
                                        placeholder="Select Master Route..."
                                        className="h-9 text-xs font-bold uppercase"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Master Transit Ref</Label>
                                    <Input 
                                        placeholder="Bulk PO# or Trip ID"
                                        value={trackingRef}
                                        onChange={(e) => setTrackingRef(e.target.value)}
                                        className="h-9 border-slate-200 bg-white font-medium text-xs rounded-md shadow-none" 
                                    />
                                </div>
                            </div>

                            {/* Job List with Quantity Control */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Order Manifest</span>
                                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Shipment Quantity</span>
                                </div>
                                <div className="space-y-2">
                                    {bulkDispatchItems.map((item, idx) => (
                                        <div key={item.job.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 transition-colors shadow-sm">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-black text-slate-900 uppercase tracking-tight">#{item.job.jobNumber} • {item.job.customerName}</span>
                                                <span className="text-[10px] text-slate-500 font-medium line-clamp-1 max-w-[300px]">{item.job.jobDescription}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className="text-[8px] h-3.5 px-1 bg-slate-100 text-slate-500 border-none font-bold uppercase tracking-widest">Balance: {(item.job.quantity - item.job.dispatchedQuantity).toLocaleString()}</Badge>
                                                </div>
                                            </div>
                                            <div className="w-32">
                                                <div className="relative group">
                                                    <Input 
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={(e) => {
                                                            const newItems = [...bulkDispatchItems]
                                                            newItems[idx].qty = Math.min(Number(e.target.value), (item.job.quantity - item.job.dispatchedQuantity))
                                                            setBulkDispatchItems(newItems)
                                                        }}
                                                        className="h-9 pr-8 text-right font-black text-sm border-slate-200 focus:bg-indigo-50 focus:border-indigo-300 transition-all shadow-none"
                                                    />
                                                    <div className="absolute right-2 top-2 pt-0.5 pointer-events-none">
                                                        <Box className="h-3.5 w-3.5 text-slate-300 group-focus-within:text-indigo-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => setShowBulkModal(false)}
                            disabled={isProcessingBulk}
                            className="h-10 px-4 rounded-md text-xs font-bold text-slate-500 hover:text-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmBulkDispatch}
                            disabled={isProcessingBulk || bulkDispatchItems.every(i => i.qty === 0)}
                            className="h-10 px-8 text-white font-bold text-xs shadow-xl rounded-md transition-all active:scale-95 whitespace-nowrap gap-2"
                            style={{ background: 'var(--primary)' }}
                        >
                            {isProcessingBulk ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                            Process Combined Dispatch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Partial Dispatch History Modal */}
            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogContent className="max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white font-sans uppercase">
                    <DialogHeader className="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 leading-none">Shipment Timeline</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Job: #{selectedJob?.jobNumber} • {selectedJob?.customerName}</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-6">
                        {/* Summary Header */}
                        {selectedJob && (
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                                    <span className="text-[8px] font-bold text-slate-400 block mb-1">TOTAL ORDER</span>
                                    <span className="text-sm font-black text-slate-900">{selectedJob.quantity.toLocaleString()}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                                    <span className="text-[8px] font-bold text-indigo-400 block mb-1">DISPATCHED</span>
                                    <span className="text-sm font-black text-indigo-600">{selectedJob.dispatchedQuantity.toLocaleString()}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100/50">
                                    <span className="text-[8px] font-bold text-rose-400 block mb-1">PENDING</span>
                                    <span className="text-sm font-black text-rose-600">{(selectedJob.quantity - selectedJob.dispatchedQuantity).toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        {isLoadingHistory ? (
                            <div className="py-20 text-center space-y-3">
                                <RefreshCcw className="h-8 w-8 text-slate-200 animate-spin mx-auto" />
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Fetching Transit Logs...</p>
                            </div>
                        ) : historyLogs.length === 0 ? (
                            <div className="py-20 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <Package className="h-8 w-8 text-slate-200 mx-auto" />
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">No partial shipments found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {historyLogs.map((log, idx) => {
                                    const logId = log.id || log.Id || idx
                                    const changesStr = (log.changes || log.Changes || "").toString()
                                    const timestamp = log.timestamp || log.Timestamp || new Date().toISOString()

                                    // Parse Changes: Qty: 500, Mode: Staff, Tracking: Internal
                                    const parts = changesStr.split(',').map((p: string) => p.trim()) || []
                                    const qty = parts.find((p: string) => p.startsWith('Qty:'))?.split(':')[1] || '0'
                                    const mode = parts.find((p: string) => p.startsWith('Mode:'))?.split(':')[1] || 'Unknown'
                                    const ref = parts.find((p: string) => p.startsWith('Tracking:'))?.split(':')[1] || 'N/A'

                                    return (
                                        <div key={logId} className="relative pl-8 pb-4 group last:pb-0">
                                            {/* Timeline Line */}
                                            {idx !== historyLogs.length - 1 && (
                                                <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100 group-hover:bg-indigo-100 transition-colors" />
                                            )}
                                            
                                            {/* Timeline Dot */}
                                            <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-white border-2 border-indigo-600 shadow-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                                <div className="h-2 w-2 rounded-full bg-indigo-600" />
                                            </div>

                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:border-indigo-100 group-hover:bg-white transition-all shadow-sm flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[14px] font-black text-slate-900 tabular-nums">{Number(qty).toLocaleString()} Units</span>
                                                        <Badge className="bg-white border border-indigo-100 text-indigo-600 text-[8px] font-bold uppercase tracking-widest px-2 shadow-none">{mode}</Badge>
                                                    </div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    <div className="flex items-center gap-2 text-slate-500 mt-2">
                                                        <User className="h-3 w-3" />
                                                        <span className="text-[10px] font-bold tracking-tight">Ref: {ref}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-white border-slate-200 text-slate-600 gap-2 hover:bg-slate-50 rounded-xl shadow-sm"
                                                    onClick={() => window.open(`/print/dc/${logId}`, '_blank')}
                                                >
                                                    <Printer className="h-3 w-3" /> Print DC
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="px-6 py-5 border-t border-slate-50 bg-slate-50/30">
                        <Button type="button" onClick={() => setShowHistoryModal(false)} className="h-11 w-full bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl uppercase tracking-widest hover:bg-slate-50 transition-all">Close Timeline</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-xl bg-white flex flex-col font-sans uppercase">
                    <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 leading-none">Order Manifest Details</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Job Ticket: #{selectedJob?.jobNumber} • {selectedJob?.customerName}</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Product Description</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Qty</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Rate</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        try {
                                            const items = JSON.parse(selectedJob?.jobDescription || "[]");
                                            return items.map((item: any, idx: number) => (
                                                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-700">{item.description}</td>
                                                    <td className="px-4 py-3 text-xs font-black text-slate-600 text-center tabular-nums">{Number(item.qty).toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-500 text-center tabular-nums">₹{Number(item.rate).toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-xs font-black text-indigo-600 text-right tabular-nums">₹{(Number(item.qty) * Number(item.rate)).toLocaleString()}</td>
                                                </tr>
                                            ));
                                        } catch {
                                            return (
                                                <tr className="border-b border-slate-50">
                                                    <td colSpan={4} className="px-4 py-6 text-xs font-bold text-slate-700 text-center">{selectedJob?.jobDescription}</td>
                                                </tr>
                                            );
                                        }
                                    })()}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Manifest Volume</p>
                                    <p className="text-xl font-black text-indigo-600 tabular-nums leading-none tracking-tight">{selectedJob?.quantity.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">Total Units</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                        {selectedJob && (selectedJob.dispatchedQuantity > 0) && (
                            <Can I="create" a="finance">
                                <Button 
                                    onClick={() => router.push(`/invoices?jobId=${selectedJob.id}`)}
                                    className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xl uppercase tracking-widest gap-2 flex items-center shadow-lg shadow-emerald-100"
                                >
                                    <BadgeIndianRupee className="h-4 w-4" /> Convert to Invoice
                                </Button>
                            </Can>
                        )}
                        <Button type="button" onClick={() => setShowDetailsModal(false)} className="h-10 px-6 bg-white border border-slate-200 text-slate-600 font-bold text-[10px] rounded-xl uppercase tracking-widest hover:bg-slate-50 shadow-sm flex-1 sm:flex-none">
                            Close Manifest
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
