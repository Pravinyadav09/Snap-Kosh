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
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
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
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl flex flex-col max-h-[92vh]">
            <DialogHeader className="px-10 pt-10 pb-6 text-left border-b bg-white">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-2xl shadow-sm border border-slate-100 transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 95%)', color: 'var(--primary)' }}>
                        <Receipt className="h-5 w-5" />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-800 font-heading">Record Expense</DialogTitle>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-1">
                    Track new expenditure and GST bills for accounting
                </p>
            </DialogHeader>
            <div className="px-10 py-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar bg-white">
                {/* 01: Identification */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white" style={{ background: 'var(--primary)' }}>01</span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expense Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Expense Title <span className="text-rose-500">*</span></Label>
                            <Input
                                className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold text-slate-700 px-4 transition-all"
                                placeholder="e.g. Printer Paper Bundle"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Category <span className="text-rose-500">*</span></Label>
                            <Select>
                                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-white font-medium text-slate-600 px-4">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* 02: Transaction Details */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white" style={{ background: 'var(--primary)' }}>02</span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transaction Details</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Amount (₹) <span className="text-rose-500">*</span></Label>
                            <Input type="number" step="0.01" className="h-12 rounded-xl border-none bg-emerald-50 font-black text-emerald-700 px-4 shadow-sm" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Date <span className="text-rose-500">*</span></Label>
                            <Input type="date" className="h-12 rounded-xl border-slate-100 bg-white font-medium text-slate-600 px-4" defaultValue="2026-02-11" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Payment Method</Label>
                            <Select>
                                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-white font-medium text-slate-600 px-4">
                                    <SelectValue placeholder="Select Method" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="upi">UPI / Online</SelectItem>
                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Reference / Bill Number</Label>
                    <Input placeholder="Enter Reference No." className="h-12 rounded-xl border-slate-100 bg-white font-medium text-slate-600 px-4" />
                </div>

                {/* GST Checkbox */}
                <div className="flex items-center space-x-3 p-5 rounded-2xl border border-slate-100 transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 97%)' }}>
                    <Checkbox id="gst" checked={isGst} onCheckedChange={(v: boolean) => setIsGst(v)} className="h-5 w-5 rounded-md transition-all" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' } as any} />
                    <label htmlFor="gst" className="text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer">
                        Is GST Bill? (For Input Tax Credit)
                    </label>
                </div>

                {/* GST Details - Conditional */}
                {isGst && (
                    <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 border-b pb-2">
                            <Info className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Identify Vendor</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Vendor</Label>
                                <Select>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-white font-medium text-slate-600 px-4">
                                        <SelectValue placeholder="Select Vendor" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="v1">Modern Paper Mart</SelectItem>
                                        <SelectItem value="v2">Ganesh Machinery</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white" style={{ background: 'var(--primary)' }}>03</span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Additional Info</h3>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Description / Notes</Label>
                        <Textarea
                            placeholder="Any additional notes..."
                            className="min-h-[100px] rounded-xl border-slate-100 bg-white font-medium text-slate-600 p-4 resize-none focus-visible:ring-indigo-500/20"
                        />
                    </div>
                </div>
            </div>

            <DialogFooter className="p-8 mt-2 flex flex-row items-center justify-end gap-3 px-10 border-t bg-slate-50/50">
                <Button variant="ghost" className="h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    className="h-11 px-8 rounded-xl font-bold text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all text-white"
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
            render: (val) => <span className="text-xs font-bold text-slate-500">{val}</span>
        },
        {
            key: "vendor",
            label: "Vendor",
            render: (val) => <span className="text-xs font-medium text-slate-400">{val}</span>
        },
        {
            key: "title",
            label: "Expense Description",
            render: (val) => <span className="font-bold text-sm text-slate-800">{val}</span>
        },
        {
            key: "category",
            label: "Category",
            render: (val) => (
                <Badge variant="outline" className="text-[10px] font-black uppercase bg-slate-50 border-slate-200 text-slate-500 tracking-wider">
                    {val}
                </Badge>
            )
        },
        {
            key: "reference",
            label: "Ref #",
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 font-heading">Expenses</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Track and manage business expenditures</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold gap-2 hover:bg-slate-50">
                        <Download className="h-4 w-4 text-slate-400" /> Export List
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-indigo-100 transition-all text-white" style={{ background: 'var(--primary)' }}>
                                <Plus className="h-4 w-4" /> New Expense
                            </Button>
                        </DialogTrigger>
                        <AddExpenseDialog onClose={() => { }} />
                    </Dialog>
                </div>
            </div>

            {/* Statistics Bar - Premium look */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm rounded-2xl" style={{ background: 'color-mix(in srgb, var(--primary), white 95%)' }}>
                    <CardContent className="p-4 flex flex-row items-center gap-4">
                        <div className="p-3 rounded-xl bg-white shadow-sm" style={{ color: 'var(--primary)' }}>
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Today's Spend</p>
                            <p className="text-xl font-black text-slate-900 font-heading">₹2,450.00</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-emerald-50/30 rounded-2xl">
                    <CardContent className="p-4 flex flex-row items-center gap-4">
                        <div className="p-3 rounded-xl bg-white text-emerald-600 shadow-sm">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">GST Recoverable</p>
                            <p className="text-xl font-black text-slate-900 font-heading">₹12,840.00</p>
                        </div>
                    </CardContent>
                </Card>
                {/* Add more stats if needed */}
            </div>

            <DataGrid
                data={expenses}
                columns={columns}
                searchPlaceholder="Search descriptions, vendors or categories..."
            />
        </div>
    )
}
