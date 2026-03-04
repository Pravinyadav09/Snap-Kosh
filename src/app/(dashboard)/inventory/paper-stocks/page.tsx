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
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialStocks: PaperStock[] = [
    {
        id: "STK-001", name: "Art Card", type: "Glossy", size: "12x30", gsm: 300,
        width: 12, height: 30, quantity: 2769, unitPrice: 16.01, lowStockAlert: 200,
        calcMode: "manual", rimWeight: 0, sheetsPerPacket: 0, pricePerKg: 0
    },
    {
        id: "STK-002", name: "Art Paper", type: "Matte", size: "13x30", gsm: 170,
        width: 13, height: 30, quantity: 1546, unitPrice: 15.08, lowStockAlert: 200,
        calcMode: "manual", rimWeight: 0, sheetsPerPacket: 0, pricePerKg: 0
    },
    {
        id: "STK-003", name: "Chromo Paper", type: "Art Paper", size: "12x36", gsm: 170,
        width: 12, height: 36, quantity: 1580, unitPrice: 7.04, lowStockAlert: 200,
        calcMode: "manual", rimWeight: 0, sheetsPerPacket: 0, pricePerKg: 0
    },
    {
        id: "STK-004", name: "Creamwove", type: "Glossy", size: "25x30", gsm: 80,
        width: 25, height: 30, quantity: 2746, unitPrice: 18.91, lowStockAlert: 500,
        calcMode: "manual", rimWeight: 0, sheetsPerPacket: 0, pricePerKg: 0
    },
    {
        id: "STK-005", name: "Kraft Paper", type: "Texture", size: "18x40", gsm: 130,
        width: 18, height: 40, quantity: 24, unitPrice: 9.52, lowStockAlert: 100,
        calcMode: "manual", rimWeight: 0, sheetsPerPacket: 0, pricePerKg: 0
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
        <DialogContent className="max-w-[800px] w-[95vw] p-0 border-none shadow-xl rounded-md bg-white font-sans sm:max-w-[800px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <DialogTitle className="text-lg font-medium text-slate-700">
                    {stock ? `Edit Details: ${stock.name}` : "New Stock Details"}
                </DialogTitle>
                <DialogDescription className="sr-only">Stock Configuration Form</DialogDescription>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[75vh]">
                {/* 01: Identification */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Identification</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Paper Name <span className="text-rose-500">*</span></Label>
                            <Input
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                value={paperName}
                                onChange={e => setPaperName(e.target.value)}
                                placeholder="e.g. A3 12x18 Art Card"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Type <span className="text-rose-500">*</span></Label>
                            <Select defaultValue={stock?.type || "Glossy"}>
                                <SelectTrigger className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Glossy">Glossy</SelectItem>
                                    <SelectItem value="Matte">Matte</SelectItem>
                                    <SelectItem value="Art Paper">Art Paper</SelectItem>
                                    <SelectItem value="Texture">Texture / Uncoated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* 02: Technical Specs */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Technical Specifications</span>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">GSM <span className="text-rose-500">*</span></Label>
                            <Input
                                type="number"
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                value={gsm}
                                onChange={e => setGsm(+e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Width (Inches)</Label>
                            <Input
                                type="number"
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                value={width}
                                onChange={e => setWidth(+e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Height (Inches)</Label>
                            <Input
                                type="number"
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                value={height}
                                onChange={e => setHeight(+e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 03: Pricing */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pricing & Weight Calculation</span>
                    </div>

                    <div className="space-y-6">
                        <div className="max-w-xs space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Calculation Mode</Label>
                            <Select value={calcMode} onValueChange={(val: "manual" | "weight") => setCalcMode(val)}>
                                <SelectTrigger className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manual Per Sheet</SelectItem>
                                    <SelectItem value="weight">By Weight (Price/Kg)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {calcMode === "weight" && (
                            <div className="grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-500">Rim Weight (Kg)</Label>
                                    <Input
                                        type="number"
                                        className="h-9 border-slate-200 bg-white text-xs font-semibold"
                                        value={rimWeight}
                                        onChange={e => setRimWeight(+e.target.value)}
                                        placeholder="e.g. 15.5"
                                    />
                                    <p className="text-[9px] text-slate-400">Weight of 1 Packet</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-500">Sheets / Packet</Label>
                                    <Input
                                        type="number"
                                        className="h-9 border-slate-200 bg-white text-xs font-semibold"
                                        value={sheetsPerPacket}
                                        onChange={e => setSheetsPerPacket(+e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-500">Price / Kg (₹)</Label>
                                    <Input
                                        type="number"
                                        className="h-9 border-slate-200 bg-white text-xs font-semibold"
                                        value={pricePerKg}
                                        onChange={e => setPricePerKg(+e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-6">
                            <div className="p-5 rounded-md bg-cyan-50/50 border border-cyan-100/50 space-y-1.5">
                                <span className="text-xs font-semibold text-teal-700 tracking-tight">Final Cost Per Sheet (₹) <span className="text-rose-500">*</span></span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-teal-800">₹</span>
                                    <Input
                                        type="number"
                                        readOnly={calcMode === "weight"}
                                        className="h-8 border-none bg-transparent p-0 text-xl font-bold text-teal-800 focus-visible:ring-0 tabular-nums"
                                        value={finalPrice}
                                        onChange={e => setFinalPrice(+e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <Label className="text-xs font-medium text-slate-600">Initial Stock (Sheets)</Label>
                                <Input
                                    type="number"
                                    className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                    defaultValue={stock?.quantity || 0}
                                />
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <Label className="text-xs font-medium text-slate-600">Low Stock Alert</Label>
                                <Input
                                    type="number"
                                    className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                    defaultValue={stock?.lowStockAlert || 100}
                                />
                            </div>
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
                    className="h-9 px-6 bg-[#4C1F7A] hover:bg-[#3d1862] text-white font-medium text-sm shadow-sm transition-all"
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
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <Layers className="h-4 w-4 text-[#4C1F7A]" />
                    </div>
                    <span className="font-bold text-slate-800">{val as string}</span>
                </div>
            )
        },
        {
            key: "type",
            label: "Type",
            render: (val) => (
                <Badge variant="outline" className={`${typeColors[val as string] || "bg-slate-50 text-slate-400"} border-none text-[10px] font-black uppercase tracking-widest px-2.5 h-6`}>
                    {val as string}
                </Badge>
            )
        },
        {
            key: "size",
            label: "Size / GSM",
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
        <div className="space-y-6 text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">Paper Stock</h1>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-sans">Inventory Master • Real-time Stock Control</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold gap-2 hover:bg-slate-50 text-slate-600">
                        <Download className="h-4 w-4 text-slate-400" /> Export
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-8 rounded-xl bg-[#4C1F7A] hover:bg-[#3d1862] font-bold gap-2 shadow-lg transition-all" onClick={handleAdd}>
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
                searchPlaceholder="Search paper by name, size or type..."
            />
        </div>
    )
}
