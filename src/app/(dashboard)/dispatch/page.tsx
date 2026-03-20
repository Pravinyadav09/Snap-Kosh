"use client"

import React, { useState, useMemo } from "react"
import {
    Truck,
    Package,
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    MapPin,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    Info,
    Calendar,
    Printer,
    FileText,
    ExternalLink,
    Box,
    History,
    MoreVertical,
    Zap,
    AlertCircle,
    ClipboardCheck,
    Smartphone,
    Building2,
    ShieldCheck,
    Wallet
} from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SearchableSelect } from "@/components/shared/searchable-select"

// --- Types ---
type DispatchJob = {
    id: string
    jobName: string
    customerName: string
    totalQty: number
    dispatchedQty: number
    pendingQty: number
    status: "Ready" | "Partial" | "Delivered"
    priority: "Low" | "Medium" | "High" | "Urgent"
    dueDate: string
    lastDispatchDate?: string
    location: string
}

// --- Mock Data ---
const initialDispatchJobs: DispatchJob[] = [
    {
        id: "JB-2026-045",
        jobName: "Shabdolok Book Printing",
        customerName: "Shabdolok Publications",
        totalQty: 5000,
        dispatchedQty: 2000,
        pendingQty: 3000,
        status: "Partial",
        priority: "High",
        dueDate: "2026-03-12",
        lastDispatchDate: "2026-03-09",
        location: "Delhi"
    },
    {
        id: "JB-2026-048",
        jobName: "Gaur City Center Flyers",
        customerName: "Gaur City Center Admin",
        totalQty: 10000,
        dispatchedQty: 10000,
        pendingQty: 0,
        status: "Delivered",
        priority: "Medium",
        dueDate: "2026-03-08",
        lastDispatchDate: "2026-03-10",
        location: "Noida"
    },
    {
        id: "JB-2026-052",
        jobName: "Reliable Business Cards",
        customerName: "Reliable Printers",
        totalQty: 1000,
        dispatchedQty: 0,
        pendingQty: 1000,
        status: "Ready",
        priority: "Urgent",
        dueDate: "2026-03-11",
        location: "Okhla"
    },
    {
        id: "JB-2026-055",
        jobName: "Annual Report 2026",
        customerName: "Corporate Solutions",
        totalQty: 500,
        dispatchedQty: 0,
        pendingQty: 500,
        status: "Ready",
        priority: "Medium",
        dueDate: "2026-03-15",
        location: "Gurgaon"
    }
]

export default function DispatchBoardPage() {
    const router = useRouter()
    const [jobs, setJobs] = useState<DispatchJob[]>(initialDispatchJobs)
    const [showDispatchModal, setShowDispatchModal] = useState(false)
    const [selectedJob, setSelectedJob] = useState<DispatchJob | null>(null)
    const [dispatchQty, setDispatchQty] = useState<number>(0)
    const [deliveryMode, setDeliveryMode] = useState("Staff")

    const handleOpenDispatch = (job: DispatchJob) => {
        setSelectedJob(job)
        setDispatchQty(job.pendingQty)
        setShowDispatchModal(true)
    }

    const handleConfirmDispatch = () => {
        if (!selectedJob) return

        if (dispatchQty <= 0 || dispatchQty > selectedJob.pendingQty) {
            toast.error("Invalid Quantity", { description: "Quantity cannot exceed remaining balance." })
            return
        }

        const updatedJobs = jobs.map(j => {
            if (j.id === selectedJob.id) {
                const newDispatched = j.dispatchedQty + dispatchQty
                const newPending = j.totalQty - newDispatched
                return {
                    ...j,
                    dispatchedQty: newDispatched,
                    pendingQty: newPending,
                    status: newPending === 0 ? "Delivered" : "Partial",
                    lastDispatchDate: new Date().toISOString().split('T')[0]
                } as DispatchJob
            }
            return j
        })

        setJobs(updatedJobs)
        setShowDispatchModal(false)
        setSelectedJob(null)
        
        toast.success("Dispatch Successful", {
            description: `${dispatchQty} units sent for ${selectedJob.jobName}`,
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        })
    }

    const columns: ColumnDef<DispatchJob>[] = [
        {
            key: "id",
            label: "Job ID",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => <span className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">#{val}</span>
        },
        {
            key: "jobName",
            label: "Order Details",
            render: (val, row) => (
                <div className="flex flex-col gap-0.5 py-1">
                    <span className="font-sans text-sm font-black text-slate-800 tracking-tight leading-tight">{val}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <User className="h-2.5 w-2.5" /> {row.customerName}
                    </span>
                    <span className="md:hidden text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">#{row.id}</span>
                </div>
            )
        },
        {
            key: "totalQty",
            label: "Production Qty",
            className: "hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: (val, row) => (
                <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-sans font-black text-slate-700">{val.toLocaleString()} Units</span>
                    <div className="w-24">
                        <Progress 
                            value={(row.dispatchedQty / row.totalQty) * 100} 
                            className="h-1.5" 
                            style={{ '--progress-background': 'var(--primary)' } as any}
                        />
                    </div>
                </div>
            )
        },
        {
            key: "pendingQty",
            label: "Balance Status",
            render: (val, row) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[13px] font-black tabular-nums ${val === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {val.toLocaleString()} Left
                        </span>
                        {row.status === "Partial" && <Badge className="text-[8px] h-3.5 px-1 bg-amber-100 text-amber-600 border-none uppercase font-black">Partial</Badge>}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium italic">Sent: {row.dispatchedQty} Units</span>
                </div>
            )
        },
        {
            key: "dueDate",
            label: "Deadline",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${row.priority === 'Urgent' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                        <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[11px] font-bold ${row.priority === 'Urgent' ? 'text-rose-600' : 'text-slate-600'}`}>{val}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{row.priority}</span>
                    </div>
                </div>
            )
        },
        {
            key: "actions",
            label: "Dispatch Ops",
            className: "text-right",
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    {row.pendingQty > 0 ? (
                        <Button 
                            onClick={() => handleOpenDispatch(row)}
                            className="h-7 sm:h-8 px-2 sm:px-3 text-[9px] font-black uppercase tracking-widest text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                            style={{ background: 'var(--primary)' }}
                        >
                            <Truck className="h-3 w-3" /> <span className="hidden sm:inline">Ship Now</span>
                        </Button>
                    ) : (
                        <Badge className="h-7 sm:h-8 px-2 sm:px-3 bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="h-3 w-3" /> <span className="hidden sm:inline">Delivered</span>
                        </Badge>
                    )}
                    <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-md border-slate-200 text-slate-400">
                        <Printer className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-4 font-sans bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
            {/* --- Standardized Header --- */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 px-1 pb-4 font-sans italic uppercase">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">Dispatch Board</h1>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-10 bg-slate-50/80 px-4 sm:px-8 py-2.5 sm:py-3 rounded-2xl border border-slate-200/60 backdrop-blur-sm italic">
                        <div className="flex flex-col">
                            <p className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-0.5 sm:mb-1">Pending Shipment</p>
                            <div className="flex items-baseline gap-1.5 sm:gap-2">
                                <span className="text-xl sm:text-3xl font-black text-rose-600 tabular-nums leading-none tracking-tighter">
                                    {jobs.filter(j => j.pendingQty > 0).length}
                                </span>
                                <span className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-tighter">Orders</span>
                            </div>
                        </div>
                        <div className="h-8 sm:h-10 w-px bg-slate-200" />
                        <div className="flex flex-col">
                            <p className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-0.5 sm:mb-1">Total Delivered</p>
                            <div className="flex items-baseline gap-1.5 sm:gap-2">
                                <span className="text-xl sm:text-3xl font-black text-emerald-600 tabular-nums leading-none tracking-tighter">
                                    {jobs.filter(j => j.status === "Delivered").length}
                                </span>
                                <span className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-tighter">Orders</span>
                            </div>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => router.push('/dispatch/history')}
                        className="h-9 sm:h-10 px-4 rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans shadow-sm active:scale-95 w-full sm:w-auto"
                    >
                        <History className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Transit Log
                    </Button>
                </div>
            </div>

            {/* --- Main Table Container --- */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <DataGrid
                    data={jobs}
                    columns={columns}
                    title="Dispatch Queue"
                    hideTitle={true}
                    enableCardView={true}
                    searchPlaceholder="Search Customer, Job ID, or Location..."
                    toolbarClassName="border-b px-6 py-4 bg-slate-50/30"
                />
            </div>

            {/* --- Premium Dispatch Modal --- */}
            <Dialog open={showDispatchModal} onOpenChange={setShowDispatchModal}>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[90vh] flex flex-col uppercase font-sans">
                    <DialogHeader className="px-4 sm:px-6 py-4 text-left border-b border-slate-100 bg-white italic font-sans uppercase">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                <Truck className="h-4 w-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">Process Outgoing Delivery</DialogTitle>
                                <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">
                                    {selectedJob?.id} • {selectedJob?.customerName}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="px-6 py-6 space-y-6">
                            {/* Summary Card */}
                            <div className="p-4 rounded-md bg-slate-900 text-white flex items-center justify-between shadow-lg">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">Production Balance</p>
                                    <p className="text-xl font-black tracking-tight tabular-nums">{selectedJob?.pendingQty.toLocaleString()} <span className="text-[10px] font-medium text-white/60 uppercase">Units Left</span></p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">Order Total</p>
                                    <p className="text-sm font-bold opacity-80 tabular-nums">{selectedJob?.totalQty.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Section 1: Dispatch Volume */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shipment Intelligence</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-md border border-slate-100">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Sending Now Unit(s) <span className="text-rose-500">*</span></Label>
                                        <Input 
                                            type="number" 
                                            value={dispatchQty}
                                            onChange={(e) => setDispatchQty(Math.min(Number(e.target.value), selectedJob?.pendingQty || 0))}
                                            placeholder="Enter quantity" 
                                            className="h-9 border-slate-200 bg-white font-bold text-sm focus:bg-white transition-all rounded-md focus-visible:ring-primary shadow-sm" 
                                            style={{ color: 'var(--primary)', '--ring': 'var(--primary)' } as any}
                                        />
                                        <p className="text-[9px] text-slate-400 font-medium italic mt-1 flex items-center gap-1.5">
                                            <AlertCircle className="h-2.5 w-2.5" /> Max available: {selectedJob?.pendingQty}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">No. of Boxes / Packets</Label>
                                        <Input 
                                            type="number" 
                                            placeholder="0" 
                                            className="h-9 border-slate-200 bg-white font-bold text-sm rounded-md shadow-sm" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Logistics Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Box className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logistics Configuration</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Delivery Mode <span className="text-rose-500">*</span></Label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'Staff', label: 'Staff Hand Delivery' },
                                                { value: 'Courier', label: 'Courier / Logistics Partner' },
                                                { value: 'Self', label: 'Self-Pickup by Client' },
                                                { value: 'Direct', label: 'Direct Store Drop' }
                                            ]}
                                            value={deliveryMode}
                                            onValueChange={setDeliveryMode}
                                            placeholder="Select Delivery Mode"
                                            className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Tracking / Reference ID</Label>
                                        <Input placeholder="POD No. or Staff Name" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md shadow-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Notes & Proof */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gate Pass & Remarks</span>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Additional Remarks</Label>
                                    <Textarea 
                                        placeholder="Note any damage, contact person at site, or specific instructions..." 
                                        className="min-h-[100px] border-slate-200 bg-white font-medium text-sm rounded-md shadow-sm resize-none" 
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    <DialogFooter className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                        <Button variant="ghost" onClick={() => setShowDispatchModal(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800 shrink-0">Discard</Button>
                        <Button
                            onClick={handleConfirmDispatch}
                            className="h-9 px-4 sm:px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95 whitespace-nowrap"
                            style={{ background: 'var(--primary)' }}
                        >
                            Confirm Dispatch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
