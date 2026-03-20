"use client"

import React, { useState } from "react"
import {
    Plus, Search, Download, ChevronDown,
    Calendar, Receipt, Filter, PlusCircle,
    Printer, FileSpreadsheet, FileText, Settings2,
    Edit, Trash2, RotateCcw, Info, Wallet, CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { toast } from "sonner"

// ─── Types ──────────────────────────────────────────────────────────────────
type Expense = {
    id: string
    date: string
    vendor: string
    title: string
    category: string
    reference: string
    amount: number
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialExpenses: Expense[] = [
    { id: "EXP-001", date: "02 Jan, 2026", vendor: "-", title: "Architecto repellat et ex.", category: "Tea & Pantry", reference: "-", amount: 439.00 },
    { id: "EXP-002", date: "03 Jan, 2026", vendor: "-", title: "Veritatis voluptates doloremque ut laboriosam.", category: "Machine Maintenance", reference: "-", amount: 2882.00 },
    { id: "EXP-003", date: "07 Jan, 2026", vendor: "-", title: "Voluptas molestiae.", category: "Transport", reference: "-", amount: 2670.00 },
]

const categories = ["Electricity", "Internet", "Labor Wages", "Machine Maintenance", "Rent", "Tea & Pantry", "Transport"]

// ─── Add Expense Dialog ──────────────────────────────────────────────────────
function AddExpenseDialog({ onClose }: { onClose: () => void }) {
    const [isGst, setIsGst] = useState(false)

    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[90vh] flex flex-col uppercase font-sans">
            <DialogHeader className="px-4 sm:px-6 py-4 text-left border-b border-slate-100 bg-white italic font-sans uppercase">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                        <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">Record New Expense</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Track new expenditure and GST bills for accurate accounting.</DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="px-4 sm:px-6 py-6 space-y-6">
                    {/* 01: Identification */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expense Details</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Expense Title <span className="text-rose-500">*</span></Label>
                                <Input
                                    placeholder="e.g. Printer Paper Bundle"
                                    className="h-9 border-slate-200 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all rounded-md"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Category <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={categories.map(c => ({ value: c, label: c }))}
                                    placeholder="Select Category"
                                    onValueChange={(val) => console.log(val)}
                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 02: Transaction Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Wallet className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transaction Details</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-md border border-slate-100">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Amount (₹) <span className="text-rose-500">*</span></Label>
                                <Input type="number" step="0.01" className="h-9 border-slate-200 bg-white font-bold text-sm text-emerald-600 rounded-md" placeholder="0.00" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Date <span className="text-rose-500">*</span></Label>
                                <Input type="date" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" defaultValue="2026-02-11" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Payment Method</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'cash', label: 'Cash' },
                                        { value: 'upi', label: 'UPI / Online' },
                                        { value: 'bank', label: 'Bank Transfer' }
                                    ]}
                                    placeholder="Select Method"
                                    onValueChange={(val) => console.log(val)}
                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Reference / Bill Number</Label>
                            <Input placeholder="Enter Reference No." className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                        </div>
                    </div>

                    {/* GST Checkbox */}
                    <div className="p-3 bg-white rounded-md border border-slate-200 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${isGst ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                                <CheckCircle className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Has GST Bill?</p>
                                <p className="text-[10px] text-slate-400 font-medium">For Input Tax Credit calculation</p>
                            </div>
                        </div>
                        <Checkbox checked={isGst} onCheckedChange={(v: boolean) => setIsGst(v)} className="data-[state=checked]:bg-primary" />
                    </div>

                    {/* GST Details - Conditional */}
                    {isGst && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                             <div className="flex items-center gap-2">
                                <Info className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vendor Info</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Vendor</Label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'v1', label: 'Modern Paper Mart' },
                                            { value: 'v2', label: 'Ganesh Machinery' }
                                        ]}
                                        placeholder="Select Vendor"
                                        onValueChange={(val) => console.log(val)}
                                        className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Additional Info</span>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Description / Notes</Label>
                            <Textarea
                                placeholder="Any additional notes..."
                                className="min-h-[80px] border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-600 px-3 py-2 resize-none focus:bg-white transition-all rounded-md"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <Button variant="ghost" className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800" onClick={onClose}>
                    Discard Entry
                </Button>
                <Button
                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                    style={{ background: 'var(--primary)' }}
                    onClick={() => {
                        toast.success("Expense Recorded", { description: "Expenditure has been logged successfully." })
                        onClose()
                    }}
                >
                    Save Expense
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
    const [expenses] = useState<Expense[]>(initialExpenses)

    const columns: ColumnDef<Expense>[] = [
        {
            key: "date",
            label: "Date",
            className: "hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: (val) => <span className="text-xs font-bold text-slate-500">{val}</span>
        },
        {
            key: "vendor",
            label: "Vendor",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            render: (val) => <span className="text-xs font-medium text-slate-400 uppercase">{val}</span>
        },
        {
            key: "title",
            label: "Expense Description",
            render: (val) => <span className="font-bold text-sm text-slate-800">{val}</span>
        },
        {
            key: "category",
            label: "Category",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => (
                <Badge variant="outline" className="text-[10px] font-black uppercase bg-slate-50 border-slate-200 text-slate-500 tracking-wider">
                    {val as string}
                </Badge>
            )
        },
        {
            key: "reference",
            label: "Ref #",
            className: "hidden xl:table-cell",
            headerClassName: "hidden xl:table-cell",
            render: (val) => <span className="text-xs font-mono text-slate-400">{val}</span>
        },
        {
            key: "amount",
            label: "Amount",
            render: (val) => (
                <span className="font-black text-sm text-rose-600 tracking-tight">
                    ₹{val.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: () => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md bg-white transition-all shadow-none" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }} title="Edit Expense">
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Delete Expense">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100 font-sans uppercase">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 font-sans italic">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">Expense Board</h1>
                </div>
                <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-5 rounded-md font-bold gap-2 shadow-sm transition-all text-white text-[10px] uppercase tracking-wider active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                                <Plus className="h-4 w-4" /> <span className="sm:inline">New Expense</span>
                            </Button>
                        </DialogTrigger>
                        <AddExpenseDialog onClose={() => { }} />
                    </Dialog>
                </div>
            </div>



            <DataGrid
                data={expenses}
                columns={columns}
                enableDateRange={true}
                dateFilterKey="date"
                searchPlaceholder="Search descriptions, vendors or categories..."
            />
        </div>
    )
}
