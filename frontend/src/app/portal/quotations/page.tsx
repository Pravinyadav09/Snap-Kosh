"use client"
import { API_BASE, API } from '@/lib/api'

import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { 
    FileText, 
    CheckCircle2, 
    Clock, 
    Ticket
} from "lucide-react"

export default function PortalQuotationsPage() {
    const router = useRouter()
    const [quotations, setQuotations] = useState<any[]>([])
    const [customer, setCustomer] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedCustomer = localStorage.getItem("portal_customer")
        if (storedCustomer) {
            const parsed = JSON.parse(storedCustomer)
            setCustomer(parsed)
            loadQuotations(parsed.id)
        } else {
            router.push("/portal/login")
        }
    }, [router])

    const loadQuotations = async (customerId: number) => {
        try {
            const res = await fetch(API.jobs.myQuotations(customerId))
            if (res.ok) {
                const data = await res.json()
                const formattedData = data.map((q: any) => ({
                    id: q.id || q.Id,
                    quotationNumber: q.quotationNumber || q.QuotationNumber,
                    description: q.description || q.Description,
                    status: q.status || q.Status,
                    date: q.createdAt || q.CreatedAt,
                    total: q.quotedPrice || q.QuotedPrice,
                    paperType: q.paperType || q.PaperType,
                    paperSize: q.paperSize || q.PaperSize,
                    bookDetails: q.bookDetails || q.BookDetails
                }))
                setQuotations(formattedData)
            }
        } catch (err) {
            console.error("Failed to load quotations", err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount)
    }

    const columns: ColumnDef<any>[] = [
        {
            label: "Estimate Ref",
            key: "quotationNumber",
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                        <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-700 text-xs tracking-widest">{val}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5 tracking-wide max-w-[300px] truncate leading-tight">
                            {(() => {
                                let d = row.description || "";
                                try {
                                    if (d.startsWith('[') || d.startsWith('{')) {
                                        const parsed = JSON.parse(d);
                                        if (Array.isArray(parsed)) {
                                            return parsed
                                                .map((item: any) => (item.description || item.DESCRIPTION || "").replace(/^BW\s*\|?\s*/i, "").trim())
                                                .filter(Boolean)
                                                .join(" | ");
                                        }
                                        return (parsed.description || parsed.DESCRIPTION || d).replace(/^BW\s*\|?\s*/i, "").trim();
                                    }
                                } catch (e) {}
                                return d.replace(/^BW\s*\|?\s*/i, "").trim();
                            })()}
                        </div>
                    </div>
                </div>
            )
        },
        {
            label: "Date Issued",
            key: "date",
            render: (val) => (
                <div className="text-xs font-bold text-slate-600">
                    {new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            )
        },
        {
            label: "Est. Total",
            key: "total",
            render: (val) => (
                <div className="text-xs font-black text-slate-700">{formatCurrency(val || 0)}</div>
            )
        },
        {
            label: "Spec Highlights",
            key: "paperSize",
            render: (val, row) => {
                if (!row.paperSize && !row.paperType) {
                    return <span className="text-xs text-slate-400 italic">Custom Specs</span>
                }
                return (
                    <div className="flex flex-wrap gap-1 w-[150px]">
                        {row.paperSize && <Badge className="bg-slate-50 text-[9px] uppercase tracking-tighter text-slate-500 border-none hover:bg-slate-100 px-1.5 h-4">{row.paperSize}</Badge>}
                        {row.paperType && <Badge className="bg-slate-50 text-[9px] uppercase tracking-tighter text-slate-500 border-none hover:bg-slate-100 px-1.5 h-4">{row.paperType}</Badge>}
                    </div>
                )
            }
        },
        {
            label: "Status",
            key: "status",
            render: (val) => {
                const s = (val || "").toLowerCase()
                if (s === "approved" || s === "accepted" || s === "converted") {
                    return (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600 font-bold uppercase tracking-widest text-[9px] px-2.5 h-6">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> ACTIVE
                        </Badge>
                    )
                }
                return (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-600 font-bold uppercase tracking-widest text-[9px] px-2.5 h-6">
                        <Clock className="h-3 w-3 mr-1" /> PENDING
                    </Badge>
                )
            }
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">My Estimates</h1>
                    <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Review Quotations and Budget Approvals</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
                {/* 1. Total Estimates */}
                <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Ticket className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0">
                        <CardTitle className="text-[8px] sm:text-[11px] font-bold uppercase tracking-widest opacity-80">Total Estimates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold">{quotations.length.toString().padStart(2, '0')}</div>
                        <p className="text-[8px] sm:text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full uppercase truncate">All Records</p>
                    </CardContent>
                </Card>

                {/* 2. Approved Estimates */}
                <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <CheckCircle2 className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0">
                        <CardTitle className="text-[8px] sm:text-[11px] font-bold uppercase tracking-widest opacity-80">Approved / Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold">
                            {quotations.filter(q => q.status.toLowerCase() === 'approved' || q.status.toLowerCase() === 'accepted' || q.status.toLowerCase() === 'converted').length.toString().padStart(2, '0')}
                        </div>
                        <p className="text-[8px] sm:text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full uppercase truncate">Converted to Jobs</p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <DataGrid 
                    columns={columns} 
                    data={quotations} 
                    searchPlaceholder="Search by Estimate Ref..."
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}
