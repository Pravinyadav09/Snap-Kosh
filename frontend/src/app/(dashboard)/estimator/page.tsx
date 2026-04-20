"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Plus,
    FileText,
    Check,
    X,
    Hammer,
    Edit2,
    Trash2,
    FileDown,
    Calculator,
    User,
    Calendar,
    BadgeIndianRupee,
    MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

// Generic Grid & Modal
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { FormModal, FormField } from "@/components/shared/form-modal"
import { Can } from "@/components/shared/permission-context"

// ─── Types ───────────────────────────────────────────────────────────────────
type Quotation = {
    dbId: number
    id: string
    date: string
    customer: string
    amount: number
    status: string
}

const statusStyles: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-900 border-emerald-200 font-bold shadow-[0_2px_10px_-3px_rgba(16,185,129,0.2)]",
    rejected: "bg-rose-100 text-rose-900 border-rose-200 font-bold shadow-[0_2px_10px_-3px_rgba(244,63,94,0.2)]",
    draft: "bg-slate-100 text-slate-800 border-slate-200 font-bold",
    sent: "bg-sky-100 text-sky-900 border-sky-200 font-bold shadow-[0_2px_10px_-3px_rgba(14,165,233,0.2)]",
    converted: "bg-indigo-100 text-indigo-900 border-indigo-200 font-bold shadow-[0_2px_10px_-3px_rgba(99,102,241,0.2)]",
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuotationsPage() {
    const router = useRouter()
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [processingId, setProcessingId] = useState<number | null>(null)

    const fetchQuotations = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/api/Quotations`)
            if (response.ok) {
                const data = await response.json()
                const mapped = (Array.isArray(data) ? data : data.items || []).map((apiQuote: any) => ({
                    dbId: apiQuote.id,
                    id: apiQuote.quotationNumber || `QT-${apiQuote.id}`,
                    date: new Date(apiQuote.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    customer: apiQuote.customerName || `Customer #${apiQuote.customerId}`,
                    amount: apiQuote.quotedPrice || 0,
                    status: (apiQuote.status || "draft").toLowerCase(),
                }))
                setQuotations(mapped)
            }
        } catch (error) {
            console.error("Error fetching quotations:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchQuotations()
    }, [])

    const handleStatusUpdate = async (dbId: number, nextStatus: string, currentStatus: string) => {
        if (["approved", "converted"].includes(currentStatus.toLowerCase())) {
            toast.error("Status Protected", { description: "Once a quotation is Approved or Converted, its status is finalized and cannot be changed." })
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/Quotations/${dbId}/status?status=${nextStatus}`, { method: 'PATCH' })
            if (res.ok) {
                toast.success(`Quotation ${nextStatus} successfully`)
                fetchQuotations()
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || "Failed to update status")
            }
        } catch (err) {
            toast.error("Error updating quotation")
        }
    }

    const handleDelete = async (dbId: number, status: string) => {
        if (["approved", "converted"].includes(status.toLowerCase())) {
            toast.error("Finalized Document Protected", { description: "Approved or Converted quotations cannot be deleted to maintain audit integrity." })
            return;
        }
        if (!confirm("Are you sure you want to delete this estimation?")) return
        try {
            const res = await fetch(`${API_BASE}/api/Quotations/${dbId}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Estimation deleted")
                fetchQuotations()
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || "Failed to delete")
            }
        } catch (err) {
            toast.error("Error deleting estimation")
        }
    }

    const handleConvert = async (dbId: number, status: string) => {
        if (processingId === dbId) return;
        const currentStatus = status.toLowerCase();
        if (currentStatus === "converted") {
            toast.error("Already Processed", { description: "A Job Card has already been generated for this quotation." });
            return;
        }
        if (currentStatus !== "approved") {
            toast.warning("Quotation Not Approved", { description: "Please approve this quotation before converting to a Job Card." });
            return;
        }
        setProcessingId(dbId);
        try {
            const res = await fetch(`${API_BASE}/api/Quotations/${dbId}/convert`, { method: 'POST' })
            if (res.ok) {
                const data = await res.json()
                toast.success("Successfully converted to Job Card!", {
                    description: `New Job Card ID: ${data.jobId}`
                })
                fetchQuotations()
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || "Failed to convert")
            }
        } catch (err) {
            toast.error("Error converting quotation")
        } finally {
            setProcessingId(null);
        }
    }

    const [printUrl, setPrintUrl] = useState<string | null>(null)
    const [isPrinting, setIsPrinting] = useState(false)

    const handleDirectPrint = (dbId: number) => {
        setIsPrinting(true)
        setPrintUrl(`/print/quotation/${dbId}?t=${Date.now()}`)
    }

    const columns: ColumnDef<Quotation>[] = [
        {
            key: "id",
            label: "QT Number",
            render: (val) => (
                <span className="font-sans text-black text-xs hover:underline cursor-pointer font-medium">
                    {val}
                </span>
            )
        },
        {
            key: "date",
            label: "Date",
            className: "text-black font-sans text-xs",
        },
        {
            key: "customer",
            label: "Customer",
            className: "font-sans text-black text-sm",
        },
        {
            key: "amount",
            label: "Amount",
            render: (val) => (
                <span className="font-sans text-black">
                    ₹{Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (val) => {
                const isConverted = String(val).toLowerCase() === "converted";
                return (
                    <Badge className={`text-[8px] font-sans px-3 h-6 border uppercase tracking-widest whitespace-nowrap ${statusStyles[String(val).toLowerCase()] || statusStyles.draft}`}>
                        {isConverted ? "Converted to Job Card" : val}
                    </Badge>
                )
            }
        },
        {
            key: "actions",
            label: "Action",
            filterable: false,
            headerClassName: "text-right w-[280px]",
            className: "text-right",
            render: (_, qt, viewMode) => (
                <div className={`flex items-center justify-end gap-0.5 px-1 ${viewMode === 'table' ? 'flex-nowrap' : 'flex-wrap'}`}>
                    <Can I="print" a="quotations">
                        <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-400 hover:text-indigo-600 transition-all shadow-none shrink-0" 
                            title="Direct Print" 
                            onClick={() => handleDirectPrint(qt.dbId)}
                        >
                            <FileDown className={`h-3.5 w-3.5 ${isPrinting && printUrl?.includes(`/${qt.dbId}`) ? 'animate-pulse text-indigo-600' : ''}`} />
                        </Button>
                    </Can>

                    <Can I="approve" a="quotations">
                        <Button 
                            size="icon" 
                            variant="outline" 
                            className={`h-7 w-7 rounded-md border-slate-200 bg-white transition-all shadow-none shrink-0 
                                ${["approved", "converted"].includes(qt.status.toLowerCase()) ? 'text-slate-100 opacity-40' : 'text-slate-400 hover:text-emerald-600'}`} 
                            title="Approve" 
                            onClick={() => handleStatusUpdate(qt.dbId, "Approved", qt.status)}
                        >
                            <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                            size="icon" 
                            variant="outline" 
                            className={`h-7 w-7 rounded-md border-slate-200 bg-white transition-all shadow-none shrink-0 
                                ${["approved", "converted"].includes(qt.status.toLowerCase()) ? 'text-slate-100 opacity-40' : 'text-slate-400 hover:text-rose-600'}`} 
                            title="Reject" 
                            onClick={() => handleStatusUpdate(qt.dbId, "Rejected", qt.status)}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </Can>
                    <Can I="create" a="production">
                        <Button 
                            disabled={processingId === qt.dbId}
                            size="icon" 
                            variant="outline" 
                            className={`h-7 w-7 rounded-md border-slate-200 bg-white transition-all shadow-none shrink-0 
                                ${qt.status.toLowerCase() === 'approved' ? 'text-emerald-600 hover:text-emerald-700' : 
                                  qt.status.toLowerCase() === 'converted' ? 'text-slate-100 opacity-40' : 'text-slate-300 hover:text-slate-400 opacity-60'}`} 
                            title={qt.status.toLowerCase() === 'approved' ? "Convert to Job Card" : 
                                   qt.status.toLowerCase() === 'converted' ? "Already Converted" : "Approval Required"} 
                            onClick={() => handleConvert(qt.dbId, qt.status)}
                        >
                            <Hammer className={`h-3.5 w-3.5 ${processingId === qt.dbId ? 'animate-spin' : ''}`} />
                        </Button>
                    </Can>
                    <Can I="edit" a="quotations">
                        <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-400 hover:text-blue-500 transition-all shadow-none shrink-0" title="Edit" onClick={() => router.push(`/estimator/new?id=${qt.dbId}`)}>
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                    </Can>
                    <Can I="delete" a="quotations">
                        <Button 
                            size="icon" 
                            variant="outline" 
                            className={`h-7 w-7 rounded-md border-slate-200 bg-white transition-all shadow-none shrink-0 
                                ${["approved", "converted"].includes(qt.status.toLowerCase()) ? 'text-slate-200' : 'text-slate-400 hover:text-rose-500'}`} 
                            title={["approved", "converted"].includes(qt.status.toLowerCase()) ? "Protected Record" : "Delete"} 
                            onClick={() => handleDelete(qt.dbId, qt.status)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </Can>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-2 font-sans">
            {printUrl && (
                <iframe
                    src={printUrl}
                    style={{ position: 'fixed', top: '-10000px', left: '-10000px', width: '210mm', height: '297mm' }}
                    onLoad={() => {
                        // The print page handles its own window.print()
                        setTimeout(() => {
                            setPrintUrl(null);
                            setIsPrinting(false);
                        }, 5000);
                    }}
                />
            )}

            {/* Header */}
            <div className="flex flex-row items-center justify-between gap-2 px-1 font-sans mb-2">
                <div className="text-left shrink-0">
                    <h1 className="text-sm sm:text-xl font-bold tracking-tight text-slate-900 leading-none">Estimation Ledger</h1>
                </div>

                <div className="flex items-center gap-2">
                    <Can I="create" a="quotations">
                        <Button
                            className="h-8 sm:h-9 px-3 sm:px-5 text-white font-bold text-[10px] sm:text-xs shadow-sm rounded-lg gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                            style={{ background: 'var(--primary)' }}
                            onClick={() => router.push('/estimator/new')}
                        >
                            <Calculator className="h-3.5 w-3.5" /> 
                            <span className="hidden xs:inline">Advanced Estimator</span>
                            <span className="xs:hidden">New Est</span>
                        </Button>
                    </Can>
                </div>
            </div>

            <div className="px-0 sm:px-1 mt-4">
                <DataGrid
                    data={quotations}
                    columns={columns}
                    title="Quotations"
                    enableDateRange={true}
                    dateFilterKey="date"
                    searchPlaceholder="Search QT#, Client or Amount..."
                    enableSelection={true}
                    initialPageSize={10}
                    cardRender={(qt: Quotation) => (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full font-sans">
                            {/* Card Header */}
                            <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">{qt.id}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{qt.date}</span>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-1 space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-slate-800 leading-snug line-clamp-1">{qt.customer}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                                            <span className="text-base font-black text-slate-900 tabular-nums">₹{Number(qt.amount).toLocaleString("en-IN")}</span>
                                        </div>
                                        <Badge className={`text-[8px] font-sans px-2.5 h-5 border uppercase tracking-widest whitespace-nowrap ${statusStyles[qt.status] || statusStyles.draft}`}>
                                            {qt.status === 'converted' ? "Converted" : qt.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-3 py-3 bg-slate-50/50 border-t border-slate-100 grid grid-cols-5 gap-1">
                                <Can I="print" a="quotations">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-9 w-full text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-none" 
                                        onClick={(e) => { e.stopPropagation(); handleDirectPrint(qt.dbId); }}
                                    >
                                        <FileDown className={`h-4 w-4 ${isPrinting && printUrl?.includes(`/${qt.dbId}`) ? 'animate-pulse text-indigo-600' : ''}`} />
                                    </Button>
                                </Can>
                                <Can I="approve" a="quotations">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className={`h-9 w-full rounded-lg transition-all shadow-none 
                                            ${["approved", "converted"].includes(qt.status) ? 'text-slate-100 opacity-20' : 'text-slate-400 hover:text-emerald-600 hover:bg-white'}`} 
                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(qt.dbId, "Approved", qt.status); }}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </Can>
                                <Can I="create" a="production">
                                    <Button 
                                        disabled={processingId === qt.dbId}
                                        variant="ghost" 
                                        size="sm" 
                                        className={`h-9 w-full rounded-lg transition-all shadow-none 
                                            ${qt.status === 'approved' ? 'text-emerald-600 hover:bg-white' : 
                                              qt.status === 'converted' ? 'text-slate-100 opacity-20' : 'text-slate-300 opacity-40'}`} 
                                        onClick={(e) => { e.stopPropagation(); handleConvert(qt.dbId, qt.status); }}
                                    >
                                        <Hammer className={`h-4 w-4 ${processingId === qt.dbId ? 'animate-spin' : ''}`} />
                                    </Button>
                                </Can>
                                <Can I="edit" a="quotations">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-9 w-full text-slate-400 hover:text-blue-500 hover:bg-white rounded-lg transition-all shadow-none" 
                                        onClick={(e) => { e.stopPropagation(); router.push(`/estimator/new?id=${qt.dbId}`); }}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </Can>
                                <Can I="delete" a="quotations">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className={`h-9 w-full rounded-lg transition-all shadow-none 
                                            ${["approved", "converted"].includes(qt.status) ? 'text-slate-100 opacity-20' : 'text-slate-400 hover:text-rose-500 hover:bg-white'}`} 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(qt.dbId, qt.status); }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </Can>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    )
}
