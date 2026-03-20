"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
    Search, Plus, Eye, Copy, Download, Mail, Printer,
    Edit, ChevronDown, Filter, X, CheckCircle, FileText,
    BadgeIndianRupee, CreditCard, MoreHorizontal, ShieldCheck, Calculator
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { SearchableSelect } from "@/components/shared/searchable-select"

// Generic Components
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { CostEstimator } from "@/components/shared/cost-estimator"
import { PageActionButtons } from "@/components/shared/page-action-buttons"

// ─── Types ────────────────────────────────────────────────────────────────────
type LineItem = { id: number; desc: string; qty: number; rate: number }
type Invoice = {
    id: string
    date: string
    dueDate: string
    customer: string
    jobRef: string
    amount: number
    tax: number
    status: "paid" | "unpaid" | "partial"
    items: LineItem[]
    notes: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialInvoices: Invoice[] = [
    { id: "INV-02176", date: "05 Jan, 2026", dueDate: "12 Jan", customer: "Crona Group", jobRef: "JOB-88403", amount: 4329.86, tax: 463.91, status: "paid", items: [{ id: 1, desc: "Print Job", qty: 500, rate: 7.2 }], notes: "Payment due within 30 days." },
    { id: "INV-03637", date: "02 Jan, 2026", dueDate: "09 Jan", customer: "Farrell, Klocko and Oberbrunner", jobRef: "JOB-83719", amount: 6529.23, tax: 699.56, status: "unpaid", items: [{ id: 1, desc: "Brochure Print", qty: 1000, rate: 5.83 }], notes: "Payment due within 30 days." },
    { id: "INV-18270", date: "03 Jan, 2026", dueDate: "10 Jan", customer: "Hyatt-Kutch", jobRef: "JOB-83077", amount: 10082.63, tax: 1538.03, status: "unpaid", items: [{ id: 1, desc: "Book Printing", qty: 100, rate: 84.02 }], notes: "Bank: Oriental Bank." },
    { id: "INV-2026-0029", date: "11 Feb, 2026", dueDate: "13 Mar", customer: "Denesik-Keeling", jobRef: "JB-2026-0034", amount: 49948.22, tax: 7619.22, status: "unpaid", items: [{ id: 1, desc: "Print Job", qty: 1000, rate: 6.89 }, { id: 2, desc: "Book Printing", qty: 100, rate: 354.39 }], notes: "Payment due within 30 days. Bank: Oriental Bank Of Commerce, Acc: 10012151004216, IFSC: ORBC100121" },
    { id: "INV-25755", date: "03 Jan, 2026", dueDate: "10 Jan", customer: "Schuster Ltd", jobRef: "JOB-54761", amount: 8342.20, tax: 893.81, status: "unpaid", items: [{ id: 1, desc: "Wide Format", qty: 5, rate: 1289.68 }], notes: "" },
    { id: "INV-33356", date: "08 Jan, 2026", dueDate: "15 Jan", customer: "Barton, Willow and Rose", jobRef: "JOB-83281", amount: 5100.34, tax: 513.20, status: "partial", items: [{ id: 1, desc: "Business Cards", qty: 500, rate: 8.37 }], notes: "" },
]

// ─── Create Invoice Dialog (Complex Form - Keep for now) ────────────────────────────────────────────────────
function CreateInvoiceDialog({ onClose }: { onClose: () => void }) {
    const [items, setItems] = useState<LineItem[]>([
        { id: 1, desc: "Print Job", qty: 1000, rate: 6.89 },
        { id: 2, desc: "Book Printing", qty: 100, rate: 354.39 },
    ])
    const [taxRate, setTaxRate] = useState(18)
    const [notes, setNotes] = useState("Payment due within 30 days. Bank: Oriental Bank Of Commerce, Acc: 10012151004216, IFSC: ORBC100121")

    const addItem = () => setItems(prev => [...prev, { id: Date.now(), desc: "", qty: 1, rate: 0 }])
    const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id))
    const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0)
    const taxAmt = subtotal * (taxRate / 100)
    const grandTotal = subtotal + taxAmt

    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[1100px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-lg bg-white max-h-[90vh] flex flex-col uppercase font-sans">
            <DialogHeader className="px-4 sm:px-6 py-4 text-left border-b border-slate-100 bg-white italic font-sans uppercase">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">Generate Sales Invoice</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Create a new GST-compliant invoice and update ledger balance.</DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            <div className="w-full overflow-y-auto max-h-[75vh] custom-scrollbar-enhanced bg-slate-50/30 font-sans px-6 py-6 space-y-6">
                {/* 01: Meta Details */}
                <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Details</h3>
                        <Badge variant="outline" className="text-[9px] font-bold text-slate-400 border-slate-100">Draft Status</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Invoice No.</Label>
                            <Input defaultValue="INV-2026-0030" className="h-8 rounded-md border-slate-200 bg-slate-50 font-black text-xs text-slate-400" readOnly />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Customer <span className="text-rose-500">*</span></Label>
                            <SearchableSelect
                                options={[
                                    { value: 'dk', label: 'Denesik-Keeling' },
                                    { value: 'cg', label: 'Crona Group' }
                                ]}
                                value="dk"
                                onValueChange={(val) => console.log(val)}
                                placeholder="Select Customer"
                                className="h-8 rounded-md border-slate-200 bg-white text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Issue Date</Label>
                            <Input type="date" className="h-8 rounded-md border-slate-200 bg-white text-xs font-bold" defaultValue="2026-02-11" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Due Date</Label>
                            <Input type="date" className="h-8 rounded-md border-slate-200 bg-white text-xs font-bold" defaultValue="2026-03-13" />
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Line Items</h3>
                        <Button variant="outline" size="sm" className="h-8 transition-all text-[11px] font-bold px-3" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }} onClick={addItem}>
                            <Plus className="h-3 w-3 mr-1" /> Add New Row
                        </Button>
                    </div>

                    <div className="p-0 overflow-x-auto scrollbar-thin">
                        <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[50%]">Item Description</th>
                                    <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[15%] text-center">Qty</th>
                                    <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[15%] text-right">Rate (₹)</th>
                                    <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[15%] text-right">Amount (₹)</th>
                                    <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[5%] text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-3 py-2">
                                            <div className="relative group">
                                                <Input
                                                    placeholder="Item name / Job reference"
                                                    className="h-8 rounded-md border-slate-200 bg-white font-bold text-xs pr-10"
                                                    style={{ '--ring': 'var(--primary)' } as any}
                                                    value={item.desc}
                                                    onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, desc: e.target.value } : i))}
                                                />
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-1 top-1 h-7 w-7 bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-90 border"
                                                            style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }}
                                                        >
                                                            <Calculator className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[1200px] md:w-[1200px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-md bg-white">
                                                        <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-1.5 rounded-md border" style={{ background: 'color-mix(in srgb, var(--primary), white 90%)', color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }}>
                                                                    <Calculator className="h-4 w-4" />
                                                                </div>
                                                                <DialogTitle className="text-sm font-semibold tracking-tight text-slate-800">Cost Estimator & Specs Generator</DialogTitle>
                                                            </div>
                                                        </DialogHeader>
                                                        <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
                                                            <CostEstimator />
                                                        </div>
                                                        <DialogFooter className="p-4 flex flex-row items-center justify-end gap-2 px-6 border-t border-slate-100 bg-slate-50/50">
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" className="h-8 px-4 rounded-md text-xs font-medium text-slate-500 border-slate-200 bg-white">
                                                                    Cancel
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogTrigger asChild>
                                                                <Button className="h-8 px-5 rounded-md font-semibold text-xs text-white shadow-sm transition-all" style={{ background: 'var(--primary)' }}>
                                                                    Apply to Item
                                                                </Button>
                                                            </DialogTrigger>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <Input
                                                type="number"
                                                className="h-8 rounded-md border-slate-200 bg-white text-center font-black text-xs"
                                                value={item.qty}
                                                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: +e.target.value } : i))}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="h-8 rounded-md border-slate-200 bg-white text-right font-black text-xs"
                                                value={item.rate}
                                                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, rate: +e.target.value } : i))}
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <div className="h-8 flex items-center justify-end font-black text-slate-900 tabular-nums text-xs">
                                                ₹{(item.qty * item.rate).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-300 hover:text-rose-500 transition-colors" onClick={() => removeItem(item.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Calculation & Finalization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Payment Terms & Notes</Label>
                        <Textarea
                            placeholder="Add bank details, UPI ID, or special terms..."
                            className="h-24 rounded-md border-slate-200 bg-white p-2.5 font-medium text-xs text-slate-600 outline-none transition-all resize-none shadow-sm"
                            style={{ '--ring': 'var(--primary)' } as any}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>
                    <div className="bg-white rounded-xl p-6 text-slate-900 space-y-5 shadow-sm border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 relative z-10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subtotal</span>
                            <span className="font-bold text-base tabular-nums text-slate-800">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <span>Applied GST</span>
                                <SearchableSelect
                                    options={[
                                        { value: '18', label: '18% GST' },
                                        { value: '12', label: '12% GST' },
                                        { value: '5', label: '5% GST' }
                                    ]}
                                    value={String(taxRate)}
                                    onValueChange={v => setTaxRate(+v)}
                                    placeholder="Select tax"
                                    className="h-7 w-24 bg-slate-50 border-slate-200 text-slate-800 font-bold text-[10px] rounded-md hover:bg-slate-100 transition-colors"
                                />
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">GST Amount ({taxRate}%)</span>
                                <span className="font-bold text-emerald-600">+ ₹{taxAmt.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Total Payable</p>
                                <p className="text-3xl font-black tracking-tighter tabular-nums text-slate-900">
                                    ₹{grandTotal.toLocaleString()}
                                </p>
                            </div>
                            <ShieldCheck className="h-8 w-8 text-slate-100" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex flex-row items-center justify-end gap-2 px-6 shrink-0">
                <Button variant="ghost" className="h-9 px-5 text-xs font-medium text-slate-500" onClick={onClose}>
                    Discard Invoice
                </Button>
                <Button
                    className="h-9 px-8 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-2"
                    style={{ background: 'var(--primary)' }}
                    onClick={() => {
                        toast.success("Invoice Generated", {
                            description: "INV-2026-0030 is ready to download.",
                            icon: <CheckCircle className="h-4 w-4 text-emerald-500" />
                        })
                        onClose()
                    }}
                >
                    <FileText className="h-4 w-4" /> Save & Authorize
                </Button>
            </div>
        </DialogContent>
    )
}

// ─── Invoice View (Full Document + Actions) ───────────────────────────────────
function InvoiceView({ inv, onBack, onPayment }: { inv: Invoice; onBack: () => void; onPayment: (inv: Invoice) => void }) {
    const subtotal = inv.items.reduce((s, i) => s + i.qty * i.rate, 0)
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans italic uppercase">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Invoice Review</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <Button className="h-8 sm:h-9 px-3 sm:px-4 gap-1.5 text-[9px] sm:text-xs font-black bg-rose-600 hover:bg-rose-700 shadow-sm rounded-md active:scale-95 uppercase tracking-widest text-white" onClick={() => toast.success("Preparing Download", { description: "Your PDF invoice is being generated." })}>
                        <Download className="h-3.5 w-3.5" /> <span className="hidden xs:inline">PDF</span>
                    </Button>
                    <Button className="h-8 sm:h-9 px-3 sm:px-4 gap-1.5 text-[9px] sm:text-xs font-black bg-amber-500 hover:bg-amber-600 shadow-sm rounded-md active:scale-95 uppercase tracking-widest text-white" onClick={() => toast.info("Email Sending", { description: "Attempting to send invoice via email..." })}>
                        <Mail className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Email</span>
                    </Button>
                    <Button className="h-8 sm:h-9 px-3 sm:px-4 gap-1.5 text-[9px] sm:text-xs font-black text-white shadow-sm rounded-md active:scale-95 uppercase tracking-widest" style={{ background: 'var(--primary)' }} onClick={() => toast.info("Opening Print Dialog")}>
                        <Printer className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Print</span>
                    </Button>
                    <Button variant="outline" className="h-8 sm:h-9 px-3 sm:px-4 font-black text-[9px] sm:text-xs rounded-md uppercase tracking-widest border-slate-200" onClick={onBack}>Back</Button>
                </div>
            </div>

            {/* Invoice Document */}
            <div className="border border-slate-100 rounded-xl shadow-sm overflow-hidden bg-white p-5 space-y-4">
                {/* Top row */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: 'var(--primary)' }}>
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-base font-black tracking-tighter text-slate-900 uppercase">Ganesha Prints</h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Premium Commercial Print Service</p>
                        </div>
                    </div>
                    <div className="text-left sm:text-right space-y-1 w-full sm:w-auto">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-100 uppercase leading-none">INVOICE</h2>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 justify-start sm:justify-end">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] uppercase px-3 h-5 border shadow-none">
                                    {inv.status.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 text-left sm:text-right">
                                <div className="text-slate-400 font-black text-[9px] uppercase tracking-widest space-y-0.5">
                                    <div>Inv No:</div><div>Issue Date:</div><div>Due Date:</div><div>Reference:</div>
                                </div>
                                <div className="font-bold text-[10px] text-slate-800 space-y-0.5">
                                    <div>{inv.id}</div> <div>{inv.date}</div> <div>{inv.dueDate}</div> <div className="text-primary">{inv.jobRef}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill From / Bill To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Bill From</p>
                        <div className="space-y-0.5">
                            <p className="font-black text-sm text-slate-900">Ganesha Softwares</p>
                            <p className="text-xs text-slate-500">SF-37, Gaur City Center,</p>
                            <p className="text-xs text-slate-500">Greater Noida Extention, UP</p>
                            <p className="text-[10px] font-black mt-2 text-slate-800">GSTIN: <span className="text-blue-600">27ABCDE1234F2Z5</span></p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Bill To</p>
                        <div className="space-y-0.5">
                            <p className="font-black text-sm text-slate-900">{inv.customer}</p>
                            <p className="text-xs text-slate-500 leading-tight">202 Lebsack Station Suite 446</p>
                            <p className="text-xs text-slate-500 leading-tight">East Cordie, Michigan – 38083</p>
                            <p className="text-[10px] font-black mt-2 text-slate-800">GSTIN: <span className="text-primary italic">GSTINMDTVA89SVE</span></p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="rounded-lg border border-slate-100 overflow-x-auto scrollbar-thin shadow-sm bg-slate-50/30">
                    <table className="w-full text-xs min-w-[600px]">
                        <thead className="bg-slate-100/50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-4 py-2 font-black text-[9px] uppercase tracking-widest text-slate-400 w-10">#</th>
                                <th className="text-left px-4 py-2 font-black text-[9px] uppercase tracking-widest text-slate-400">Description</th>
                                <th className="text-right px-4 py-2 font-black text-[9px] uppercase tracking-widest text-slate-400 w-20">Qty</th>
                                <th className="text-right px-4 py-2 font-black text-[9px] uppercase tracking-widest text-slate-400 w-28">Rate (₹)</th>
                                <th className="text-right px-4 py-2 font-black text-[9px] uppercase tracking-widest text-slate-400 w-28">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {inv.items.map((item, idx) => (
                                <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-2 text-slate-300 font-bold">{String(idx + 1).padStart(2, '0')}</td>
                                    <td className="px-4 py-2 font-bold text-slate-800">{item.desc}</td>
                                    <td className="px-4 py-2 text-right font-medium">{item.qty}</td>
                                    <td className="px-4 py-2 text-right font-medium">₹{item.rate.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right font-black text-slate-900">₹{(item.qty * item.rate).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Final Calculations */}
                <div className="flex justify-end">
                    <div className="w-full sm:w-64 space-y-1.5 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                            <span>Subtotal</span>
                            <span className="text-slate-700">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                            <span>Tax (GST 18%)</span>
                            <span className="text-slate-700">₹{inv.tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center">
                            <span className="font-black text-[9px] uppercase tracking-widest text-slate-900">Grand Total</span>
                            <span className="font-black text-lg text-primary tracking-tight">₹{inv.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {inv.notes && (
                    <div className="bg-slate-50/50 rounded-lg p-4 border-l-4 border-blue-500 border shadow-sm">
                        <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest mb-1.5">Internal Notes / Bank Details</p>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{inv.notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}


// ─── Record Payment View ──────────────────────────────────────────────────────
function RecordPaymentView({ inv, onBack }: { inv: Invoice; onBack: () => void }) {
    return (
        <div className="space-y-4 font-sans max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-2 font-sans italic uppercase">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Record Payment</h1>
                <Button variant="ghost" size="sm" className="font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors w-full sm:w-auto" onClick={onBack}>
                    Return to Ledger
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Summary Bar */}
                <div className="px-5 py-3 flex items-center justify-between bg-white border-b border-slate-100">
                    <div className="space-y-0.5">
                        <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Client Source</p>
                        <p className="font-bold text-slate-800 text-sm tracking-tight">{inv.customer}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance Due</p>
                        <p className="font-black text-xl text-emerald-600 tracking-tighter tabular-nums">₹{inv.amount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Receipt No.</Label>
                            <Input defaultValue="REC-2026-0016" className="h-9 border-slate-200 bg-slate-50 text-sm font-bold rounded-md" readOnly />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Payment Date</Label>
                            <Input type="date" className="h-9 border-slate-200 font-bold text-sm rounded-md" defaultValue="2026-02-25" />
                        </div>
                    </div>

                    <div className="space-y-1.5 bg-amber-50/30 px-4 py-3 rounded-md border border-amber-100">
                        <Label className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Amount Received (INR)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-600">₹</span>
                            <Input
                                type="number"
                                defaultValue={inv.amount.toFixed(2)}
                                className="h-9 pl-7 text-sm font-bold border-amber-200 focus:border-amber-400 bg-white rounded-md"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Payment Mode</Label>
                            <SearchableSelect
                                options={[
                                    { value: 'upi', label: 'UPI / G-Pay / PhonePe' },
                                    { value: 'neft', label: 'NEFT / RTGS / Bank' },
                                    { value: 'cash', label: 'Cash Payment' },
                                    { value: 'cheque', label: 'Cheque Deposit' }
                                ]}
                                value="upi"
                                onValueChange={(val) => console.log(val)}
                                placeholder="Select Payment Mode"
                                className="h-9 border-slate-200 text-sm font-medium rounded-md"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Reference / UTR / Chq No.</Label>
                            <Input className="h-9 border-slate-200 font-medium text-sm rounded-md" placeholder="e.g. UTR12345678" />
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <Button variant="ghost" size="sm" className="h-9 px-5 text-xs font-medium text-slate-400 rounded-md" onClick={onBack}>Discard Entry</Button>
                        <Button className="h-9 px-6 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Finalize Payment
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
    const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
    const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
    const [showCreate, setShowCreate] = useState(false)

    const statusStyle: Record<string, string> = {
        paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
        unpaid: "bg-rose-50 text-rose-700 border-rose-200",
        partial: "bg-amber-50 text-amber-700 border-amber-200",
    }

    const columns: ColumnDef<Invoice>[] = [
        {
            key: "id",
            label: "Invoice No.",
            className: "hidden md:table-cell",
            headerClassName: "w-[120px] hidden md:table-cell",
            render: (val, inv) => (
                <span
                    className="text-slate-900 font-sans text-xs hover:underline cursor-pointer font-bold tracking-tight"
                    onClick={() => setViewInvoice(inv)}
                >
                    {val}
                </span>
            )
        },
        {
            key: "date",
            label: "Dates",
            type: "date",
            className: "hidden lg:table-cell",
            headerClassName: "w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell",
            render: (val, inv) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-slate-900 font-sans text-xs font-bold italic">#{val}</span>
                    <span className="text-[10px] text-slate-400 font-sans font-bold">{inv.date}</span>
                </div>
            )
        },
        { 
            key: "customer", 
            label: "Customer Info", 
            className: "text-xs font-sans text-slate-700 font-bold tracking-tight", 
            headerClassName: "text-[10px] font-bold uppercase tracking-wider text-slate-400" 
        },
        {
            key: "amount",
            label: "Total Amount",
            headerClassName: "text-right w-[150px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            className: "text-right tabular-nums font-sans text-slate-900 text-xs",
            render: (val) => `₹${val.toLocaleString()}`
        },
        {
            key: "status",
            label: "Status",
            headerClassName: "w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            render: (val) => {
                const status = String(val).toLowerCase();
                let statusClass = "bg-slate-100 text-slate-600 border-slate-200";
                
                if (status === "paid") statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
                else if (status === "unpaid") statusClass = "bg-rose-100 text-rose-700 border-rose-200";
                else if (status === "partial") statusClass = "bg-amber-100 text-amber-700 border-amber-200";

                return (
                    <Badge className={`${statusClass} text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border shadow-none`} variant="outline">
                        {val}
                    </Badge>
                )
            }
        },
        {
            key: "actions",
            label: "Actions",
            filterable: false,
            headerClassName: "text-right w-[180px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            className: "text-right px-4",
            render: (_, item) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-sans text-xs rounded-md px-2.5 transition-all" onClick={() => setViewInvoice(item)}>
                        <Eye className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> View
                    </Button>
                    <Button
                        size="sm"
                        className="h-7 font-sans text-xs rounded-md px-2.5 transition-all text-white"
                        style={{ background: 'var(--primary)' }}
                        onClick={() => setPaymentInvoice(item)}
                    >
                        <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Pay
                    </Button>
                </div>
            )
        }
    ]

    if (paymentInvoice) {
        return <RecordPaymentView inv={paymentInvoice} onBack={() => setPaymentInvoice(null)} />
    }
    if (viewInvoice) {
        return <InvoiceView inv={viewInvoice} onBack={() => setViewInvoice(null)} onPayment={inv => { setViewInvoice(null); setPaymentInvoice(inv) }} />
    }

    return (
        <div className="space-y-6 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 pb-4 font-sans italic uppercase">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">Sales Ledger</h1>
                </div>

                <PageActionButtons
                    buttons={[
                        {
                            label: "Generate Invoice",
                            icon: Plus,
                            asChild: true,
                            children: (
                                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                                    <DialogTrigger asChild>
                                        <Button className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-md gap-2 transition-all active:scale-95 font-sans" style={{ background: 'var(--primary)' }}>
                                            <Plus className="h-4 w-4" /> Generate Invoice
                                        </Button>
                                    </DialogTrigger>
                                    <CreateInvoiceDialog onClose={() => setShowCreate(false)} />
                                </Dialog>
                            )
                        }
                    ]}
                />
            </div>

            <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                <DataGrid
                    data={invoices}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    enableDateRange={true}
                    dateFilterKey="date"
                    searchPlaceholder="Filter by Invoice#, Client, Date or Reference..."
                    toolbarClassName="border-b px-4 py-3 bg-white"
                />
            </div>
        </div>
    )
}
