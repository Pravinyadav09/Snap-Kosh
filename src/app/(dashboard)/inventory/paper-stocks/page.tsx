"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
    Plus, Trash2, Edit,
    Download, Layers,
    Info, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

// ─── Types ──────────────────────────────────────────────────────────────────
type PaperStock = {
    id: string
    name: string
    type: string
    gsm: number
    size: string
    width: number
    height: number
    quantity: number
    unitPrice: number
    lowStockAlert: number
    calcMode: "manual" | "weight"
    rimWeight: number
    sheetsPerPacket: number
    pricePerKg: number
    color: string
    date: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialStocks: PaperStock[] = [
    {
        id: "STK-001", name: "Art Card", type: "Glossy", size: "12x30", gsm: 300,
        width: 12, height: 30, quantity: 2769, unitPrice: 16.01, lowStockAlert: 200,
        calcMode: "manual", rimWeight: 0, sheetsPerPacket: 0, pricePerKg: 0, color: "White", date: "24 Feb, 2026"
    },
    {
        id: "STK-002", name: "Art Paper", type: "Matte", size: "13x30", gsm: 170,
        width: 13, height: 30, quantity: 1546, unitPrice: 15.08, lowStockAlert: 200,
        calcMode: "manual", rimWeight: 0, sheetsPerPacket: 0, pricePerKg: 0, color: "White", date: "25 Feb, 2026"
    },
    {
        id: "STK-003", name: "Chromo Paper", type: "Art Paper", size: "12x36", gsm: 170,
        width: 12, height: 36, quantity: 1580, unitPrice: 7.04, lowStockAlert: 200,
        calcMode: "manual", rimWeight: 0, sheetsPerPacket: 0, pricePerKg: 0, color: "White", date: "26 Feb, 2026"
    },
    {
        id: "STK-004", name: "Creamwove", type: "Glossy", size: "25x30", gsm: 80,
        width: 25, height: 30, quantity: 2746, unitPrice: 18.91, lowStockAlert: 500,
        calcMode: "manual", rimWeight: 0, sheetsPerPacket: 0, pricePerKg: 0, color: "White", date: "27 Feb, 2026"
    },
    {
        id: "STK-005", name: "Kraft Paper", type: "Texture", size: "18x40", gsm: 130,
        width: 18, height: 40, quantity: 24, unitPrice: 9.52, lowStockAlert: 100,
        calcMode: "manual", rimWeight: 0, sheetsPerPacket: 0, pricePerKg: 0, color: "Yellow", date: "28 Feb, 2026"
    },
]

const typeColors: Record<string, string> = {
    "Glossy": "bg-blue-50 text-blue-600 border-blue-100",
    "Matte": "bg-purple-50 text-purple-600 border-purple-100",
    "Art Paper": "bg-amber-50 text-amber-600 border-amber-100",
    "Texture": "bg-stone-50 text-stone-600 border-stone-100",
}

// ─── Stock Form Dialog ───────────────────────────────────────────────────────
function StockFormDialog({
    stock,
    onClose
}: {
    stock?: PaperStock,
    onClose: () => void
}) {
    const [calcMode, setCalcMode] = useState<"manual" | "weight">(stock?.calcMode || "manual")
    const [paperName, setPaperName] = useState(stock?.name || "")
    const [gsm, setGsm] = useState(stock?.gsm || 100)
    const [width, setWidth] = useState(stock?.width || 12)
    const [height, setHeight] = useState(stock?.height || 18)
    const [rimWeight, setRimWeight] = useState(stock?.rimWeight || 0)
    const [sheetsPerPacket, setSheetsPerPacket] = useState(stock?.sheetsPerPacket || 500)
    const [pricePerKg, setPricePerKg] = useState(stock?.pricePerKg || 0)
    const [finalPrice, setFinalPrice] = useState(stock?.unitPrice || 0)

    // Calculate final price automatically if in weight mode
    useEffect(() => {
        if (calcMode === "weight") {
            if (sheetsPerPacket > 0) {
                const calculated = (rimWeight * pricePerKg) / sheetsPerPacket
                setFinalPrice(parseFloat(calculated.toFixed(4)))
            } else {
                setFinalPrice(0)
            }
        }
    }, [calcMode, rimWeight, pricePerKg, sheetsPerPacket])

    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[90vh] flex flex-col uppercase font-sans">
            <DialogHeader className="px-4 sm:px-6 py-4 text-left border-b border-slate-100 bg-white italic font-sans uppercase">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                        <Layers className="h-4 w-4" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">
                            {stock ? `Edit Stock: ${stock.name}` : "New Stock Details"}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Configure paper properties, GSM specs, and inventory tracking.</DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="px-4 sm:px-6 py-6 space-y-6">
                    {/* 01: Identification */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Identification</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Paper Name <span className="text-rose-500">*</span></Label>
                                <Input
                                    className="h-9 border-slate-200 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all rounded-md"
                                    value={paperName}
                                    onChange={e => setPaperName(e.target.value)}
                                    placeholder="e.g. A3 12x18 Art Card"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Type <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'Glossy', label: 'Glossy' },
                                        { value: 'Matte', label: 'Matte' },
                                        { value: 'Art Paper', label: 'Art Paper' },
                                        { value: 'Texture', label: 'Texture / Uncoated' }
                                    ]}
                                    value={stock?.type || "Glossy"}
                                    onValueChange={(val) => console.log(val)}
                                    placeholder="Select Type"
                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Color <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'White', label: 'White' },
                                        { value: 'Yellow', label: 'Yellow' },
                                        { value: 'Pink', label: 'Pink' },
                                        { value: 'Blue', label: 'Blue' },
                                        { value: 'Green', label: 'Green' },
                                        { value: 'Cream', label: 'Cream' },
                                        { value: 'Other', label: 'Other' }
                                    ]}
                                    value={stock?.color || "White"}
                                    onValueChange={(val) => console.log(val)}
                                    placeholder="Select Color"
                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 02: Technical Specs */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical Specifications</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">GSM <span className="text-rose-500">*</span></Label>
                                <Input
                                    type="number"
                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md"
                                    value={gsm}
                                    onChange={e => setGsm(+e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Width (Inches)</Label>
                                <Input
                                    type="number"
                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md"
                                    value={width}
                                    onChange={e => setWidth(+e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Height (Inches)</Label>
                                <Input
                                    type="number"
                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md"
                                    value={height}
                                    onChange={e => setHeight(+e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 03: Pricing */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pricing & Weight Calculation</span>
                        </div>

                        <div className="space-y-6">
                            <div className="max-w-xs space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Calculation Mode</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'manual', label: 'Manual Per Sheet' },
                                        { value: 'weight', label: 'By Weight (Price/Kg)' }
                                    ]}
                                    value={calcMode}
                                    onValueChange={(val: any) => setCalcMode(val)}
                                    placeholder="Select Mode"
                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                />
                            </div>

                            {calcMode === "weight" && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 bg-slate-50/50 p-4 rounded-md border border-slate-100">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Rim Weight (Kg)</Label>
                                        <Input
                                            type="number"
                                            className="h-9 border-slate-200 bg-white text-sm font-semibold rounded-md"
                                            value={rimWeight}
                                            onChange={e => setRimWeight(+e.target.value)}
                                            placeholder="e.g. 15.5"
                                        />
                                        <p className="text-[10px] text-slate-400">Weight of 1 Packet</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Sheets / Packet</Label>
                                        <Input
                                            type="number"
                                            className="h-9 border-slate-200 bg-white text-sm font-semibold rounded-md"
                                            value={sheetsPerPacket}
                                            onChange={e => setSheetsPerPacket(+e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Price / Kg (₹)</Label>
                                        <Input
                                            type="number"
                                            className="h-9 border-slate-200 bg-white text-sm font-semibold rounded-md"
                                            value={pricePerKg}
                                            onChange={e => setPricePerKg(+e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-3 rounded-md bg-emerald-50/50 border border-emerald-100/50 space-y-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Final Cost Per Sheet (₹) <span className="text-rose-500">*</span></span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-bold text-emerald-800">₹</span>
                                        <Input
                                            type="number"
                                            readOnly={calcMode === "weight"}
                                            className="h-7 border-none bg-transparent p-0 text-lg font-bold text-emerald-800 focus-visible:ring-0 tabular-nums shadow-none"
                                            value={finalPrice}
                                            onChange={e => setFinalPrice(+e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    <Label className="text-xs font-medium text-slate-600">Initial Stock (Sheets)</Label>
                                    <Input
                                        type="number"
                                        className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md"
                                        defaultValue={stock?.quantity || 0}
                                    />
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    <Label className="text-xs font-medium text-slate-600">Low Stock Alert</Label>
                                    <Input
                                        type="number"
                                        className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md"
                                        defaultValue={stock?.lowStockAlert || 100}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <Button
                    variant="ghost"
                    className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800"
                    onClick={onClose}
                >
                    Discard Entry
                </Button>
                <Button
                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                    style={{ background: 'var(--primary)' }}
                    onClick={onClose}
                >
                    {stock ? "Update Stock" : "Save Stock"}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaperStocksPage() {
    const [stocks, setStocks] = useState<PaperStock[]>(initialStocks)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingStock, setEditingStock] = useState<PaperStock | undefined>(undefined)

    const handleAdd = () => {
        setEditingStock(undefined)
        setIsDialogOpen(true)
    }

    const handleEdit = (s: PaperStock) => {
        setEditingStock(s)
        setIsDialogOpen(true)
    }

    const columns: ColumnDef<PaperStock>[] = useMemo(() => [
        {
            key: "name",
            label: "Name",
            render: (val, item) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <Layers className="h-4 w-4 text-[#4C1F7A]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 leading-none">{val as string}</span>
                        <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">Color: {item.color}</span>
                    </div>
                </div>
            )
        },
        {
            key: "type",
            label: "Type",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => (
                <Badge variant="outline" className={`${typeColors[val as string] || "bg-slate-50 text-slate-400"} border-none text-[10px] font-black uppercase tracking-widest px-2.5 h-6`}>
                    {val as string}
                </Badge>
            )
        },
        {
            key: "size",
            label: "Size / GSM",
            className: "hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: (_, item) => (
                <span className="text-xs font-medium text-slate-500">
                    {item.size} / <span className="font-bold text-slate-700">{item.gsm} GSM</span>
                </span>
            )
        },
        {
            key: "quantity",
            label: "Quantity",
            render: (val, item) => {
                const isLow = (val as number) <= item.lowStockAlert
                return (
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-black tabular-nums ${isLow ? "text-rose-500" : "text-emerald-600"}`}>
                            {isLow && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                            {(val as number).toLocaleString()}
                        </span>
                        {isLow && <Badge className="bg-rose-50 text-rose-600 border-none text-[9px] font-bold h-5 px-1.5 px-0.5">LOW</Badge>}
                    </div>
                )
            }
        },
        {
            key: "unitPrice",
            label: "Unit Price",
            className: "hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: (val) => (
                <span className="font-bold text-sm text-slate-700">₹{(val as number).toFixed(2)}</span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: (_, item) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-blue-200 bg-white text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-none" title="Edit Stock" onClick={() => handleEdit(item as PaperStock)}>
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Delete Stock">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ], [])

    return (
        <div className="space-y-6 text-left bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 pb-2 italic uppercase">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">Paper Stocks</h1>
                </div>
                <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-md gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }} onClick={handleAdd}>
                                <Plus className="h-4 w-4" /> Add New Stock
                            </Button>
                        </DialogTrigger>
                        <StockFormDialog
                            stock={editingStock}
                            onClose={() => setIsDialogOpen(false)}
                        />
                    </Dialog>
                </div>
            </div>

            <DataGrid
                data={stocks}
                columns={columns}
                enableDateRange={true}
                dateFilterKey="date"
                searchPlaceholder="Search paper by name, size or type..."
            />
        </div>
    )
}
