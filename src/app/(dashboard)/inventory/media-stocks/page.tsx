"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
    Plus, Trash2, Edit,
    Download, Maximize2,
    AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/shared/searchable-select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

// ─── Types ──────────────────────────────────────────────────────────────────
type MediaStock = {
    id: string
    name: string
    type: string
    rollWidth: number // Inches
    rollLength: number // Meters
    costPerRoll: number
    costPerSqFt: number
    quantitySqFt: number
    lowStockAlert: number
    status: "In Stock" | "Low Stock" | "Out of Stock"
    date: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialMedia: MediaStock[] = [
    { id: "M-001", name: "labore Vinyl", type: "Flex", rollWidth: 60, rollLength: 50, costPerRoll: 5000, costPerSqFt: 9.58, quantitySqFt: 2095, lowStockAlert: 500, status: "In Stock", date: "24 Feb, 2026" },
    { id: "M-002", name: "minima Vinyl", type: "Canvas", rollWidth: 24, rollLength: 50, costPerRoll: 4000, costPerSqFt: 12.64, quantitySqFt: 4190, lowStockAlert: 500, status: "In Stock", date: "25 Feb, 2026" },
    { id: "M-003", name: "non Vinyl", type: "Flex", rollWidth: 48, rollLength: 50, costPerRoll: 10000, costPerSqFt: 14.92, quantitySqFt: 1816, lowStockAlert: 500, status: "In Stock", date: "26 Feb, 2026" },
    { id: "M-004", name: "sint Vinyl", type: "Canvas", rollWidth: 24, rollLength: 50, costPerRoll: 8000, costPerSqFt: 12.81, quantitySqFt: 4075, lowStockAlert: 500, status: "In Stock", date: "27 Feb, 2026" },
    { id: "M-005", name: "velit Vinyl", type: "Flex", rollWidth: 24, rollLength: 50, costPerRoll: 6000, costPerSqFt: 11.25, quantitySqFt: 4281, lowStockAlert: 500, status: "In Stock", date: "28 Feb, 2026" },
]

const typeColors: Record<string, string> = {
    "Flex": "bg-cyan-50 text-cyan-600 border-cyan-100",
    "Canvas": "bg-blue-50 text-blue-600 border-blue-100",
}

// ─── Media Form Dialog ──────────────────────────────────────────────────────
function MediaFormDialog({
    media,
    onClose
}: {
    media?: MediaStock,
    onClose: () => void
}) {
    const [name, setName] = useState(media?.name || "")
    const [type, setType] = useState(media?.type || "Flex")
    const [width, setWidth] = useState(media?.rollWidth || 36)
    const [length, setLength] = useState(media?.rollLength || 50)
    const [costPerRoll, setCostPerRoll] = useState(media?.costPerRoll || 0)
    const [costPerSqFt, setCostPerSqFt] = useState(media?.costPerSqFt || 0)
    const [initialStock, setInitialStock] = useState(media?.quantitySqFt || 0)
    const [lowAlert, setLowAlert] = useState(media?.lowStockAlert || 500)

    // Auto-calculate Sq Ft Cost
    useEffect(() => {
        const totalSqFt = (width * (length * 3.28084)) / 12
        if (totalSqFt > 0) {
            const calculated = costPerRoll / totalSqFt
            setCostPerSqFt(parseFloat(calculated.toFixed(2)))
        } else {
            setCostPerSqFt(0)
        }
    }, [width, length, costPerRoll])

    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 border-none shadow-xl rounded-md bg-white font-sans overflow-hidden uppercase">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white italic font-sans uppercase">
                <DialogTitle className="text-lg font-black text-slate-800 tracking-tight leading-none">
                    {media ? "Revise Media Roll" : "Register Media Roll"}
                </DialogTitle>
                <DialogDescription className="sr-only font-sans">Media Configuration Form</DialogDescription>
            </div>

            <div className="p-4 sm:p-8 space-y-6 flex-1 overflow-y-auto max-h-[75vh]">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Media Name <span className="text-rose-500">*</span></Label>
                        <Input
                            className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Star Flex 250 GSM"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Type <span className="text-rose-500">*</span></Label>
                        <SearchableSelect
                            options={[
                                { value: 'Flex', label: 'Flex' },
                                { value: 'Vinyl', label: 'Vinyl' },
                                { value: 'Canvas', label: 'Canvas' },
                                { value: 'Other', label: 'Other' }
                            ]}
                            value={type}
                            onValueChange={setType}
                            placeholder="Select Type"
                            className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Roll Width (Inches) <span className="text-rose-500">*</span></Label>
                            <Input
                                type="number"
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                value={width}
                                onChange={e => setWidth(+e.target.value)}
                                placeholder="e.g. 36, 48, 60"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Roll Length (Meters) <span className="text-rose-500">*</span></Label>
                            <Input
                                type="number"
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                value={length}
                                onChange={e => setLength(+e.target.value)}
                                placeholder="e.g. 50"
                            />
                            <p className="text-[10px] text-slate-400 font-medium">Standard full roll length.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Cost Per Roll (₹) <span className="text-rose-500">*</span></Label>
                            <Input
                                type="number"
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                value={costPerRoll}
                                onChange={e => setCostPerRoll(+e.target.value)}
                            />
                        </div>
                        <div className="p-4 sm:p-5 rounded-md bg-cyan-50/50 border border-cyan-100/50 space-y-1.5">
                            <span className="text-xs font-semibold text-teal-700 tracking-tight">Cost Per Sq. Ft</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-teal-800">₹</span>
                                <Input
                                    readOnly
                                    className="h-8 border-none bg-transparent p-0 text-xl font-bold text-teal-800 focus-visible:ring-0 tabular-nums"
                                    value={costPerSqFt}
                                />
                            </div>
                            <p className="text-[10px] text-teal-600/70 font-medium">Auto-calculated from Roll Cost.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Initial Stock (Total Sq. Ft) <span className="text-rose-500">*</span></Label>
                            <Input
                                type="number"
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                value={initialStock}
                                onChange={e => setInitialStock(+e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400 font-medium">Available area in stock.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Low Stock Alert (Sq. Ft) <span className="text-rose-500">*</span></Label>
                            <Input
                                type="number"
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                value={lowAlert}
                                onChange={e => setLowAlert(+e.target.value)}
                                placeholder="500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="p-4 flex flex-row items-center justify-end gap-3 border-t bg-slate-50/30">
                <Button
                    variant="ghost"
                    className="h-9 px-4 text-sm font-medium text-slate-600 hover:text-slate-800"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    className="h-9 px-6 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                    style={{ background: 'var(--primary)' }}
                    onClick={onClose}
                >
                    {media ? "Update Media" : "Save Media"}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WideFormatMediaStocksPage() {
    const [mediaList] = useState<MediaStock[]>(initialMedia)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMedia, setEditingMedia] = useState<MediaStock | undefined>(undefined)

    const handleAdd = () => {
        setEditingMedia(undefined)
        setIsDialogOpen(true)
    }

    const handleEdit = (m: MediaStock) => {
        setEditingMedia(m)
        setIsDialogOpen(true)
    }

    const columns: ColumnDef<MediaStock>[] = useMemo(() => [
        {
            key: "name",
            label: "Name",
            render: (val) => (
                <div className="flex items-center gap-2 text-left">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center border" style={{ background: 'color-mix(in srgb, var(--primary), white 90%)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }}>
                        <Maximize2 className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="font-bold text-slate-800">{val as string}</span>
                </div>
            )
        },
        {
            key: "type",
            label: "Category",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => (
                <Badge variant="outline" className={`${typeColors[val as string] || "bg-slate-50 text-slate-400"} border-none text-[10px] font-black uppercase tracking-widest px-2.5 h-6`}>
                    {val as string}
                </Badge>
            )
        },
        {
            key: "rollDims",
            label: "Roll Dims (WxL)",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (_, item) => (
                <span className="text-xs font-medium text-slate-500">
                    {item.rollWidth}.00&quot; x {item.rollLength}.00m
                </span>
            )
        },
        {
            key: "costPerSqFt",
            label: "SQ FT Cost",
            render: (val) => (
                <span className="font-bold text-sm text-slate-700">₹{val as number}</span>
            )
        },
        {
            key: "quantitySqFt",
            label: "Stock (Sq Ft)",
            render: (val, item) => {
                const isLow = (val as number) <= item.lowStockAlert
                return (
                    <div className="flex flex-col items-start gap-1">
                        <span className={`text-sm font-black tabular-nums ${isLow ? "text-rose-500" : "text-slate-900"}`}>
                            {(val as number).toLocaleString()}.00
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Alert: {item.lowStockAlert}.00</span>
                    </div>
                )
            }
        },
        {
            key: "status",
            label: "Status",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            render: (val) => (
                <Badge className={`bg-emerald-50 text-emerald-600 border-none text-[10px] font-black uppercase tracking-widest px-2 h-6`}>
                    {val as string}
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: (_, item) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md transition-all shadow-none" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }} title="Edit Media" onClick={() => handleEdit(item as MediaStock)}>
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Delete Media">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ], [])

    return (
        <div className="space-y-6 text-left font-sans bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 pb-2 font-sans italic uppercase">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 text-balance">Media Stocks</h1>
                </div>
                <div className="flex items-center justify-end gap-3 w-full sm:w-auto uppercase italic">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }} onClick={handleAdd}>
                                <Plus className="h-4 w-4" /> <span className="sm:inline">Add New Media</span>
                            </Button>
                        </DialogTrigger>
                        <MediaFormDialog
                            media={editingMedia}
                            onClose={() => setIsDialogOpen(false)}
                        />
                    </Dialog>
                </div>
            </div>

            <DataGrid
                data={mediaList}
                columns={columns}
                enableDateRange={true}
                dateFilterKey="date"
                searchPlaceholder="Search media current page..."
            />
        </div>
    )
}
