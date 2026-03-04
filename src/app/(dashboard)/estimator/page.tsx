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
            headerClassName: "w-[120px]",
            render: (val) => (
                <span className="font-bold text-slate-900 font-mono text-xs hover:underline cursor-pointer uppercase tracking-tight italic">
                    {val}
                </span>
            )
        },
        {
            key: "date",
            label: "Date",
            headerClassName: "w-[140px]",
            className: "text-slate-500 font-medium text-xs",
        },
        {
            key: "customer",
            label: "Customer",
            className: "font-bold text-slate-800 text-sm",
        },
        {
            key: "amount",
            label: "Amount",
            render: (val) => (
                <span className="font-black text-slate-900 tracking-tight">
                    ₹{Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            headerClassName: "w-[100px]",
            render: (val) => (
                <Badge className={`text-[10px] uppercase font-black px-2.5 h-5 border shadow-none ${statusStyles[String(val)] || statusStyles.draft}`}>
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
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-300 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-none" title="Download">
                        <FileText className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-blue-300 bg-white text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-none" title="View">
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-emerald-300 bg-white text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shadow-none" title="Approve">
                        <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-300 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Reject">
                        <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-emerald-600 bg-white text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shadow-none" title="Convert to Job Card" onClick={() => toast.success("Quotation approved successfully.", { description: `Converted to Job Card.` })}>
                        <Hammer className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-blue-500 bg-white text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-none" title="Edit">
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-500 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-4 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5 text-left">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">Estimation Ledger</h1>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-sans">Commercial Bidding Console</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="gap-2 border-slate-200 font-bold h-11 px-6 text-xs"
                        onClick={() => router.push('/estimator/new')}
                    >
                        <Calculator className="h-4 w-4" /> Advanced Estimator
                    </Button>


                </div>
            </div>

            <Card className="shadow-2xl shadow-blue-100/50 border-none bg-background rounded-3xl overflow-hidden border border-slate-100">
                <CardContent className="p-6">
                    <DataGrid
                        data={quotations}
                        columns={columns}
                        title="Quotations"
                        searchPlaceholder="Search QT#, Client or Amount..."
                        enableSelection={true}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
