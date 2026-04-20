"use client"

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect } from "react"
import { RefreshCcw, Layers, Boxes, Maximize2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function StockOverviewPage() {
    const [stocks, setStocks] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchAllStocks = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const [paperRes, mediaRes, legacyRes] = await Promise.all([
                fetch(`${API_BASE}/api/SpecializedInventory/paper`),
                fetch(`${API_BASE}/api/SpecializedInventory/media`),
                fetch(`${API_BASE}/api/inventory`)
            ])

            let combined: any[] = []

            if (paperRes.ok) {
                const paperData = await paperRes.json()
                const formattedPaper = paperData.map((item: any) => ({
                    ...item,
                    id: `PPR-${item.id}`,
                    __category: "Paper",
                    unifiedDimension: item.size || `${item.width}" x ${item.height}"`,
                    unifiedQty: item.quantity,
                    unifiedUnit: "Sheets",
                    unifiedValue: item.unitPrice,
                    unifiedValueLabel: "₹/Sheet"
                }))
                combined = [...combined, ...formattedPaper]
            }

            if (mediaRes.ok) {
                const mediaData = await mediaRes.json()
                const formattedMedia = mediaData.map((item: any) => ({
                    ...item,
                    id: `MED-${item.id}`,
                    __category: "Media",
                    unifiedDimension: `${item.rollWidth}" x ${item.rollLength}m`,
                    unifiedQty: item.quantitySqFt,
                    unifiedUnit: "Sq.Ft",
                    unifiedValue: item.costPerSqFt,
                    unifiedValueLabel: "₹/Sq.Ft"
                }))
                combined = [...combined, ...formattedMedia]
            }

            if (legacyRes.ok) {
                const legacyData = await legacyRes.json()
                const formattedLegacy = legacyData.map((item: any) => ({
                    ...item,
                    id: `INV-${item.id}`,
                    __category: item.category || "General",
                    unifiedDimension: "-",
                    unifiedQty: item.currentStock,
                    unifiedUnit: item.unit || "Units",
                    unifiedValue: item.lastPurchasePrice,
                    unifiedValueLabel: "₹/Unit"
                }))
                combined = [...combined, ...formattedLegacy]
            }

            combined.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
            setStocks(combined)

        } catch (error) {
            toast.error("Communication failure with registry server.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAllStocks()
    }, [fetchAllStocks])

    const columns: ColumnDef<any>[] = [
        {
            key: "name",
            label: "Material Description",
            render: (v, i) => (
                <div className="flex flex-col font-sans">
                    <span className="font-bold text-sm text-slate-800">{v as string}</span>
                    <span className="text-[10px] text-slate-400">UID: #{i.id} | Type: {i.type || "-"}</span>
                </div>
            )
        },
        {
            key: "__category",
            label: "Category",
            render: (v) => (
                <Badge variant="outline" className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 h-6 border-slate-100 font-sans",
                    v === "Paper" ? "bg-indigo-50 text-indigo-600" :
                        v === "Media" ? "bg-fuchsia-50 text-fuchsia-600" :
                            "bg-slate-50 text-slate-500"
                )}>
                    {v === "Paper" ? <Boxes className="w-3 h-3 mr-1" /> :
                        v === "Media" ? <Maximize2 className="w-3 h-3 mr-1" /> :
                            <Layers className="w-3 h-3 mr-1" />}
                    {v as string}
                </Badge>
            )
        },
        {
            key: "unifiedDimension",
            label: "Dimension / Size",
            render: (v, i) => (
                <div className="flex flex-col font-sans">
                    <span className="font-bold text-sm text-slate-700">{v as string}</span>
                    {i.__category === "Paper" && i.gsm && <span className="text-[10px] text-slate-500">{i.gsm} GSM</span>}
                </div>
            )
        },
        {
            key: "unifiedQty",
            label: "Available Stock",
            className: "text-right font-sans",
            render: (v, i) => (
                <div className="flex flex-col items-end">
                    <span className={cn(
                        "font-black text-sm",
                        (v as number) <= (i.lowStockAlert || 50) ? "text-rose-600" : "text-emerald-600"
                    )}>
                        {(v as number).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{i.unifiedUnit}</span>
                </div>
            )
        },
        {
            key: "unifiedValue",
            label: "Unit Cost",
            className: "text-right font-sans",
            render: (v, i) => (
                <div className="flex flex-col items-end">
                    <span className="font-bold text-sm text-slate-900">₹{(v as number || 0).toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{i.unifiedValueLabel}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            className: "text-center font-sans",
            render: (v, i) => {
                const isLow = i.unifiedQty <= (i.lowStockAlert || 50)
                return (
                    <Badge variant={!isLow ? 'default' : 'secondary'} className={cn(
                        "text-[10px] font-bold px-2 rounded-lg border-none h-6 uppercase tracking-wider",
                        !isLow ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                        {isLow ? "Low Stock" : (v || "In Stock")}
                    </Badge>
                )
            }
        }
    ]

    return (
        <div className="space-y-2 font-sans px-1">
            {/* Compact Standard Header */}
            <div className="flex flex-row items-center justify-between gap-2 font-sans mb-1">
                <div className="text-left">
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase leading-none">Stock Overview</h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchAllStocks} className={cn("h-9 w-9 p-0 rounded-lg border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-all", isLoading && "animate-spin")}>
                        <RefreshCcw className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Link href="/inventory/stock/history">
                        <Button className="h-9 px-5 text-white font-bold text-xs rounded-lg gap-2 shadow-sm font-sans active:scale-95 transition-all" style={{ background: "var(--primary)" }}>
                            <History className="h-4 w-4" /> Show History
                        </Button>
                    </Link>
                </div>
            </div>


            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                <DataGrid
                    data={stocks}
                    columns={columns}
                    isLoading={isLoading}
                    searchPlaceholder="Search uniform inventory..."
                    hideTitle={true}
                    toolbarClassName="px-5 py-3 border-b"
                    initialPageSize={10}
                />
            </div>
        </div>
    )
}
