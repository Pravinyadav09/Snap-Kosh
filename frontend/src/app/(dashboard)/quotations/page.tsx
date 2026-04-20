"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
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
    History,
    Info
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
import { ClientPaymentStatus } from "@/components/shared/client-payment-status"
import { Can } from "@/components/shared/permission-context"

// ─── Types ────────────────────────────────────────────────────────────────────
type QuoteItem = { id: number; desc: string; qty: number; rate: number }
type Quotation = {
    id: string
    date: string
    expiryDate: string
    customer: string
    status: string
    amount: number
    tax: number
    items: QuoteItem[]
    notes: string
}

const statusStyles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    expired: "bg-rose-50 text-rose-700 border-rose-200",
    converted: "bg-purple-50 text-purple-700 border-purple-200",
}

// ─── Quotation Compose Component ──────────────────────────────────────────────
function ComposeQuotation({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) {
    const [items, setItems] = useState<QuoteItem[]>([{ id: 1, desc: "", qty: 1, rate: 0 }])
    const [taxRate, setTaxRate] = useState(18)
    const [isLoading, setIsLoading] = useState(false)
    const [customers, setCustomers] = useState<any[]>([])
    
    // Form state
    const [customerId, setCustomerId] = useState("")
    const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0])
    const [validity, setValidity] = useState("7")
    const [notes, setNotes] = useState("")
    const [prefix, setPrefix] = useState("QT/")

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                // 1. Fetch Customers
                const cRes = await fetch(`${API_BASE}/api/Customers/lookup`)
                if (cRes.ok) {
                    const data = await cRes.json()
                    setCustomers((data || []).map((c: any) => ({ 
                        value: (c.value || c.Value || c.id || c.Id || "").toString(), 
                        label: c.label || c.Label || c.name || c.Name || "Unknown Client" 
                    })))
                }

                // 2. Fetch Settings
                const sRes = await fetch(`${API_BASE}/api/settings`)
                if (sRes.ok) {
                    const settings: any[] = await sRes.json()
                    const getVal = (k: string) => {
                        const s = settings.find(x => (x.key || x.Key || "").toLowerCase() === k.toLowerCase())
                        return s?.value ?? s?.Value ?? ""
                    }
                    const pref = getVal("quotation_prefix") || "QT/"
                    const foot = getVal("quotation_footer") || ""
                    setPrefix(pref)
                    setNotes(foot)
                }
            } catch { toast.error("System synchronization lag.") }
        }
        fetchMeta()
    }, [])

    const addItem = () => setItems(prev => [...prev, { id: Date.now(), desc: "", qty: 1, rate: 0 }])
    const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0)
    const taxAmt = subtotal * (taxRate / 100)
    const total = subtotal + taxAmt

    const handleSubmit = async () => {
        if (!customerId) {
            toast.error("Identify the prospect first.")
            return
        }

        setIsLoading(true)
        try {
            const expDate = new Date(quoteDate)
            expDate.setDate(expDate.getDate() + parseInt(validity))

            const payload = {
                customerId: parseInt(customerId),
                description: items.map(i => `${i.desc} (x${i.qty})`).join(", "),
                estimatedCost: subtotal * 0.7, // Simulated cost based on 30% margin
                quotedPrice: subtotal,
                profitMargin: 30,
                status: "sent",
                validTill: expDate.toISOString(),
                createdAt: new Date(quoteDate).toISOString()
            }

            const res = await fetch(`${API_BASE}/api/Quotations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success("Estimate dispatched to ledger.")
                onRefresh()
                onClose()
            } else {
                toast.error("Ledger rejected the commit.")
            }
        } catch {
            toast.error("System communication failure.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white font-sans">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                        <FileCheck className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 leading-none uppercase tracking-tight">New Quotation Protocol</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Initialize professional estimate document</p>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 py-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                {/* Meta Row */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Info className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quotation Information</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Quotation Number</Label>
                                    <Input 
                                        className="h-9 rounded-md border-slate-200 bg-slate-50 font-bold text-slate-400 text-sm" 
                                        value={`${prefix}${new Date().toISOString().slice(0,10).replace(/-/g,'')}-PREVIEW`} 
                                        readOnly 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Client Selection <span className="text-rose-500">*</span></Label>
                                    <SearchableSelect 
                                        options={customers}
                                        value={customerId}
                                        placeholder="Identify prospect..."
                                        onValueChange={setCustomerId}
                                        className="h-9 rounded-md border-slate-200 bg-white font-medium text-sm shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Issue Date</Label>
                                    <Input 
                                        type="date" 
                                        className="h-9 rounded-md border-slate-200 bg-white font-medium text-sm" 
                                        value={quoteDate} 
                                        onChange={(e) => setQuoteDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Validity Period</Label>
                                    <SearchableSelect
                                        options={[
                                            { value: "7", label: "7 Days" },
                                            { value: "15", label: "15 Days" },
                                            { value: "30", label: "30 Days" }
                                        ]}
                                        value={validity}
                                        onValueChange={(val: any) => setValidity(val)}
                                        placeholder="Validity"
                                        className="h-9 rounded-md border-slate-200 bg-white font-medium text-sm shadow-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-72 xl:w-80">
                        <ClientPaymentStatus customerId={customerId} />
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Plus className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Material Manifest / Line Items</span>
                        </div>
                        <Button variant="outline" className="h-8 px-4 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans" onClick={addItem}>
                            <Plus className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} /> Add Row
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="p-0 overflow-x-auto scrollbar-thin">
                            <div className="min-w-[700px] space-y-4 pb-2">
                                {items.map((item, idx) => (
                                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_100px_120px_40px] gap-3 items-center bg-white border border-slate-100 p-2 sm:p-3 rounded-lg shadow-sm hover:border-slate-200 transition-all group">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider pl-1 sm:hidden">Description</Label>
                                            <Input
                                                placeholder="Service or Product specification..."
                                                className="h-9 rounded-md border-slate-100 bg-slate-50/50 focus:bg-white font-medium text-sm"
                                                value={item.desc}
                                                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, desc: e.target.value } : i))}
                                            />
                                        </div>
                                        <div className="flex flex-row items-center gap-2 sm:block">
                                            <div className="space-y-1 flex-1">
                                                <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider pl-1 sm:hidden">Qty</Label>
                                                <Input
                                                    type="number"
                                                    className="h-9 rounded-md border-slate-100 bg-slate-50/50 focus:bg-white text-center font-bold text-sm"
                                                    value={item.qty}
                                                    onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: +e.target.value } : i))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider pl-1 sm:hidden">Rate</Label>
                                            <Input
                                                type="number"
                                                className="h-9 rounded-md border-slate-100 bg-slate-50/50 focus:bg-white text-right font-bold text-sm"
                                                value={item.rate}
                                                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, rate: +e.target.value } : i))}
                                            />
                                        </div>
                                        <div className="h-9 flex items-center justify-between sm:justify-end px-3 font-bold text-slate-800 tabular-nums text-sm bg-slate-50/50 sm:bg-transparent rounded-md">
                                            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider sm:hidden">Total</span>
                                            ₹{(item.qty * item.rate).toLocaleString()}
                                        </div>
                                        <div className="flex justify-end sm:justify-center">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-rose-500 rounded-md transition-colors" onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Logic */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-600">Exclusions & Notes</Label>
                        <Textarea
                            placeholder="Specify GST Extra, Delivery Charge, etc..."
                            className="h-24 sm:h-full min-h-[120px] rounded-md border-slate-200 bg-white p-3 font-medium text-slate-600 focus:bg-white transition-all resize-none text-sm"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <div className="bg-slate-900 rounded-xl p-6 text-white space-y-4 shadow-xl">
                        <div className="flex justify-between items-center opacity-60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Net Quotation</span>
                            <span className="font-bold text-sm tabular-nums">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-300">
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
                                    className="h-7 w-20 bg-white/10 border-white/20 text-white font-bold text-[10px] rounded shadow-none"
                                />
                            </div>
                            <Progress value={taxRate * 5} className="h-1 bg-white/10 rounded-full" />
                            <div className="text-right font-bold text-emerald-400 text-xs">+ ₹{taxAmt.toLocaleString()}</div>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 leading-none">Gross Estimate</p>
                                <p className="text-2xl font-bold tracking-tighter tabular-nums leading-none">
                                    ₹{total.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                <Button variant="ghost" onClick={onClose} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800">
                    Abort Draft
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-9 px-4 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 bg-white">
                        <Download className="h-3.5 w-3.5 mr-2 text-rose-500" /> Professional PDF
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95 flex items-center gap-2" 
                        style={{ background: 'var(--primary)' }} 
                    >
                        <Send className="h-3.5 w-3.5 opacity-70" /> {isLoading ? "Dispatching..." : "Commit Estimate"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function QuotationsPage() {
    const [quotes, setQuotes] = useState<any[]>([])
    const [view, setView] = useState<"list" | "compose">("list")
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/Quotations`)
            if (res.ok) {
                const data = await res.json()
                const mapped = data.map((q: any) => ({
                    id: q.quotationNumber || `QT-${q.id}`,
                    dbId: q.id,
                    date: new Date(q.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    expiryDate: new Date(q.validTill).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    customer: q.customerName || `Customer #${q.customerId}`,
                    status: (q.status || "draft").toLowerCase(),
                    amount: q.quotedPrice || 0,
                    tax: 0,
                    items: [],
                    notes: ""
                }))
                setQuotes(mapped)
            }
            else toast.error("Quota registry synchronization failed.")
        } catch { toast.error("System connection flatlined.") }
        finally { setIsLoading(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const handleConvertToJob = async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/Quotations/${id}/convert`, { method: "POST" })
            if (res.ok) {
                toast.success("Quotation converted to Job Card Successfuly", {
                    description: "A new job ticket has been initialized and assigned to production."
                })
                fetchData()
            } else {
                const err = await res.json()
                toast.error(err.message || "Conversion failed.")
            }
        } catch {
            toast.error("Network communication failure.")
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            key: "id",
            label: "Ref #",
            render: (val) => <span className="text-slate-900 font-bold font-mono text-xs uppercase">{val}</span>
        },
        {
            key: "customer",
            label: "Prospect / Client",
            render: (val, item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm tracking-tight">{val}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valid till: {item.expiryDate}</span>
                </div>
            )
        },
        {
            key: "amount",
            label: "Total Value",
            render: (val) => <span className="font-bold text-slate-900 text-sm tracking-tighter">₹{Number(val).toLocaleString()}</span>
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <Badge className={`text-[10px] uppercase font-bold px-3 h-5 border shadow-none ${statusStyles[String(val)] || statusStyles.draft}`}>
                    {val}
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Actions",
            headerClassName: "text-right",
            className: "text-right",
            render: (_, item: any) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    {(item.status?.toLowerCase() === "accepted" || item.status?.toLowerCase() === "sent") && (
                        <Can I="create" a="production">
                            <Button 
                                size="sm" 
                                className="h-7 px-3 rounded-md font-bold text-[9px] uppercase tracking-widest text-white transition-all active:scale-95 flex items-center gap-1.5"
                                style={{ background: 'var(--primary)' }}
                                onClick={() => handleConvertToJob(item.dbId)}
                            >
                                <FileCheck className="h-3.5 w-3.5" /> Convert
                            </Button>
                        </Can>
                    )}
                    <Can I="print" a="sales">
                        <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-none" title="Print/Download PDF" onClick={() => window.open(`/print/quotation/${item.dbId}`, '_blank')}>
                            <Printer className="h-3.5 w-3.5" />
                        </Button>
                    </Can>
                    <Can I="view" a="sales">
                        <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-indigo-200 bg-white text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-none" title="View Full Quotation" onClick={() => window.location.href = `/estimator/new?id=${item.dbId}`}>
                            <Eye className="h-3.5 w-3.5" />
                        </Button>
                    </Can>
                    <Can I="edit" a="sales">
                        <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-emerald-200 bg-white text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-none" title="Revise Quotation">
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                    </Can>
                </div>
            )
        }
    ]

    if (view === "compose") {
        return <ComposeQuotation onClose={() => setView("list")} onRefresh={fetchData} />
    }

    return (
        <div className="space-y-4 font-sans bg-white p-2 sm:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-row items-center justify-between px-4 sm:px-1 gap-4 pb-2 uppercase font-sans">
                <div className="space-y-0.5 text-left">
                    <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-slate-900">Quotation Hub</h1>
                </div>

                <Can I="create" a="sales">
                    <Button
                        className="gap-3 font-bold text-[10px] uppercase tracking-widest h-11 sm:h-12 shadow-xl px-6 sm:px-10 rounded-xl sm:rounded-2xl transition-all active:scale-95 group text-white w-full sm:w-auto"
                        style={{ background: 'var(--primary)' }}
                        onClick={() => setView("compose")}
                    >
                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> <span className="sm:inline">Create New Quote</span>
                    </Button>
                </Can>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-2 uppercase font-sans">
                <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm text-white p-4 sm:p-6" style={{ background: 'var(--primary)' }}>
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Open Quotes</p>
                    <p className="text-lg sm:text-3xl font-bold tracking-tighter">₹1.2M</p>
                </Card>
                <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm bg-emerald-600 text-white p-4 sm:p-6">
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Accepted</p>
                    <p className="text-lg sm:text-3xl font-bold tracking-tighter">₹842K</p>
                </Card>
                <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm bg-white border border-slate-100 p-4 sm:p-6">
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Conv. Rate</p>
                    <p className="text-lg sm:text-3xl font-bold tracking-tighter text-slate-800">68%</p>
                </Card>
                <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm bg-white border border-slate-100 p-4 sm:p-6">
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Avg Lead Time</p>
                    <p className="text-lg sm:text-3xl font-bold tracking-tighter text-slate-800">2.4D</p>
                </Card>
            </div>

            <Card className="shadow-2xl shadow-slate-200/50 border-none bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100">
                <div className="p-2 sm:p-6 text-left font-sans uppercase">
                    <DataGrid
                        data={quotes}
                        columns={columns}
                        title="QuotationLedger"
                        isLoading={isLoading}
                        enableDateRange={true}
                        dateFilterKey="date"
                        searchPlaceholder="Search Quote# or Client..."
                    />
                </div>
            </Card>
        </div>
    )
}
