"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
    Plus,
    FileText,
    Eye,
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

// ─── Types ───────────────────────────────────────────────────────────────────
type Quotation = {
    id: string
    date: string
    customer: string
    amount: number
    status: "approved" | "rejected" | "draft" | "sent"
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialQuotations: Quotation[] = [
    { id: "QT-00151", date: "31 Dec, 2025", customer: "Farrell, Klocko and Oberbrunner", amount: 6529.23, status: "approved" },
    { id: "QT-2026-0062", date: "11 Feb, 2026", customer: "Denesik-Keeling", amount: 49948.22, status: "approved" },
    { id: "QT-24467", date: "04 Jan, 2026", customer: "Crona Group", amount: 4329.86, status: "approved" },
    { id: "QT-36472", date: "31 Dec, 2025", customer: "Schuster Ltd", amount: 8342.20, status: "approved" },
    { id: "QT-40102", date: "02 Jan, 2026", customer: "Hegmann LLC", amount: 2003.12, status: "rejected" },
    { id: "QT-60328", date: "02 Jan, 2026", customer: "Bailey-Champlin", amount: 884.56, status: "draft" },
    { id: "QT-61931", date: "03 Jan, 2026", customer: "Denesik-Keeling", amount: 1277.61, status: "rejected" },
]

const statusStyles: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    draft: "bg-slate-50 text-slate-700 border-slate-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuotationsPage() {
    const router = useRouter()
    const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations)

    const columns: ColumnDef<Quotation>[] = [
        {
            key: "id",
            label: "QT Number",
            headerClassName: "w-[120px] hidden md:table-cell",
            className: "hidden md:table-cell",
            render: (val) => (
                <span className="font-sans text-slate-900 text-xs hover:underline cursor-pointer font-bold italic">
                    {val}
                </span>
            )
        },
        {
            key: "date",
            label: "Date",
            headerClassName: "w-[140px] hidden md:table-cell",
            className: "text-slate-500 font-sans text-xs hidden md:table-cell",
        },
        {
            key: "customer",
            label: "Customer",
            className: "font-sans text-slate-800 text-sm",
        },
        {
            key: "amount",
            label: "Amount",
            render: (val) => (
                <span className="font-sans text-slate-900">
                    ₹{Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            headerClassName: "w-[100px] hidden lg:table-cell",
            className: "hidden lg:table-cell",
            render: (val) => (
                <Badge className={`text-[10px] font-sans px-2.5 h-5 border shadow-none ${statusStyles[String(val)] || statusStyles.draft}`}>
                    {val}
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Action",
            filterable: false,
            headerClassName: "text-right w-[240px]",
            className: "text-right",
            render: (_, qt) => (
                <div className="flex items-center justify-end gap-1 px-1">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition-all shadow-none" title="Download">
                        <FileDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-400 hover:text-blue-600 transition-all shadow-none" title="View">
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-400 hover:text-emerald-600 transition-all shadow-none hidden sm:inline-flex" title="Approve">
                        <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-400 hover:text-rose-600 transition-all shadow-none hidden sm:inline-flex" title="Reject">
                        <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-emerald-600 hover:text-emerald-700 transition-all shadow-none" title="Convert to Job Card" onClick={() => toast.success("Quotation approved successfully.", { description: `Converted to Job Card.` })}>
                        <Hammer className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-400 hover:text-blue-500 transition-all shadow-none hidden md:inline-flex" title="Edit">
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-400 hover:text-rose-500 transition-all shadow-none" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-4 font-sans bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100 uppercase">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 font-sans">
                <div className="space-y-0.5 text-left">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase italic">Estimation Ledger</h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        className="w-full sm:w-auto gap-2 font-bold h-11 px-6 text-white shadow-sm rounded-md transition-all active:scale-95 text-[10px] uppercase tracking-wider"
                        style={{ background: 'var(--primary)' }}
                        onClick={() => router.push('/estimator/new')}
                    >
                        <Calculator className="h-4 w-4" /> <span className="sm:inline">Advanced Estimator</span>
                    </Button>
                </div>
            </div>

            <Card className="shadow-2xl shadow-blue-100/50 border-none bg-background rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100">
                <CardContent className="p-2 sm:p-6">
                    <DataGrid
                        data={quotations}
                        columns={columns}
                        title="Quotations"
                        enableDateRange={true}
                        dateFilterKey="date"
                        searchPlaceholder="Search QT#, Client or Amount..."
                        enableSelection={true}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
