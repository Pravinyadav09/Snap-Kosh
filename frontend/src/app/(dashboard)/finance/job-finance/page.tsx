"use client"

export const dynamic = 'force-dynamic'

import { API } from '@/lib/api'
import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
    RefreshCcw,
    IndianRupee,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    TrendingUp,
    History,
    FileText,
    ChevronDown,
    ChevronUp,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface JobFinance {
    id: number;
    jobNumber: string;
    customerName: string;
    jobDescription: string;
    totalValue: number;
    totalPaid: number;
    balanceDue: number;
    jobStatus: string;
    lastPaymentDate: string | null;
    createdAt: string;
}

interface PaymentHistory {
    id: number;
    amount: number;
    paymentDate: string;
    method: string;
    ref: string;
}

export default function JobFinancePage() {
    const [jobs, setJobs] = useState<JobFinance[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
    const [isHistoryLoading, setIsHistoryLoading] = useState(false)

    const fetchJobs = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch(API.finance.jobs)
            if (res.ok) {
                const data = await res.json()
                setJobs(data)
            }
        } catch (error) {
            console.error("Fetch jobs error:", error)
            toast.error("Failed to load financial records")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchJobs()
    }, [fetchJobs])

    const fetchHistory = async (jobId: number) => {
        setIsHistoryLoading(true)
        setIsHistoryOpen(true)
        setSelectedJobId(jobId)
        try {
            const res = await fetch(API.finance.jobHistory(jobId))
            if (res.ok) {
                const data = await res.json()
                setPaymentHistory(data)
            }
        } catch (error) {
            toast.error("Failed to load payment history")
        } finally {
            setIsHistoryLoading(false)
        }
    }

    const totalOutstanding = useMemo(() => jobs.reduce((sum: number, job: JobFinance) => sum + (job.balanceDue || 0), 0), [jobs])
    const totalCollected = useMemo(() => jobs.reduce((sum: number, job: JobFinance) => sum + (job.totalPaid || 0), 0), [jobs])
    const collectionRate = useMemo(() => totalCollected > 0 ? (totalCollected / (totalCollected + totalOutstanding)) * 100 : 0, [totalCollected, totalOutstanding])

    const columns: ColumnDef<JobFinance>[] = useMemo(() => [
        {
            key: "jobNumber",
            label: "Job#",
            filterable: true,
            sortable: true,
            initialWidth: 100,
            render: (val: string) => <span className="text-[11px] font-black text-slate-900 tabular-nums uppercase">{val}</span>
        },
        {
            key: "customerName",
            label: "Customer",
            filterable: true,
            sortable: true,
            initialWidth: 200,
            render: (val: string) => (
                <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase line-clamp-1 leading-none">{val}</span>
                </div>
            )
        },
        {
            key: "totalValue",
            label: "Job Value",
            sortable: true,
            initialWidth: 120,
            className: "text-right",
            render: (val: number) => <span className="text-[11px] font-black text-slate-700 tabular-nums">₹{val?.toLocaleString()}</span>
        },
        {
            key: "totalPaid",
            label: "Paid",
            sortable: true,
            initialWidth: 120,
            className: "text-right",
            render: (val: number) => <span className="text-[11px] font-black text-emerald-600 tabular-nums">₹{val?.toLocaleString()}</span>
        },
        {
            key: "balanceDue",
            label: "Balance",
            sortable: true,
            initialWidth: 120,
            className: "text-right",
            render: (val: number) => (
                <span className={`text-[11px] font-black tabular-nums ${val > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    ₹{val?.toLocaleString()}
                </span>
            )
        },
        {
            key: "jobStatus",
            label: "Status",
            filterable: true,
            sortable: true,
            initialWidth: 100,
            className: "text-center",
            render: (_val: string, item: JobFinance) => (
                <Badge className={`uppercase text-[8px] font-black h-4 px-2 border-none rounded shadow-sm ${
                    (item.balanceDue || 0) === 0 ? 'bg-emerald-600 text-white' : 
                    (item.totalPaid || 0) > 0 ? 'bg-amber-500 text-white' : 
                    'bg-slate-200 text-slate-600'
                }`}>
                    {(item.balanceDue || 0) === 0 ? 'PAID' : (item.totalPaid || 0) > 0 ? 'PART' : 'PEND'}
                </Badge>
            )
        },
        {
            key: "lastPaymentDate",
            label: "Last Tx",
            sortable: true,
            initialWidth: 100,
            render: (val: string) => val ? <span className="text-[10px] font-bold text-slate-500 uppercase">{format(new Date(val), "dd MMM")}</span> : <span className="text-[10px] text-slate-300">-</span>
        },
        {
            key: "actions",
            label: "History",
            initialWidth: 80,
            className: "text-right",
            render: (_val: any, item: JobFinance) => (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-7 w-7 rounded-lg transition-all ${selectedJobId === item.id && isHistoryOpen ? 'bg-primary/10 text-primary shadow-sm' : 'opacity-40 hover:opacity-100 hover:bg-slate-100'}`}
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        fetchHistory(item.id)
                    }}
                >
                    <History size={14} />
                </Button>
            )
        }
    ], [isHistoryOpen, selectedJobId])

    return (
        <div className="space-y-4 font-sans">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        Finance Intelligence Hub
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg bg-white shadow-sm border-slate-200 text-[11px] font-black uppercase" onClick={fetchJobs}>
                        <RefreshCcw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                        Sync Registry
                    </Button>
                </div>
            </div>



            {/* Core Data Grid Component Integration */}
            <div className="relative group">
                <DataGrid
                    data={jobs}
                    columns={columns}
                    isLoading={isLoading}
                    title="Financial Registry"
                    searchPlaceholder="Filter Jobs, Customers or Values..."
                    enableSelection={false}
                    enableCardView={true}
                    toolbarClassName="border-0 bg-transparent mb-2 !p-0"
                />
            </div>

            {/* Global History Modal */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent showCloseButton={false} className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[90vh] flex flex-col font-sans">
                    {/* Header */}
                    <DialogHeader className="px-5 py-4 text-left border-b border-slate-100 bg-white relative shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                <History className="h-4 w-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-bold text-slate-800 leading-none uppercase tracking-tight flex items-center gap-2">
                                    Payment Timeline <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm font-medium border border-slate-200">JOB ID: {jobs.find(j => j.id === selectedJobId)?.jobNumber}</span>
                                </DialogTitle>
                                <DialogDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Audit Log & Account Registry Analysis</DialogDescription>
                            </div>
                        </div>
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors" onClick={() => setIsHistoryOpen(false)}>
                                <X className="h-4 w-4 text-slate-500" />
                            </Button>
                        </DialogClose>
                    </DialogHeader>

                    {/* Summary Analysis Row */}
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-3 gap-3">
                        <div className="p-3 bg-white border border-slate-200 rounded-md">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Booked Value</p>
                            <p className="text-base font-black text-slate-900 tabular-nums leading-none">
                                ₹{jobs.find(j => j.id === selectedJobId)?.totalValue?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="p-3 bg-white border border-slate-200 rounded-md">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Amount Realized</p>
                             <p className="text-base font-black text-emerald-600 tabular-nums leading-none">
                                ₹{paymentHistory.reduce((s: number, i: PaymentHistory) => s + i.amount, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-white border border-slate-200 rounded-md">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Exposure</p>
                            <p className="text-base font-black text-rose-600 tabular-nums leading-none">
                                ₹{((jobs.find(j => j.id === selectedJobId)?.totalValue || 0) - paymentHistory.reduce((s: number, i: PaymentHistory) => s + i.amount, 0)).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4 bg-white">
                        {isHistoryLoading ? (
                             <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <RefreshCcw className="animate-spin text-primary h-6 w-6" />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Retrieving audit logs...</span>
                            </div>
                        ) : paymentHistory.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-slate-50 text-slate-200">
                                    <IndianRupee size={24} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">No transaction history</p>
                                    <p className="text-[10px] text-slate-400 font-medium font-sans">Pending first collection from customer</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {paymentHistory.map((item: PaymentHistory, idx: number) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-white border border-slate-100 hover:border-slate-200 transition-all font-sans">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
                                                <IndianRupee className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-xs font-bold text-slate-800 leading-none">{item.method}</p>
                                                    {idx === 0 && <Badge className="bg-emerald-100 text-emerald-600 text-[8px] font-black px-1.5 h-3.5 border-none rounded">LATEST</Badge>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" /> {format(new Date(item.paymentDate), "dd MMM yyyy")}
                                                    </p>
                                                    <span className="text-[10px] text-slate-200">|</span>
                                                    <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                                                        REF: {item.ref || 'TXN-'+item.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-emerald-600 tabular-nums">
                                                + ₹{item.amount.toLocaleString()}
                                            </p>
                                            <p className="text-[9px] font-bold uppercase text-slate-300 mt-1 flex items-center justify-end gap-1">
                                                <FileText className="h-2.5 w-2.5" /> Verified Receipt
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0 font-sans">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
                                <History className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Registry Status</p>
                                <p className="text-xs font-black tracking-tight mt-0.5 uppercase">
                                    Audited {paymentHistory.length} Transactions 
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" className="h-8 border border-slate-200 rounded-md font-bold text-[10px] uppercase tracking-wider text-slate-600 hover:bg-white transition-all" onClick={() => setIsHistoryOpen(false)}>
                            Close Registry
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
