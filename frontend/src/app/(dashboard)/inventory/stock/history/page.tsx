"use client"

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect } from "react"
import { RefreshCcw, ArrowLeft, History, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function StockHistoryPage() {
    const [history, setHistory] = useState<any[]>([])
    const [materialsMap, setMaterialsMap] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const [historyRes, dictRes] = await Promise.all([
                fetch(`${API_BASE}/api/Inventory/history`),
                fetch(`${API_BASE}/api/Inventory/lookup`)
            ])

            if (dictRes.ok) {
                const dictData = await dictRes.json()
                const map: Record<string, string> = {}
                dictData.forEach((i: any) => { map[i.value] = i.label })
                setMaterialsMap(map)
            }

            if (historyRes.ok) {
                setHistory(await historyRes.json())
            } else {
                toast.error("Failed to load audit trail.")
            }
        } catch (error) {
            toast.error("Communication failure with registry server.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const columns: ColumnDef<any>[] = [
        {
            key: "transactionDate",
            label: "Time & Date",
            render: (v) => <span className="text-xs font-bold text-slate-500 font-sans">{new Date(v as string).toLocaleString()}</span>
        },
        {
            key: "materialName",
            label: "Material Description",
            render: (_, i) => (
                <div className="flex flex-col font-sans">
                    <span className="font-bold text-sm text-slate-800">{materialsMap[i.inventoryItemId] || `Unknown Item #${i.inventoryItemId}`}</span>
                    <span className="text-[10px] text-slate-400">UID: #{i.inventoryItemId}</span>
                </div>
            )
        },
        {
            key: "type",
            label: "Movement",
            render: (v) => (
                <div className="flex items-center gap-2 font-sans">
                    <Badge variant="outline" className={cn(
                        "text-[10px] uppercase font-bold px-2 rounded-sm border-none shadow-none",
                        v === "Inward" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                        {v as string}
                    </Badge>
                </div>
            )
        },
        {
            key: "quantity",
            label: "Volume",
            className: "text-right font-sans",
            render: (v, i) => (
                <span className={cn(
                    "font-black text-sm",
                    i.type === "Inward" ? "text-emerald-600" : "text-rose-600"
                )}>
                    {i.type === "Inward" ? "+" : "-"}{(v as number).toLocaleString()}
                </span>
            )
        },
        {
            key: "reference",
            label: "Source Reference",
            render: (_, i) => (
                <div className="flex items-center gap-2 font-sans">
                    {i.referenceType === 'JobCard' ? (
                        <Link href={i.referenceId ? `/jobs/${i.referenceId}/edit` : '#'} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-md font-bold text-xs hover:bg-amber-100 transition-colors">
                            <FileText className="h-3.5 w-3.5" /> Job Card #{i.referenceId}
                        </Link>
                    ) : i.referenceType === 'PurchaseOrder' ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md font-bold text-xs">
                             PO Ref #{i.referenceId}
                         </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-md font-bold text-[10px] uppercase tracking-wider">
                             {i.referenceType === 'SupplierReturn' ? `RTN #${i.referenceId}` : i.referenceType}
                        </span>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none font-sans">Material Usage History</h1>
                    <p className="text-xs font-medium text-slate-400 mt-1 font-sans">Comprehensive audit trail of stock inward/outward mapping</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchData} className={cn("h-9 w-9 p-0 rounded-lg border-slate-200", isLoading && "animate-spin")}>
                        <RefreshCcw className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Link href="/inventory/stock">
                        <Button variant="outline" className="h-9 px-4 rounded-lg text-slate-600 font-bold text-xs flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Stock
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                <DataGrid 
                    data={history} 
                    columns={columns} 
                    isLoading={isLoading} 
                    searchPlaceholder="Search material usage or references..." 
                    hideTitle={true} 
                    toolbarClassName="px-5 py-3 border-b" 
                />
            </div>
        </div>
    )
}
