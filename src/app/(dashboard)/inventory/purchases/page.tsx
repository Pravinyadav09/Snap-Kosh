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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
        <DialogContent className="max-w-[1000px] w-[95vw] p-0 border-none shadow-xl rounded-xl bg-white font-sans overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <DialogTitle className="text-xl font-semibold text-slate-800 font-sans">New Purchase Order</DialogTitle>
                <DialogDescription className="sr-only">Form to create a new material purchase order</DialogDescription>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                {/* Identification & Vendor */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-slate-600 font-sans">Vendor <span className="text-rose-500">*</span></Label>
                            <Select>
                                <SelectTrigger className="h-10 border-slate-200 bg-white font-medium text-slate-800 font-sans rounded-lg">
                                    <SelectValue placeholder="Select Vendor" />
                                </SelectTrigger>
                                <SelectContent className="font-sans">
                                    {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-slate-600 font-sans">Invoice Number</Label>
                            <Input placeholder="INV-0000" className="h-10 border-slate-200 bg-white font-medium text-slate-800 font-sans rounded-lg" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-slate-600 font-sans">Purchase Date <span className="text-rose-500">*</span></Label>
                            <Input type="date" className="h-10 border-slate-200 bg-white font-medium text-slate-800 font-sans rounded-lg" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>
                </div>

                {/* Taxation Configuration */}
                <div className="space-y-4">
                    <div className="flex items-center gap-8 p-4 rounded-lg bg-slate-50 border border-slate-100 font-sans">
                        <div className="flex items-center space-x-3">
                            <Checkbox id="isGst" checked={isGst} onCheckedChange={(v: boolean) => setIsGst(v)} className="h-5 w-5 rounded border-slate-300 transition-all" style={{ '--tw-text-opacity': '1', color: 'var(--primary)' } as React.CSSProperties} />
                            <Label htmlFor="isGst" className="text-sm font-medium text-slate-600 cursor-pointer font-sans">Enable GST Billing</Label>
                        </div>
                        {isGst && (
                            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 transition-all font-sans">
                                <span className="text-xs text-slate-400 font-medium font-sans">Tax Rate</span>
                                <Select defaultValue="18">
                                    <SelectTrigger className="h-9 w-32 rounded-lg bg-white border-slate-200 font-medium text-slate-700 font-sans">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg font-sans">
                                        <SelectItem value="5">5% GST</SelectItem>
                                        <SelectItem value="12">12% GST</SelectItem>
                                        <SelectItem value="18">18% GST</SelectItem>
                                        <SelectItem value="28">28% GST</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Purchase Items */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">Material Items</span>
                        <Button size="sm" variant="outline" className="h-8 gap-1.5 font-medium border-slate-200 rounded-lg px-3 transition-all font-sans" style={{ color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary), white 95%)' }} onClick={addItem}>
                            <PlusCircle className="h-3.5 w-3.5" /> Add Row
                        </Button>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden font-sans">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-b">
                                    <TableHead className="font-semibold text-xs text-slate-500 px-4 h-10 font-sans">Category</TableHead>
                                    <TableHead className="font-semibold text-xs text-slate-500 h-10 font-sans">Description</TableHead>
                                    <TableHead className="font-semibold text-xs text-slate-500 text-center w-[120px] h-10 font-sans">Qty</TableHead>
                                    <TableHead className="font-semibold text-xs text-slate-500 text-center w-[140px] h-10 font-sans">Unit Price (₹)</TableHead>
                                    <TableHead className="font-semibold text-xs text-slate-500 text-right w-[140px] h-10 font-sans">Subtotal</TableHead>
                                    <TableHead className="w-[50px] font-sans h-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, idx) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                        <TableCell className="px-4 py-3 font-sans">
                                            <Select defaultValue={item.type}>
                                                <SelectTrigger className="h-9 border-none shadow-none focus:ring-0 font-medium text-slate-700 bg-transparent p-0 font-sans">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="font-sans">
                                                    {itemTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="font-sans">
                                            <Input placeholder="Item Description" className="h-9 border-none bg-transparent shadow-none font-medium text-slate-800 focus-visible:ring-0 p-0 font-sans" />
                                        </TableCell>
                                        <TableCell className="font-sans">
                                            <Input type="number" className="h-9 text-center border-slate-200 rounded-lg font-medium font-sans" defaultValue={item.quantity} />
                                        </TableCell>
                                        <TableCell className="font-sans">
                                            <Input type="number" className="h-9 text-center border-slate-200 rounded-lg font-bold text-teal-700 bg-cyan-50/30 font-sans" defaultValue={item.unitPrice} />
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-sm text-slate-700 tracking-tight font-sans">
                                            ₹{item.subtotal.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right font-sans">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-sans">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Summary box like Daily Reading Log impressions */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-cyan-50/50 border border-cyan-100/50 font-sans">
                        <span className="text-sm font-medium text-teal-700">Total Purchase Amount:</span>
                        <span className="text-lg font-bold text-teal-800">
                            ₹{totals.total.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            <DialogFooter className="p-4 flex flex-row items-center justify-end gap-3 border-t bg-slate-50/30 font-sans">
                <Button
                    variant="ghost"
                    className="h-9 px-4 text-sm font-medium text-slate-600 hover:text-slate-800 font-sans"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    className="h-9 px-8 text-white font-medium text-sm shadow-sm transition-all font-sans"
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
        <div className="space-y-6 text-left font-sans">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1 text-left">
                <div className="space-y-0.5 text-left">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">Purchase History</h1>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-sans">Procurement Management • Vendor Invoices</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold gap-2 hover:bg-slate-50 text-slate-600 font-sans">
                        <Download className="h-4 w-4 text-slate-400" /> Export List
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-8 rounded-xl font-bold gap-2 shadow-lg transition-all font-sans text-white" style={{ background: 'var(--primary)' }} onClick={() => setIsDialogOpen(true)}>
                                <Plus className="h-4 w-4" /> New Purchase
                            </Button>
                        </DialogTrigger>
                        <PurchaseFormDialog onClose={() => setIsDialogOpen(false)} />
                    </Dialog>
                </div>
            </div>

            <DataGrid
                data={purchases}
                columns={columns}
                searchPlaceholder="Search vendors, invoices or items..."
            />
        </div>
    )
}
