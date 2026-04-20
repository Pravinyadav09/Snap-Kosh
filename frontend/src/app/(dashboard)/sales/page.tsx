"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    FileText,
    Search,
    Plus,
    ExternalLink,
    CheckCircle,
    Clock,
    Send,
    Download,
    MoreHorizontal,
    DollarSign,
    Printer,
    Mail,
    Edit,
    ArrowLeft,
    Trash2,
    Calculator,
    CreditCard,
    FileDown,
    Filter,
    Settings2,
    Check,
    AlertCircle,
    Coins,
    Info as InfoIcon
} from "lucide-react"
import { DataGrid } from "@/components/shared/data-grid"
import { PageActionButtons } from "@/components/shared/page-action-buttons"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

type SalesInvoice = {
    id: string
    date: string
    dueDate: string
    customer: string
    jobRef: string
    amount: string
    tax: string
    status: string
    items: { id: number; desc: string; qty: number; rate: number; amount: number }[]
    notes: string
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<SalesInvoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'view'>('list')
    const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null)
    const [formItems, setFormItems] = useState([
        { id: 1, desc: "", qty: "", rate: "", amount: "0" }
    ])
    const [taxRate, setTaxRate] = useState(18)
    const [customers, setCustomers] = useState<{value: string, label: string}[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState("")

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/invoices?size=100`)
                if (response.ok) {
                    const data = await response.json()
                    const mapped = (data.items || []).map((apiInv: any) => ({
                        id: apiInv.invoiceNumber || `INV-${apiInv.id}`,
                        date: new Date(apiInv.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        dueDate: "N/A",
                        customer: apiInv.customerName || `Customer #${apiInv.customerId}`,
                        jobRef: "N/A",
                        amount: `₹${apiInv.grandTotal.toLocaleString('en-IN')}`,
                        tax: `₹${apiInv.taxAmount.toLocaleString('en-IN')}`,
                        status: apiInv.paymentStatus || "Unpaid",
                        items: (apiInv.items || []).map((i: any) => ({
                            id: i.id,
                            desc: i.description,
                            qty: i.quantity,
                            rate: i.rate,
                            amount: i.amount
                        })),
                        notes: ""
                    }))
                    setInvoices(mapped)
                } else {
                    toast.error("Failed to load invoice history")
                }
            } catch (error) {
                console.error("Error fetching invoices:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchInvoices()
    }, [])

    useEffect(() => {
        fetch(`${API_BASE}/api/Customers/lookup`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const mapped = (data || []).map((c: any) => ({ 
                    value: (c.value || c.Value || c.id || c.Id || "").toString(), 
                    label: c.label || c.Label || c.name || c.Name || "Unknown Client" 
                }))
                setCustomers(mapped)
            })
            .catch(() => {})
    }, [])

    const addFormItem = () => {
        setFormItems([...formItems, { id: Date.now(), desc: "", qty: "", rate: "", amount: "0" }])
    }

    const removeFormItem = (id: number) => {
        setFormItems(formItems.filter(item => item.id !== id))
    }

    if (viewMode === 'create') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-2 py-4">
                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                        <Calculator className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 leading-none uppercase tracking-tight">Register Revenue Protocol</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Generate institutional GST compliant invoice</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-lg">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <InfoIcon className="h-3 w-3" /> Transaction Intelligence
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Invoice Number</Label>
                                        <Input defaultValue="AUTOID-2026-X" className="h-9 border-slate-200 bg-slate-50 font-bold text-slate-400 text-sm rounded-md" readOnly />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Customer <span className="text-rose-500">*</span></Label>
                                        <SearchableSelect
                                            options={customers}
                                            value={selectedCustomer}
                                            onValueChange={setSelectedCustomer}
                                            placeholder="Identify client entity..."
                                            className="h-9 rounded-md border-slate-200 bg-white font-medium text-sm shadow-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Issue Date</Label>
                                        <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Maturity / Due Date</Label>
                                        <Input type="date" defaultValue={new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-lg">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-2 px-6">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <Coins className="h-3 w-3" /> Material Manifest / Services
                                </CardTitle>
                                <Button variant="outline" className="h-7 px-3 rounded-md border-slate-200 font-bold text-[9px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all" onClick={addFormItem}>
                                    <Plus className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} /> Add Row
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto scrollbar-thin">
                                <div className="min-w-[700px]">
                                    <Table>
                                        <TableHeader className="bg-slate-50/30">
                                            <TableRow className="h-9">
                                                <TableHead className="text-xs font-bold text-slate-600">Description</TableHead>
                                                <TableHead className="w-[100px] text-xs font-bold text-slate-600 text-center">Qty</TableHead>
                                                <TableHead className="w-[130px] text-xs font-bold text-slate-600 text-center">Rate (₹)</TableHead>
                                                <TableHead className="w-[130px] text-xs font-bold text-slate-600 text-right">Subtotal</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {formItems.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-slate-50/30 border-slate-100">
                                                    <TableCell className="py-2">
                                                        <Input placeholder="Enter work details..." defaultValue={item.desc} className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 font-medium text-sm" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input type="number" defaultValue={item.qty} className="h-8 text-center font-bold bg-slate-100/50 border-none rounded-md" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input type="number" defaultValue={item.rate} className="h-8 text-center font-bold bg-slate-100/50 border-none rounded-md" />
                                                    </TableCell>
                                                    <TableCell className="text-right font-black text-slate-800 tabular-nums text-sm">
                                                        ₹{item.amount}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-rose-500 rounded-md" onClick={() => removeFormItem(item.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-none shadow-xl bg-slate-900 text-white rounded-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ledger Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Subtotal Amount</span>
                                    <span className="font-bold tabular-nums">₹0.00</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                        <span>Applied GST TAX</span>
                                        <SearchableSelect
                                            options={[
                                                { value: '18', label: 'GST 18%' },
                                                { value: '12', label: 'GST 12%' },
                                                { value: '0', label: 'No Tax' }
                                            ]}
                                            value={String(taxRate)}
                                            onValueChange={v => setTaxRate(+v)}
                                            placeholder="Tax"
                                            className="h-7 w-20 bg-white/10 border-white/10 text-white font-bold text-[10px] rounded shadow-none"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-xs pt-1">
                                        <span className="text-slate-400">Total Tax Weight</span>
                                        <span className="font-bold text-emerald-400 tabular-nums">₹0.00</span>
                                    </div>
                                </div>
                                <div className="h-px bg-white/10 my-2" />
                                <div className="flex justify-between items-end">
                                    <span className="font-black italic text-lg tracking-tighter uppercase">Grand Total</span>
                                    <span className="text-3xl font-black tracking-tighter text-white tabular-nums">₹0.00</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2 p-6 pt-0">
                                <Button className="flex-1 font-bold h-10 text-xs uppercase tracking-widest text-white shadow-lg transition-all active:scale-95" style={{ background: 'var(--primary)' }} onClick={() => setViewMode('list')}>
                                    Authorize Commit
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-2">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Logistics</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Institutional Notes</Label>
                                    <Textarea placeholder="Enter bank details or payment terms..." className="min-h-[100px] border-slate-200 bg-white p-3 font-medium text-slate-600 text-xs leading-relaxed rounded-md transition-all focus:bg-white resize-none" />
                                </div>
                                <Button variant="outline" className="w-full gap-2 border-slate-200 font-bold text-[10px] uppercase tracking-wider h-9 text-slate-500">
                                    <Calculator className="h-3.5 w-3.5" /> Persistent Template
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    if (viewMode === 'view' && selectedInvoice) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className="rounded-full shrink-0">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">Invoice View</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0">
                        <Button variant="outline" className="flex-1 sm:flex-none gap-2 bg-rose-600/5 text-rose-600 border-rose-600/10 font-bold h-11 text-[10px] uppercase tracking-widest rounded-xl">
                            <FileDown className="h-4 w-4" /> <span className="hidden sm:inline">PDF</span>
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none gap-2 bg-blue-600/5 text-blue-600 border-blue-600/10 font-bold h-11 text-[10px] uppercase tracking-widest rounded-xl">
                            <Mail className="h-4 w-4" /> <span className="hidden sm:inline">Mail</span>
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none gap-2 bg-slate-100 text-slate-900 border-slate-200 font-bold h-11 text-[10px] uppercase tracking-widest rounded-xl">
                            <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print</span>
                        </Button>
                        <Button className="w-full sm:w-auto gap-2 font-black text-white h-11 text-[10px] uppercase tracking-widest rounded-xl shadow-xl transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                            <DollarSign className="h-4 w-4" /> Add Payment
                        </Button>
                    </div>
                </div>

                <Card className="max-w-[1000px] mx-auto border-none shadow-2xl overflow-hidden bg-white">
                    <div className="p-4 sm:p-8 md:p-12 space-y-8 sm:space-y-12">
                        {/* Branding & ID */}
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white text-xl shrink-0" style={{ background: 'var(--primary)' }}>D</div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-2xl tracking-tighter leading-none">DIGITAL ERP</span>
                                        <span className="text-[10px] font-black uppercase tracking-[.4em] opacity-40">Premium Print Labs</span>
                                    </div>
                                </div>
                                <div className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                                    SF-37, Gaur City Center, <br />
                                    Greater Noida Extention <br />
                                    GSTIN: <span className="font-bold text-slate-800">27ABCDE1234F2Z5</span>
                                </div>
                            </div>
                            <div className="text-left sm:text-right space-y-2 w-full sm:w-auto">
                                <h2 className="hidden sm:block text-4xl md:text-6xl font-black tracking-tighter opacity-10">INVOICE</h2>
                                <div className="inline-block px-4 py-1.5 rounded-full bg-rose-500 text-white font-bold text-[10px] uppercase tracking-[.2em] mb-2 sm:mb-4">
                                    {selectedInvoice.status}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-1 sm:space-y-1">
                                    <div className="text-[11px] sm:text-sm"><span className="opacity-40 font-bold">NO: </span> <span className="font-bold">{selectedInvoice.id}</span></div>
                                    <div className="text-[11px] sm:text-sm"><span className="opacity-40 font-bold">DATE: </span> <span className="font-bold">{selectedInvoice.date}</span></div>
                                    <div className="text-[11px] sm:text-sm"><span className="opacity-40 font-bold">DUE: </span> <span className="font-bold text-rose-500 italic">{selectedInvoice.dueDate}</span></div>
                                    <div className="text-[11px] sm:text-sm"><span className="opacity-40 font-bold">JOB REF: </span> <span className="font-bold text-slate-900 tracking-tight">{selectedInvoice.jobRef}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 bg-slate-50 p-4 sm:p-8 rounded-2xl border border-slate-100">
                            <div className="space-y-3 sm:space-y-4">
                                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-40">Bill From</Label>
                                <div className="space-y-1">
                                    <p className="font-black text-slate-800 text-lg sm:text-xl tracking-tight leading-tight">Your Company Name</p>
                                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">Contact details from system settings</p>
                                </div>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-40">Bill To</Label>
                                <div className="space-y-1">
                                    <p className="font-black text-slate-800 text-lg sm:text-xl tracking-tight leading-tight">{selectedInvoice.customer}</p>
                                    <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-medium">Contact details on file</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="rounded-2xl border overflow-x-auto scrollbar-thin shadow-sm">
                            <div className="min-w-[600px]">
                                <Table>
                                    <TableHeader className="bg-slate-900 text-white">
                                        <TableRow className="hover:bg-slate-900 border-none">
                                            <TableHead className="w-12 font-bold text-white/60">#</TableHead>
                                            <TableHead className="font-bold text-white">Description</TableHead>
                                            <TableHead className="w-24 font-bold text-center text-white">Qty</TableHead>
                                            <TableHead className="w-32 font-bold text-right text-white">Rate (₹)</TableHead>
                                            <TableHead className="w-32 font-bold text-right text-white">Amount (₹)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedInvoice.items.map((item, idx) => (
                                            <TableRow key={item.id} className="hover:bg-transparent border-slate-100">
                                                <TableCell className="font-mono text-slate-400 text-xs">{idx + 1}</TableCell>
                                                <TableCell className="font-bold text-slate-800 text-sm">{item.desc}</TableCell>
                                                <TableCell className="text-center font-bold text-sm">{item.qty}</TableCell>
                                                <TableCell className="text-right font-medium text-sm">₹{item.rate}</TableCell>
                                                <TableCell className="text-right font-black tracking-tight italic text-sm">₹{item.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Totals & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-muted/40 border-l-4 border-blue-600 space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Terms & Payment Info</h4>
                                    <p className="text-xs leading-loose font-medium text-slate-600 italic">
                                        {selectedInvoice.notes || "No specific payment terms provided."}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
                                        <CreditCard className="h-8 w-8" />
                                    </div>
                                    <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
                                        <Coins className="h-8 w-8" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-lg">
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">Subtotal</span>
                                    <span className="font-black">{selectedInvoice.amount}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2 border-b-2 border-slate-100">
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">+ GST (18%)</span>
                                    <span className="font-black text-rose-500">{selectedInvoice.tax}</span>
                                </div>
                                <div className="flex justify-between items-end px-4 py-4 rounded-2xl text-white shadow-xl" style={{ background: 'var(--primary)' }}>
                                    <span className="font-black italic text-xl tracking-tighter">TOTAL AMOUNT</span>
                                    <span className="text-4xl font-black tracking-tighter">{selectedInvoice.amount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans italic">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">Revenue Ledger</h1>
                </div>
                <PageActionButtons
                    buttons={[
                        {
                            label: "Export GST",
                            icon: Download,
                            variant: "outline",
                            onClick: () => console.log("Export GST")
                        },
                        {
                            label: "New Invoice",
                            icon: Plus,
                            onClick: () => setViewMode('create')
                        }
                    ]}
                />
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center bg-card/40 p-4 rounded-2xl border backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search invoice #, customer name, date..." className="pl-9 h-11 border-none bg-muted/50 focus-visible:ring-blue-500/20" />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-11 gap-2 border-none bg-muted/50">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                    <Button variant="outline" size="sm" className="h-11 gap-2 border-none bg-muted/50">
                        <Settings2 className="h-4 w-4" /> Columns
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-xl shadow-slate-200/50 overflow-hidden">
                <DataGrid
                    data={invoices}
                    columns={[
                        {
                            key: "id",
                            label: "Invoice #",
                            render: (val: any, inv: any) => (
                                <span onClick={() => { setSelectedInvoice(inv); setViewMode('view') }} className="font-mono font-bold text-slate-900 hover:underline cursor-pointer tracking-tight underline-offset-2 decoration-slate-200">
                                    {val}
                                </span>
                            )
                        },
                        {
                            key: "date",
                            label: "Date",
                            render: (val: any, inv: any) => (
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-slate-700">{val}</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Due: {inv.dueDate}</p>
                                </div>
                            )
                        },
                        {
                            key: "customer",
                            label: "Customer",
                            className: "font-black text-slate-800"
                        },
                        {
                            key: "jobRef",
                            label: "Job Ref",
                            render: (val: any) => (
                                <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 border-slate-200 text-slate-500">{val}</Badge>
                            )
                        },
                        {
                            key: "amount",
                            label: "Amount",
                            render: (val: any, inv: any) => (
                                <div className="space-y-0.5">
                                    <p className="font-black text-slate-800 tracking-tighter italic">{val}</p>
                                    <p className="text-[10px] font-bold text-rose-500 opacity-80">Tax: {inv.tax}</p>
                                </div>
                            )
                        },
                        {
                            key: "status",
                            label: "Status",
                            render: (val: any) => (
                                <Badge
                                    className={`rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest ${val === 'Paid'
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                        }`}
                                >
                                    {val}
                                </Badge>
                            )
                        },
                        {
                            key: "id",
                            label: "Actions",
                            headerClassName: "text-right",
                            className: "text-right",
                            render: (_: any, inv: any) => (
                                <div className="flex items-center justify-end gap-1.5 px-2">
                                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-indigo-200 bg-white text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-none" title="View Full Invoice" onClick={() => { setSelectedInvoice(inv); setViewMode('view') }}>
                                        <FileText className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-500 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-none" title="Download PDF">
                                        <FileDown className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            )
                        }
                    ]}
                    searchPlaceholder="Search invoices, customers or amount..."
                    hideTitle={true}
                    enableDateRange={true}
                    dateFilterKey="date"
                />
            </div>
        </div>
    )
}
