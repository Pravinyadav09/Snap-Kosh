"use client"

import React, { useState, useMemo } from "react"
import {
    Plus, Search, Download, ChevronDown,
    Trash2, Edit, Eye, ArrowLeft, PlusCircle,
    ShoppingCart, Calendar, Receipt, User,
    FileText, CheckCircle, Info, Calculator,
    Plus as PlusIcon,
    History,
    Package
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// ─── Types ──────────────────────────────────────────────────────────────────
type PurchaseItem = {
    id: string
    type: string
    item: string
    quantity: number
    unitPrice: number
    subtotal: number
}

type PurchaseRecord = {
    id: string
    date: string
    vendor: string
    invoiceNo: string
    itemsCount: number
    itemsSummary: string
    amount: number
    tax: number
    total: number
    createdBy: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialPurchases: PurchaseRecord[] = [
    { id: "PUR-001", date: "30 Jan, 2026", vendor: "Harber and Sons", invoiceNo: "INV-046vm", itemsCount: 1, itemsSummary: "92.00 x Ink", amount: 0, tax: 0, total: 0, createdBy: "System Admin" },
    { id: "PUR-002", date: "30 Jan, 2026", vendor: "Kemmer-Collier", invoiceNo: "PUR-20260130-1", itemsCount: 1, itemsSummary: "1894.00 x Paper", amount: 11299.80, tax: 2033.96, total: 13333.76, createdBy: "System Admin" },
    { id: "PUR-003", date: "30 Jan, 2026", vendor: "Kemmer-Collier", invoiceNo: "PUR-20260130-2", itemsCount: 1, itemsSummary: "1489.00 x Paper", amount: 16858.51, tax: 3034.53, total: 19893.04, createdBy: "System Admin" },
]

const vendors = ["Harber and Sons", "Kemmer-Collier", "Modern Paper Mart", "Ganesh Machinery"]
const itemTypes = ["Paper", "Ink", "Media", "Consumables", "Spare Parts"]

// ─── Purchase Form Dialog ──────────────────────────────────────────────────────
function PurchaseFormDialog({ onClose }: { onClose: () => void }) {
    const [isGst, setIsGst] = useState(false)
    const [items, setItems] = useState<PurchaseItem[]>([
        { id: "1", type: "Paper", item: "", quantity: 0, unitPrice: 0, subtotal: 0 }
    ])

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(), type: "Paper", item: "", quantity: 0, unitPrice: 0, subtotal: 0 }])
    }

    const totals = useMemo(() => {
        const amount = items.reduce((acc, curr) => acc + curr.subtotal, 0)
        const tax = isGst ? amount * 0.18 : 0
        return { amount, tax, total: amount + tax }
    }, [items, isGst])

    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[800px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[90vh] flex flex-col font-sans uppercase">
            <DialogHeader className="px-4 sm:px-6 py-4 text-left border-b border-slate-100 bg-white italic">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                        <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">New Purchase Ledger</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Record new material purchases and vendor billing details.</DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="px-4 sm:px-6 py-6 space-y-6">
                    {/* Identification & Vendor */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Details</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Vendor <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={vendors.map(v => ({ value: v, label: v }))}
                                    placeholder="Select Vendor"
                                    onValueChange={(val) => console.log(val)}
                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Invoice Number</Label>
                                <Input placeholder="INV-0000" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Purchase Date <span className="text-rose-500">*</span></Label>
                                <Input type="date" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>
                    </div>

                    {/* Taxation Configuration */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 p-3 rounded-md bg-slate-50 border border-slate-100">
                            <div className="flex items-center space-x-3">
                                <Checkbox id="isGst" checked={isGst} onCheckedChange={(v: boolean) => setIsGst(v)} className="h-4 w-4 rounded border-slate-300 transition-all data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                <Label htmlFor="isGst" className="text-xs font-bold text-slate-600 cursor-pointer uppercase tracking-wider">Enable GST Billing</Label>
                            </div>
                            {isGst && (
                                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 transition-all">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tax Rate</span>
                                    <SearchableSelect
                                        options={[
                                            { value: '5', label: '5% GST' },
                                            { value: '12', label: '12% GST' },
                                            { value: '18', label: '18% GST' },
                                            { value: '28', label: '28% GST' }
                                        ]}
                                        value="18"
                                        onValueChange={(val) => console.log(val)}
                                        placeholder="Tax Rate"
                                        className="h-8 w-28 rounded-md bg-white border-slate-200 font-medium text-xs shadow-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Purchase Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Material Items</span>
                            </div>
                            <Button size="sm" variant="outline" className="h-7 gap-1.5 font-bold text-[10px] border-slate-200 rounded-md px-3 transition-all uppercase tracking-wider" style={{ color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary), white 95%)' }} onClick={addItem}>
                                <PlusCircle className="h-3 w-3" /> Add Row
                            </Button>
                        </div>

                        <div className="border border-slate-200 rounded-md overflow-x-auto scrollbar-thin shadow-sm">
                            <div className="min-w-[700px]">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-b border-slate-100 hover:bg-transparent">
                                            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 px-3 h-8">Category</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 h-8">Description</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 text-center w-[100px] h-8">Qty</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 text-center w-[120px] h-8">Unit Price (₹)</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 text-right w-[120px] h-8 px-3">Subtotal</TableHead>
                                            <TableHead className="w-[40px] h-8"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, idx) => (
                                            <TableRow key={item.id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-100 last:border-0">
                                                <TableCell className="p-2">
                                                    <SearchableSelect
                                                        options={itemTypes.map(t => ({ value: t, label: t }))}
                                                        value={item.type}
                                                        onValueChange={(val) => console.log(val)}
                                                        placeholder="Category"
                                                        className="h-8 border-slate-200 shadow-none font-medium text-xs rounded-md bg-white"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Input placeholder="Item Description" className="h-8 border-slate-200 shadow-none font-medium text-xs focus-visible:ring-1 focus-visible:ring-slate-300 px-2 rounded-md bg-white" />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Input type="number" className="h-8 text-center border-slate-200 rounded-md font-medium text-xs focus-visible:ring-1 focus-visible:ring-slate-300 shadow-none bg-white" defaultValue={item.quantity} />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Input type="number" className="h-8 text-center border-slate-200 rounded-md font-bold text-teal-700 bg-emerald-50/50 text-xs focus-visible:ring-1 focus-visible:ring-slate-300 shadow-none" defaultValue={item.unitPrice} />
                                                </TableCell>
                                                <TableCell className="p-2 text-right font-bold text-xs text-slate-800 tracking-tight pr-3">
                                                    ₹{item.subtotal.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="p-2 text-right">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Summary box */}
                        <div className="flex items-center justify-between p-3 rounded-md bg-emerald-50/50 border border-emerald-100/50">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Total Purchase Amount:</span>
                            <span className="text-base font-bold text-emerald-800 tracking-tight">
                                ₹{totals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
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
                    Save Purchase
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PurchaseInventoryPage() {
    const [purchases] = useState<PurchaseRecord[]>(initialPurchases)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const columns: ColumnDef<PurchaseRecord>[] = useMemo(() => [
        {
            key: "date",
            label: "Date",
            render: (val) => <span className="text-[10px] font-black uppercase text-slate-400 font-sans">{val as string}</span>
        },
        {
            key: "vendor",
            label: "Vendor",
            render: (val) => (
                <div className="flex items-center gap-2 text-left font-sans">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        <ShoppingCart className="h-4 w-4 text-slate-400" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm font-sans">{val as string}</span>
                </div>
            )
        },
        {
            key: "invoiceNo",
            label: "Invoice #",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => <span className="text-xs font-black text-slate-500 font-mono tracking-tight font-sans">{val as string}</span>
        },
        {
            key: "itemsSummary",
            label: "Items Summary",
            render: (val, item) => (
                <div className="flex flex-col items-start font-sans">
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 text-[9px] font-black px-2 h-5 uppercase font-sans">
                        {item.itemsCount} Items
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-medium italic mt-0.5 font-sans">{val as string}</span>
                </div>
            )
        },
        {
            key: "total",
            label: "Total Amount",
            render: (val) => (
                <span className="font-black text-sm text-slate-900 tracking-tighter font-sans">
                    ₹{(val as number).toLocaleString()}
                </span>
            )
        },
        {
            key: "createdBy",
            label: "Audit",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            render: (val) => (
                <div className="flex items-center gap-2 font-sans">
                    <div className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-sans">{val as string}</span>
                </div>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: () => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md transition-all shadow-none" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }} title="View Details">
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Delete Entry">
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
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 text-balance">Purchase Ledger</h1>
                </div>
                <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }} onClick={() => setIsDialogOpen(true)}>
                                <Plus className="h-4 w-4" /> <span className="sm:inline">New Purchase</span>
                            </Button>
                        </DialogTrigger>
                        <PurchaseFormDialog onClose={() => setIsDialogOpen(false)} />
                    </Dialog>
                </div>
            </div>

            <DataGrid
                data={purchases}
                columns={columns}
                enableDateRange={true}
                dateFilterKey="date"
                searchPlaceholder="Search vendors, invoices or items..."
            />
        </div>
    )
}
