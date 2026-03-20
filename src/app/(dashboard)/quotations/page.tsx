"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
    Plus,
    Eye,
    FileText,
    Send,
    Download,
    CheckCircle,
    Clock,
    Search,
    BadgeIndianRupee,
    Printer,
    Mail,
    Edit,
    X,
    MoreHorizontal,
    FileCheck,
    History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

// Generic Components
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { FormModal, FormField } from "@/components/shared/form-modal"
import { SearchableSelect } from "@/components/shared/searchable-select"

// ─── Types ────────────────────────────────────────────────────────────────────
type QuoteItem = { id: number; desc: string; qty: number; rate: number }
type Quotation = {
    id: string
    date: string
    expiryDate: string
    customer: string
    status: "draft" | "sent" | "accepted" | "expired"
    amount: number
    tax: number
    items: QuoteItem[]
    notes: string
}

const initialQuotes: Quotation[] = [
    { id: "QT-8821", date: "28 Feb, 2026", expiryDate: "07 Mar", customer: "Harris Group", status: "sent", amount: 14500.00, tax: 2610, items: [], notes: "" },
    { id: "QT-8819", date: "25 Feb, 2026", expiryDate: "04 Mar", customer: "Schuster Ltd", status: "accepted", amount: 8900.50, tax: 1602.09, items: [], notes: "" },
    { id: "QT-8815", date: "20 Feb, 2026", expiryDate: "27 Feb", customer: "Supreme Traders", status: "expired", amount: 2500.00, tax: 450, items: [], notes: "" },
]

const statusStyles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    expired: "bg-rose-50 text-rose-700 border-rose-200",
}

// ─── Quotation Compose Component ──────────────────────────────────────────────
function ComposeQuotation({ onClose }: { onClose: () => void }) {
    const [items, setItems] = useState<QuoteItem[]>([{ id: 1, desc: "", qty: 1, rate: 0 }])
    const [taxRate, setTaxRate] = useState(18)

    const addItem = () => setItems(prev => [...prev, { id: Date.now(), desc: "", qty: 1, rate: 0 }])
    const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0)
    const taxAmt = subtotal * (taxRate / 100)
    const total = subtotal + taxAmt

    return (
        <div className="flex flex-col h-full bg-white font-sans">
            <div className="px-4 sm:px-10 pt-6 sm:pt-10 pb-4 sm:pb-6 border-b bg-slate-50/30">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 sm:p-3 rounded-2xl bg-white text-indigo-600 shadow-sm border border-indigo-100">
                        <FileCheck className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans italic uppercase">New Quotation</h2>
                </div>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-1 font-sans">
                    Professional Estimate Creation Console
                </p>
            </div>

            <div className="px-4 sm:px-10 py-6 sm:py-10 space-y-8 sm:space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                {/* Meta Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Client Selection</Label>
                        <SearchableSelect 
                            options={[
                                { value: "hg", label: "Harris Group" },
                                { value: "sl", label: "Schuster Ltd" },
                                { value: "st", label: "Supreme Traders" },
                                { value: "bt", label: "Bharat Textiles" },
                                { value: "rp", label: "Ravi Prints" }
                            ]}
                            placeholder="Select Client..."
                            onValueChange={(val) => console.log(val)}
                            className="h-10 sm:h-12 rounded-xl border-2 border-slate-100 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 shadow-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Quote Date</Label>
                        <Input type="date" className="h-10 sm:h-12 rounded-xl border-2 border-slate-100 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100" defaultValue="2026-03-02" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Validity (Days)</Label>
                        <SearchableSelect
                            options={[
                                { value: "7", label: "7 Days" },
                                { value: "15", label: "15 Days" },
                                { value: "30", label: "30 Days" }
                            ]}
                            value="7"
                            onValueChange={(val: any) => console.log(val)}
                            placeholder="Validity"
                            className="h-10 sm:h-12 rounded-xl border-2 border-slate-100 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 shadow-none"
                        />
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Line Items Detail</span>
                        </div>
                        <Button variant="outline" className="h-9 sm:h-10 px-4 sm:px-6 rounded-xl border-dashed border-2 font-black text-[10px] uppercase tracking-widest transition-all gap-2 w-full sm:w-auto" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={addItem}>
                            <Plus className="h-4 w-4" /> Add Item
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="p-0 overflow-x-auto scrollbar-thin">
                            <div className="min-w-[700px] space-y-4 pb-2">
                                {items.map((item, idx) => (
                                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_140px_50px] gap-4 items-center bg-white border-2 border-slate-50 p-3 sm:p-4 rounded-2xl shadow-sm hover:border-indigo-100 transition-all group">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1 sm:hidden">Description</Label>
                                            <Input
                                                placeholder="Task / Specification..."
                                                className="h-10 sm:h-11 rounded-xl border-slate-100 bg-slate-50 focus:bg-white font-bold text-sm"
                                                value={item.desc}
                                                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, desc: e.target.value } : i))}
                                            />
                                        </div>
                                        <div className="flex flex-row items-center gap-4 sm:block">
                                            <div className="space-y-1 flex-1">
                                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1 sm:hidden">Qty</Label>
                                                <Input
                                                    type="number"
                                                    className="h-10 sm:h-11 rounded-xl border-slate-100 bg-slate-50 focus:bg-white text-center font-black text-sm"
                                                    value={item.qty}
                                                    onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: +e.target.value } : i))}
                                                />
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1 sm:hidden">Rate (₹)</Label>
                                                <Input
                                                    type="number"
                                                    className="h-10 sm:h-11 rounded-xl border-slate-100 bg-slate-50 focus:bg-white text-right font-black text-sm"
                                                    value={item.rate}
                                                    onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, rate: +e.target.value } : i))}
                                                />
                                            </div>
                                        </div>
                                        <div className="h-10 sm:h-11 flex items-center justify-between sm:justify-end px-3 font-black text-slate-900 tabular-nums text-base sm:text-lg bg-slate-50 sm:bg-transparent rounded-xl sm:rounded-none">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest sm:hidden">Total Amount</span>
                                            ₹{(item.qty * item.rate).toLocaleString()}
                                        </div>
                                        <div className="flex justify-end sm:justify-center">
                                            <Button size="sm" variant="ghost" className="h-9 w-full sm:w-9 text-rose-400 hover:text-rose-600 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-rose-50 sm:bg-transparent rounded-xl flex items-center gap-2" onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}>
                                                <X className="h-4 w-4" /> <span className="sm:hidden text-[9px] font-black uppercase tracking-widest">Remove Item</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Logic */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Exclusions & Notes</Label>
                        <Textarea
                            placeholder="Specify GST Extra, Delivery Charge, etc..."
                            className="h-24 sm:h-32 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 font-medium italic text-slate-600 focus:bg-white transition-all resize-none shadow-sm"
                        />
                    </div>
                    <div className="bg-slate-900 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 text-white space-y-6 shadow-2xl shadow-indigo-900/10">
                        <div className="flex justify-between items-center opacity-60">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Net Quotation</span>
                            <span className="font-black text-base sm:text-lg tabular-nums">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-300">
                                <span>Applied GST TAX</span>
                                <SearchableSelect
                                    options={[
                                        { value: "0", label: "0%" },
                                        { value: "12", label: "12%" },
                                        { value: "18", label: "18%" }
                                    ]}
                                    value={String(taxRate)}
                                    onValueChange={v => setTaxRate(+v)}
                                    placeholder="Tax (%)"
                                    className="h-8 w-24 bg-white/10 border-white/20 text-white font-black text-[10px] rounded-lg shadow-none"
                                />
                            </div>
                            <Progress value={taxRate * 5} className="h-1.5 bg-white/10 rounded-full overflow-hidden" />
                            <div className="text-right font-black text-emerald-400 text-sm">+ ₹{taxAmt.toLocaleString()}</div>
                        </div>
                        <div className="pt-4 sm:pt-6 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-1.5 leading-none shadow-none">Gross Estimate</p>
                                <p className="text-3xl sm:text-4xl font-black tracking-tighter tabular-nums leading-none italic shadow-none border-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                    ₹{total.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-10 border-t bg-slate-50/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <Button variant="ghost" className="h-10 sm:h-12 px-6 sm:px-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 w-full sm:w-auto" onClick={onClose}>
                        Abandon Draft
                    </Button>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <Button variant="outline" className="h-12 px-6 sm:px-10 rounded-xl border-2 border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-700 bg-white w-full sm:w-auto">
                            <Download className="h-4 w-4 mr-2 text-rose-500" /> <span className="sm:inline">Professional PDF</span>
                        </Button>
                        <Button className="h-12 sm:h-14 px-8 sm:px-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto" style={{ background: 'var(--primary)' }} onClick={onClose}>
                            <Send className="h-4 w-4 opacity-70" /> Ship to Client
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function QuotationsPage() {
    const [quotes] = useState<Quotation[]>(initialQuotes)
    const [view, setView] = useState<"list" | "compose">("list")

    const columns: ColumnDef<Quotation>[] = [
        {
            key: "id",
            label: "Ref #",
            className: "hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: (val) => <span className="text-slate-900 font-black font-mono text-xs uppercase italic">{val}</span>
        },
        {
            key: "customer",
            label: "Prospect / Client",
            render: (val) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-sm tracking-tight">{val}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valid till: 28 Mar</span>
                </div>
            )
        },
        {
            key: "amount",
            label: "Total Value",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => <span className="font-black text-slate-900 text-sm tracking-tighter italic">₹{Number(val).toLocaleString()}</span>
        },
        {
            key: "status",
            label: "Status",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            render: (val) => (
                <Badge className={`text-[10px] uppercase font-black px-3 h-5 border shadow-none ${statusStyles[String(val)]}`}>
                    {val}
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Actions",
            headerClassName: "text-right",
            className: "text-right",
            render: () => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-indigo-200 bg-white text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-none" title="View Full Quotation">
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-emerald-200 bg-white text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-none" title="Revise Quotation">
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-500 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-none" title="More Operations">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    if (view === "compose") {
        return <ComposeQuotation onClose={() => setView("list")} />
    }

    return (
        <div className="space-y-4 font-sans bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 pb-2 italic uppercase font-sans">
                <div className="space-y-0.5 text-left">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Quotation Hub</h1>
                </div>

                <Button
                    className="gap-3 font-black text-[10px] uppercase tracking-widest h-11 sm:h-12 shadow-xl px-6 sm:px-10 rounded-xl sm:rounded-2xl transition-all active:scale-95 group text-white w-full sm:w-auto"
                    style={{ background: 'var(--primary)' }}
                    onClick={() => setView("compose")}
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> <span className="sm:inline">Create New Quote</span>
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-2 italic uppercase font-sans">
                <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm text-white p-4 sm:p-6" style={{ background: 'var(--primary)' }}>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Open Quotes</p>
                    <p className="text-lg sm:text-3xl font-black tracking-tighter">₹1.2M</p>
                </Card>
                <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm bg-emerald-600 text-white p-4 sm:p-6">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Accepted</p>
                    <p className="text-lg sm:text-3xl font-black tracking-tighter">₹842K</p>
                </Card>
                <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm bg-white border border-slate-100 p-4 sm:p-6">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Conv. Rate</p>
                    <p className="text-lg sm:text-3xl font-black tracking-tighter text-slate-800">68%</p>
                </Card>
                <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm bg-white border border-slate-100 p-4 sm:p-6">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg Lead Time</p>
                    <p className="text-lg sm:text-3xl font-black tracking-tighter text-slate-800">2.4D</p>
                </Card>
            </div>

            <Card className="shadow-2xl shadow-slate-200/50 border-none bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100">
                <div className="p-2 sm:p-6 text-left font-sans uppercase">
                    <DataGrid
                        data={quotes}
                        columns={columns}
                        title="QuotationLedger"
                        enableDateRange={true}
                        dateFilterKey="date"
                        searchPlaceholder="Search Quote# or Client..."
                    />
                </div>
            </Card>
        </div>
    )
}
