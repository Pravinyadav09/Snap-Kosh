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
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

// Generic Components
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { CostEstimator } from "@/components/shared/cost-estimator"

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
        <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[90vh] flex flex-col">
            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-semibold tracking-tight text-slate-800">Create Sales Invoice</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400">Generate a new GST-compliant invoice for your customer</DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 font-sans">
                {/* 01: Meta Details */}
                <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Details</h3>
                        <Badge variant="outline" className="text-[9px] font-bold text-slate-400 border-slate-100">Draft Status</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Invoice No.</Label>
                            <Input defaultValue="INV-2026-0030" className="h-8 rounded-md border-slate-200 bg-slate-50 font-black text-xs text-slate-400" readOnly />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Customer <span className="text-rose-500">*</span></Label>
                            <Select defaultValue="dk">
                                <SelectTrigger className="h-8 rounded-md border-slate-200 bg-white text-xs font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-md">
                                    <SelectItem value="dk" className="text-xs font-medium">Denesik-Keeling</SelectItem>
                                    <SelectItem value="cg" className="text-xs font-medium">Crona Group</SelectItem>
                                </SelectContent>
                            </Select>
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

                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
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
                    <div className="bg-[#111827] rounded-md p-5 text-white space-y-4 shadow-lg">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Subtotal</span>
                            <span className="font-bold text-sm tabular-nums">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                <span>Applied GST</span>
                                <Select value={String(taxRate)} onValueChange={v => setTaxRate(+v)}>
                                    <SelectTrigger className="h-6 w-16 bg-white/5 border-white/10 text-white font-bold text-[9px] rounded-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md">
                                        <SelectItem value="18" className="text-xs">18%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 font-medium">GST Amount ({taxRate}%)</span>
                                <span className="font-bold text-emerald-400">+ ₹{taxAmt.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-300 mb-0.5">Total Payable</p>
                                <p className="text-2xl font-black tracking-tight tabular-nums text-white">
                                    ₹{grandTotal.toLocaleString()}
                                </p>
                            </div>
                            <ShieldCheck className="h-6 w-6 text-white/5" />
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
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h1 className="text-3xl font-bold tracking-tight">Invoice View</h1>
                <div className="flex flex-wrap gap-2">
                    <Button className="h-10 px-6 gap-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700" onClick={() => toast.success("Preparing Download", { description: "Your PDF invoice is being generated." })}>
                        <Download className="h-4 w-4" /> Download PDF
                    </Button>
                    <Button className="h-10 px-6 gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600" onClick={() => toast.info("Email Sending", { description: "Attempting to send invoice via email..." })}>
                        <Mail className="h-4 w-4" /> Email
                    </Button>
                    <Button className="h-10 px-6 gap-1.5 text-xs font-bold text-white shadow-lg" style={{ background: 'var(--primary)' }} onClick={() => toast.info("Opening Print Dialog")}>
                        <Printer className="h-4 w-4" /> Print
                    </Button>
                    <Button variant="outline" className="gap-2 font-bold" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', background: 'transparent' }} onClick={onBack}>← Back</Button>
                </div>
            </div>

            {/* Invoice Document */}
            <div className="border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden bg-white p-12 space-y-8">
                {/* Top row */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-20 w-20 rounded-3xl flex items-center justify-center text-3xl shadow-xl text-white" style={{ background: 'var(--primary)' }}>
                            <FileText className="h-10 w-10 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Ganesha Prints</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Commercial Print Service</p>
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <h2 className="text-6xl font-black tracking-tighter text-slate-100 uppercase leading-none">INVOICE</h2>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 justify-end">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] uppercase px-4 h-6 border shadow-none">
                                    {inv.status.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 text-right justify-end">
                                <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest space-y-1">
                                    <div>Inv No:</div><div>Issue Date:</div><div>Due Date:</div><div>Reference:</div>
                                </div>
                                <div className="font-bold text-xs text-slate-800 space-y-1">
                                    <div>{inv.id}</div> <div>{inv.date}</div> <div>{inv.dueDate}</div> <div className="text-blue-600">{inv.jobRef}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill From / Bill To */}
                <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-50">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Bill From</p>
                        <div className="space-y-1">
                            <p className="font-black text-lg text-slate-900">Ganesha Softwares</p>
                            <p className="text-sm text-slate-500">SF-37, Gaur City Center,</p>
                            <p className="text-sm text-slate-500">Greater Noida Extention, UP</p>
                            <p className="text-[11px] font-black mt-4 text-slate-800">GSTIN: <span className="text-blue-600">27ABCDE1234F2Z5</span></p>
                        </div>
                    </div>
                    <div className="space-y-4 text-right sm:text-left">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Bill To</p>
                        <div className="space-y-1">
                            <p className="font-black text-lg text-slate-900">{inv.customer}</p>
                            <p className="text-sm text-slate-500">202 Lebsack Station Suite 446</p>
                            <p className="text-sm text-slate-500">East Cordie, Michigan – 38083</p>
                            <p className="text-[11px] font-black mt-4 text-slate-800">GSTIN: <span className="text-blue-600 italic">GSTINMDTVA89SVE</span></p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm bg-slate-50/30 mt-8">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100/50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 w-12">#</th>
                                <th className="text-left px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Description</th>
                                <th className="text-right px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 w-24">Qty</th>
                                <th className="text-right px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 w-32">Rate (₹)</th>
                                <th className="text-right px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 w-32">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {inv.items.map((item, idx) => (
                                <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-300 font-bold">{String(idx + 1).padStart(2, '0')}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{item.desc}</td>
                                    <td className="px-6 py-4 text-right font-medium">{item.qty}</td>
                                    <td className="px-6 py-4 text-right font-medium">₹{item.rate.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right font-black text-slate-900">₹{(item.qty * item.rate).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Final Calculations */}
                <div className="flex justify-end pt-6">
                    <div className="w-full sm:w-80 space-y-3 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                            <span>Tax (GST 18%)</span>
                            <span>₹{inv.tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                            <span className="font-black text-[10px] uppercase tracking-widest text-slate-900">Grand Total</span>
                            <span className="font-black text-2xl text-blue-600 tracking-tight">₹{inv.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {inv.notes && (
                    <div className="bg-slate-50/50 rounded-2xl p-6 border-l-4 border-blue-500 border shadow-sm">
                        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-2">Internal Notes / Bank Details</p>
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
        <div className="space-y-4 font-sans max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-2 px-1">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">Record Payment</h1>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Post-sale transaction reconciliation for Invoice #{inv.id}</p>
                </div>
                <Button variant="ghost" size="sm" className="font-bold text-[11px] uppercase tracking-wider text-slate-400 hover:text-slate-900 transition-colors" onClick={onBack}>
                    Return to Ledger
                </Button>
            </div>

            <div className="pt-4">
                <Card className="border border-slate-200 shadow-sm rounded-md overflow-hidden bg-white">
                    <CardHeader className="py-4 px-6 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 text-white rounded-md" style={{ background: 'var(--primary)' }}>
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">Payment Receipt Entry</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Summary Bar */}
                        <div className="rounded-md bg-slate-900 p-4 flex items-center justify-between shadow-sm">
                            <div className="space-y-0.5">
                                <p className="font-bold text-indigo-300 text-[10px] uppercase tracking-wider">Client Source</p>
                                <p className="font-bold text-white text-base tracking-tight">{inv.customer}</p>
                            </div>
                            <div className="text-right space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance Due</p>
                                <p className="font-bold text-2xl text-emerald-400 tracking-tighter tabular-nums">₹{inv.amount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Receipt No.</Label>
                                <Input defaultValue="REC-2026-0016" className="h-9 border-slate-200 bg-slate-50 text-sm font-medium" readOnly />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Payment Date</Label>
                                <Input type="date" className="h-9 border-slate-200 font-medium text-sm" defaultValue="2026-02-25" />
                            </div>
                        </div>

                        <div className="space-y-1.5 bg-amber-50/20 p-5 rounded-md border border-amber-100/50">
                            <Label className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Amount Received (INR)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-amber-600">₹</span>
                                <Input
                                    type="number"
                                    defaultValue={inv.amount.toFixed(2)}
                                    className="h-12 pl-8 text-xl font-bold border-amber-200 focus:border-amber-400 bg-white rounded-md shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Payment Mode</Label>
                                <Select defaultValue="upi">
                                    <SelectTrigger className="h-9 border-slate-200 text-sm font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md">
                                        <SelectItem value="upi" className="text-sm">UPI / G-Pay / PhonePe</SelectItem>
                                        <SelectItem value="neft" className="text-sm">NEFT / RTGS / Bank</SelectItem>
                                        <SelectItem value="cash" className="text-sm">Cash Payment</SelectItem>
                                        <SelectItem value="cheque" className="text-sm">Cheque Deposit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Reference / UTR / Chq No.</Label>
                                <Input className="h-9 border-slate-200 font-medium text-sm" placeholder="e.g. UTR12345678" />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="ghost" size="sm" className="h-9 px-6 text-xs font-medium text-slate-400" onClick={onBack}>Discard Entry</Button>
                            <Button className="h-9 px-8 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                                <CheckCircle className="h-4 w-4 mr-2" /> Finalize Payment
                            </Button>
                        </div>
                    </CardContent>
                </Card>
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
            headerClassName: "w-[120px]",
            render: (val, inv) => (
                <span
                    className="text-[var(--primary)] font-black font-mono text-xs hover:underline cursor-pointer uppercase tracking-tight italic"
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
            headerClassName: "w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            render: (val, inv) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[var(--primary)] font-bold text-xs tracking-tight">#{val}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{inv.date}</span>
                </div>
            )
        },
        { key: "customer", label: "Customer", className: "text-xs font-semibold text-slate-700", headerClassName: "text-[10px] font-bold uppercase tracking-wider text-slate-400" },
        {
            key: "amount",
            label: "Total Amount",
            headerClassName: "text-right w-[150px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            className: "text-right tabular-nums font-bold text-slate-900 text-xs",
            render: (val) => `₹${val.toLocaleString()}`
        },
        {
            key: "status",
            label: "Status",
            headerClassName: "w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400",
            render: (val) => {
                let statusClass = "bg-slate-500 text-white"
                if (val === "Paid") statusClass = "bg-emerald-600 text-white"
                const style = val === "Sent" ? { background: 'var(--primary)' } : undefined

                return (
                    <Badge className={`${statusClass} text-[10px] font-bold px-2 py-0.5 rounded-sm border-none shadow-sm`} style={style}>
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
                    <Button variant="outline" size="sm" className="h-7 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-bold text-[10px] uppercase tracking-tight rounded-md px-2.5 transition-all" onClick={() => setViewInvoice(item)}>
                        <Eye className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> View
                    </Button>
                    <Button
                        size="sm"
                        className="h-7 font-bold text-[10px] uppercase tracking-tight rounded-md px-2.5 transition-all text-white"
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
        <div className="space-y-4 font-sans bg-slate-50/30 p-4 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-2 px-1">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">Sales Ledger</h1>
                    <p className="text-xs text-slate-500 font-medium">Manage client billing, GST invoices, and payment tracking</p>
                </div>

                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                    <DialogTrigger asChild>
                        <Button className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-md gap-2 transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                            <Plus className="h-4 w-4" /> Generate Invoice
                        </Button>
                    </DialogTrigger>
                    <CreateInvoiceDialog onClose={() => setShowCreate(false)} />
                </Dialog>
            </div>

            <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                <DataGrid
                    data={invoices}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    searchPlaceholder="Filter by Invoice#, Client, Date or Reference..."
                    toolbarClassName="border-b px-4 py-3 bg-white"
                />
            </div>
        </div>
    )
}
