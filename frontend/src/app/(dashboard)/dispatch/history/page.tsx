"use client"

import { API_BASE } from '@/lib/api'

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



export default function TransitHistoryPage() {
    const router = useRouter()
    const [data, setData] = React.useState<TransitHistory[]>([])

    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch all Jobs first for mapping
                const jobsRes = await fetch(`${API_BASE}/api/jobcards?size=2000`)
                let jobsMap: Record<string, any> = {}
                if (jobsRes.ok) {
                    const jobsJson = await jobsRes.json()
                    const jobsArray = jobsJson.items || jobsJson || []
                    jobsArray.forEach((j: any) => { jobsMap[j.id.toString()] = j })
                }

                // Fetch DISPATCH audit logs
                const auditRes = await fetch(`${API_BASE}/api/audit/recent?count=500`)
                if (auditRes.ok) {
                    const logs = await auditRes.json()
                    const dispatchLogs = logs.filter((l: any) => l.action === "DISPATCH")
                    
                    const groupedMap: Record<string, TransitHistory> = {}

                    dispatchLogs.forEach((l: any) => {
                        const job = jobsMap[l.entityId] || {}
                        const parts = l.changes?.split(',').map((p: string) => p.trim()) || []
                        const qty = parts.find((p: string) => p.startsWith('Qty:'))?.split(':')[1] || '0'
                        const mode = parts.find((p: string) => p.startsWith('Mode:'))?.split(':')[1] || 'Direct'
                        const ref = parts.find((p: string) => p.startsWith('Tracking:'))?.split(':')[1] || 'N/A'

                        // Extract Batch ID: "Ref [BATCH-12345]" -> "BATCH-12345"
                        const batchMatch = ref.match(/\[(BATCH-\d+)\]/)
                        const batchKey = batchMatch ? batchMatch[1] : `SINGLE-${l.id}`
                        const cleanRef = batchMatch ? ref.replace(` [${batchKey}]`, '') : ref

                        if (groupedMap[batchKey]) {
                            // Append to existing group
                            groupedMap[batchKey].shippedQty += Number(qty)
                            groupedMap[batchKey].boxes += Math.ceil(Number(qty) / 500)
                            if (!groupedMap[batchKey].jobId.includes(job.jobNumber)) {
                                groupedMap[batchKey].jobId += `, ${job.jobNumber}`
                            }
                            if (!groupedMap[batchKey].jobName.includes(job.jobDescription)) {
                                groupedMap[batchKey].jobName += ` | ${job.jobDescription}`
                            }
                        } else {
                            groupedMap[batchKey] = {
                                id: batchMatch ? batchKey : l.id.toString(),
                                jobId: job.jobNumber || `JB-${l.entityId}`,
                                jobName: job.jobDescription || "Factory Item",
                                customerName: job.customerName || "Unknown Client",
                                shippedQty: Number(qty),
                                dispatchDate: new Date(l.timestamp).toLocaleDateString('en-GB'),
                                mode: mode as any,
                                trackingId: cleanRef,
                                status: "Delivered",
                                location: "Client Hub",
                                boxes: Math.ceil(Number(qty) / 500)
                            }
                        }
                    })

                    setData(Object.values(groupedMap))
                }
            } catch (err) {
                console.error(err)
            }
        }
        fetchHistory()
    }, [])

    const columns: ColumnDef<TransitHistory>[] = [
        {
            key: "id",
            label: "D.C. No",
            render: (val) => {
                const isBatch = val.startsWith('BATCH-');
                const displayVal = isBatch ? val.split('-')[1].substring(0, 8) + '...' : val;
                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-sans text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                            #{displayVal}
                        </span>
                        {isBatch && (
                            <Badge variant="outline" className="text-[8px] h-4 px-1 bg-primary/5 text-primary border-primary/10 w-fit">BATCH</Badge>
                        )}
                    </div>
                )
            }
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
            initialWidth: 450,
            render: (val, row) => {
                const renderDetails = (text: string) => {
                    if (!text) return <span className="text-slate-400 italic">No details provided</span>;
                    
                    // Handle multiple segments joined by "|"
                    const segments = text.split(' | ');
                    
                    return (
                        <div className="flex flex-col gap-2 mt-1">
                            {segments.map((segment, sIdx) => {
                                const trimmed = segment.trim();
                                // Check if this segment is JSON
                                if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                                    try {
                                        const items = JSON.parse(trimmed);
                                        const itemsArray = Array.isArray(items) ? items : [items];
                                        return itemsArray.map((item: any, iIdx: number) => (
                                            <div key={`${sIdx}-${iIdx}`} className="flex flex-col border-l-2 border-primary/20 pl-2 py-0.5 bg-slate-50/30 rounded-r">
                                                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                                                    {item.description || item.Description || "Item Entry"}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-black text-primary/60 uppercase">Qty: {item.qty || item.Qty}</span>
                                                    <span className="text-[9px] text-slate-300">|</span>
                                                    <span className="text-[9px] font-bold text-slate-400">Rate: ₹{item.rate || item.Rate}</span>
                                                </div>
                                            </div>
                                        ));
                                    } catch (e) {
                                        return (
                                            <div key={sIdx} className="flex items-center gap-1.5 border-l-2 border-slate-200 pl-2 bg-slate-50/50 rounded-r py-0.5">
                                                <span className="text-[10px] font-bold text-slate-600 leading-tight">{trimmed}</span>
                                            </div>
                                        );
                                    }
                                }

                                return (
                                    <div key={sIdx} className="flex items-center gap-1.5 border-l-2 border-slate-200 pl-2 bg-slate-50/50 rounded-r py-0.5">
                                        <div className="h-1 w-1 rounded-full bg-slate-400" />
                                        <span className="text-[10px] font-bold text-slate-600 leading-tight">{trimmed}</span>
                                    </div>
                                );
                            })}
                        </div>
                    );
                };

                return (
                    <div className="flex flex-col gap-0.5 py-1 min-w-[350px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{row.customerName}</span>
                            <span className="text-[10px] font-black text-primary px-1.5 py-0.5 bg-primary/5 rounded">{row.jobId}</span>
                        </div>
                        {renderDetails(val)}
                    </div>
                );
            }
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
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-slate-500 gap-1.5 hover:bg-slate-50 border-slate-200"
                        onClick={() => window.open(`/print/dc/${row.id}`, '_blank')}
                    >
                        <Printer className="h-3 w-3" /> Re-Print DC
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-2 font-sans px-1">
            <div className="flex flex-row items-center justify-between gap-4 px-1 pb-1 mb-1">
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.push('/dispatch')}
                        className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase">Transit History</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
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
                    initialPageSize={10}
                />
            </div>
        </div>
    )
}
