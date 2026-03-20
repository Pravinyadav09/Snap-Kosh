"use client"

import React, { useState } from "react"
import {
    History,
    Search,
    Filter,
    ArrowLeft,
    Truck,
    Package,
    Calendar,
    User,
    MapPin,
    Printer,
    ExternalLink,
    FileText,
    CheckCircle2,
    Clock,
    Box,
    Tag,
    ChevronLeft
} from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

// --- Types ---
type TransitHistory = {
    id: string
    jobId: string
    jobName: string
    customerName: string
    shippedQty: number
    dispatchDate: string
    mode: "Staff" | "Courier" | "Self" | "Direct"
    trackingId: string
    status: "Delivered" | "In-Transit" | "Returned"
    location: string
    boxes: number
}

// --- Mock Data ---
const historyData: TransitHistory[] = [
    {
        id: "DC-9011",
        jobId: "JB-2026-045",
        jobName: "Shabdolok Book Printing",
        customerName: "Shabdolok Publications",
        shippedQty: 2000,
        dispatchDate: "2026-03-09",
        mode: "Staff",
        trackingId: "Ramesh Kumar",
        status: "Delivered",
        location: "Okhla Ph-III",
        boxes: 5
    },
    {
        id: "DC-9015",
        jobId: "JB-2026-048",
        jobName: "Gaur City Center Flyers",
        customerName: "Gaur City Center Admin",
        shippedQty: 10000,
        dispatchDate: "2026-03-10",
        mode: "Courier",
        trackingId: "TRACK-55291-BD",
        status: "In-Transit",
        location: "Noida Sec-62",
        boxes: 12
    },
    {
        id: "DC-8998",
        jobId: "JB-2026-030",
        jobName: "Wedding Invitation Gold",
        customerName: "Personal Order",
        shippedQty: 500,
        dispatchDate: "2026-03-05",
        mode: "Self",
        trackingId: "Picked by Client",
        status: "Delivered",
        location: "Local Pickup",
        boxes: 2
    }
]

export default function TransitHistoryPage() {
    const router = useRouter()
    const [data] = useState<TransitHistory[]>(historyData)

    const columns: ColumnDef<TransitHistory>[] = [
        {
            key: "id",
            label: "D.C. No",
            render: (val) => <span className="font-sans text-[11px] font-black text-slate-400 uppercase tracking-tighter">#{val}</span>
        },
        {
            key: "dispatchDate",
            label: "Date",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600 tabular-nums">{val}</span>
                </div>
            )
        },
        {
            key: "jobName",
            label: "Shipment Details",
            render: (val, row) => (
                <div className="flex flex-col gap-0.5 py-1">
                    <span className="font-sans text-[13px] font-black text-slate-800 tracking-tight leading-tight">{val}</span>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{row.customerName}</span>
                         <span className="text-[10px] text-slate-300 font-medium">|</span>
                         <span className="text-[10px] text-primary font-black uppercase">{row.jobId}</span>
                    </div>
                </div>
            )
        },
        {
            key: "shippedQty",
            label: "Qty Sent",
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="text-[13px] font-black text-slate-700 tabular-nums">{val.toLocaleString()} Units</span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Box className="h-2.5 w-2.5" /> {row.boxes} Boxes
                    </span>
                </div>
            )
        },
        {
            key: "mode",
            label: "Logistics",
            render: (val, row) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <Truck className="h-3 w-3 text-slate-400" />
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{val}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium italic max-w-[120px] truncate">{row.trackingId}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (val) => {
                const styles = {
                    "Delivered": "bg-emerald-50 text-emerald-600 border-emerald-100",
                    "In-Transit": "bg-blue-50 text-blue-600 border-blue-100",
                    "Returned": "bg-rose-50 text-rose-600 border-rose-100"
                }
                return (
                    <Badge variant="outline" className={`h-6 px-2.5 text-[9px] font-black uppercase tracking-widest border ${(styles as any)[val]}`}>
                        {val === "Delivered" ? <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> : <Clock className="h-2.5 w-2.5 mr-1" />}
                        {val}
                    </Badge>
                )
            }
        },
        {
            key: "actions",
            label: "Receipt",
            className: "text-right",
            render: () => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-slate-500 gap-1.5 hover:bg-slate-50 border-slate-200">
                        <Printer className="h-3 w-3" /> Re-Print DC
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-4 font-sans bg-white p-4 lg:p-6 rounded-lg">
            {/* --- Standardized Header --- */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-1 pb-4">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.push('/dispatch')}
                        className="h-10 w-10 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 font-heading text-balance uppercase">Transit History</h1>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="bg-slate-50 px-5 py-2 rounded-md border border-slate-100">
                        <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Total Dispatches</p>
                        <p className="text-xl font-black text-slate-800 tabular-nums">148 <span className="text-[10px] font-bold text-slate-400">Total</span></p>
                    </div>
                    <Button variant="outline" className="h-9 px-4 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans shadow-sm">
                        <FileText className="h-4 w-4 text-primary" /> Export Logs
                    </Button>
                </div>
            </div>

            {/* --- Grid Container --- */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                <DataGrid
                    data={data}
                    columns={columns}
                    title="History Archive"
                    hideTitle={true}
                    enableCardView={true}
                    searchPlaceholder="Search D.C. No, Job ID, or Customer..."
                    toolbarClassName="border-b px-4 py-3 bg-white"
                />
            </div>
        </div>
    )
}
