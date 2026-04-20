"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, Suspense } from "react"

import { useRouter, useSearchParams } from "next/navigation"
import {
    ChevronLeft,
    Calculator,
    Plus,
    Trash2,
    Save,
    Printer,
    FileText,
    User,
    Calendar,
    Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CostEstimator } from "@/components/shared/cost-estimator"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { ClientPaymentStatus } from "@/components/shared/client-payment-status"

type QuoteItem = {
    id: string
    description: string
    qty: number | string
    rate: number | string
    amount: number | string
}

export default function CreateQuotationPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Initializing Estimator Console...</div>}>
            <CreateQuotationContent />
        </Suspense>
    )
}

function CreateQuotationContent() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [customers, setCustomers] = useState<{value: string, label: string}[]>([])
    const [systemUsers, setSystemUsers] = useState<{value: string, label: string}[]>([])
    
    // Form state
    const [selectedCustomer, setSelectedCustomer] = useState("")
    const [deliveryDate, setDeliveryDate] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    const [description, setDescription] = useState("")
    const [quotationNumber, setQuotationNumber] = useState("Loading...")
    const [receivedBy, setReceivedBy] = useState("")
    
    const [items, setItems] = useState<QuoteItem[]>([
        { id: "1", description: "", qty: "", rate: "", amount: "" }
    ])
    
    // Settings state
    const [prefix, setPrefix] = useState("QT/")
    const [footerNote, setFooterNote] = useState("")
    
    // Estimator Modal State
    const [currentEstimate, setCurrentEstimate] = useState<{qty: number, rate: number, description: string, splitItems?: any[]} | null>(null)
    
    // Memoized callback to prevent infinite loops from inline functions
    const handleEstimateChange = React.useCallback((data: {qty: number, rate: number, description: string, splitItems?: any[]}) => {
        setCurrentEstimate(data)
    }, [])

    const searchParams = useSearchParams()
    const editId = searchParams.get("id")

    useEffect(() => {
        const fetchEditData = async () => {
            if (!editId || editId === 'undefined') return
            try {
                const res = await fetch(`${API_BASE}/api/Quotations/${editId}`)
                if (res.ok) {
                    const q = await res.json()
                    setSelectedCustomer(q.customerId.toString())
                    setQuotationNumber(q.quotationNumber || "QT-REF")
                    if (q.validTill) {
                        setDeliveryDate(new Date(q.validTill).toISOString().split('T')[0])
                    }
                    setReceivedBy(q.receivedBy || "")
                    
                    try {
                        const parsedItems = JSON.parse(q.description)
                        if (Array.isArray(parsedItems)) {
                            setItems(parsedItems.map((item: any, idx: number) => ({
                                id: (idx + 1).toString(),
                                description: item.description || "",
                                qty: item.qty || 1,
                                rate: item.rate || 0,
                                amount: item.amount || (parseFloat(item.qty) * parseFloat(item.rate)) || 0
                            })))
                        } else {
                            throw new Error("JSON is not array")
                        }
                    } catch (e) {
                        setItems([{
                            id: "1",
                            description: q.description || "",
                            qty: 1,
                            rate: q.quotedPrice || 0,
                            amount: q.quotedPrice || 0
                        }])
                    }
                }
            } catch (err) {
                console.error("Edit fetch error:", err)
            }
        }

        const fetchLookups = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/Customers/lookup`)
                if (res.ok) {
                    const data = await res.json()
                    const mapped = data.map((c: any) => ({ 
                        value: (c.value ?? c.Value ?? c.id ?? c.Id ?? "").toString(), 
                        label: c.label ?? c.Label ?? c.name ?? c.Name ?? "Unknown Client" 
                    }))
                    setCustomers(mapped)
                }
            } catch (err) {
                console.error("Customer fetch error:", err)
            }

            try {
                const res = await fetch(`${API_BASE}/api/users/lookup`)
                if (res.ok) {
                    const data = await res.json()
                    setSystemUsers(data)
                }
            } catch (err) {
                console.error("User fetch error:", err)
            }
              try {
                const settingsRes = await fetch(`${API_BASE}/api/settings`)
                if (settingsRes.ok) {
                    const settings: any[] = await settingsRes.json()
                    const getSet = (k: string) => {
                        const s = settings.find(x => (x.key || x.Key || "").toLowerCase() === k.toLowerCase())
                        return s?.value ?? s?.Value ?? ""
                    }
                    
                    setPrefix(getSet("quotation_prefix") || "QT/")
                    setFooterNote(getSet("quotation_footer") || "")
                }
            } catch (err) {
                console.warn("Settings fetch failed.")
            }

            try {
                const numRes = await fetch(`${API_BASE}/api/quotations/next-number`)
                if (numRes.ok) {
                    const data = await numRes.json()
                    setQuotationNumber(data.nextNumber)
                }
            } catch (err) {
                console.warn("Next number fetch failed.")
            }
        }
        
        fetchLookups()
        fetchEditData()
    }, [editId])

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: "", qty: "", rate: "", amount: "" }])
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.amount.toString()) || 0), 0)
    const taxRate = 0.18
    const taxAmount = subtotal * taxRate
    const grandTotal = subtotal + taxAmount

    return (
        <div className="space-y-3 pb-20 sm:pb-10 px-0 sm:px-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-1 gap-3 sm:gap-4 font-sans py-2 sm:py-0 border-b sm:border-b-0 bg-white sm:bg-transparent sticky top-0 sm:relative z-40">
                <div className="flex items-center gap-2.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border bg-background shadow-sm rounded-full shrink-0"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 leading-none">{editId && editId !== 'undefined' ? "Edit Quotation" : "Create Quotation"}</h1>
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mt-1">Proposal Console</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest border border-slate-200 flex-1 sm:flex-none bg-white" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button
                        disabled={isLoading}
                        className="h-9 font-bold px-5 text-[10px] uppercase tracking-widest shadow-md gap-2 text-white transition-all active:scale-95 flex-1 sm:flex-none"
                        style={{ background: 'var(--primary)' }}
                        onClick={async () => {
                            if (!selectedCustomer) { toast.error("Select a target client."); return }
                            setIsLoading(true)
                            try {
                                const payload = {
                                    customerId: parseInt(selectedCustomer),
                                    description: JSON.stringify(items.map(i => ({
                                        description: i.description || "Printing Services",
                                        qty: parseFloat(i.qty.toString()) || 0,
                                        rate: parseFloat(i.rate.toString()) || 0,
                                        amount: (parseFloat(i.qty.toString()) || 0) * (parseFloat(i.rate.toString()) || 0)
                                    }))),
                                    quotedPrice: grandTotal,
                                    estimatedCost: subtotal,
                                    validTill: new Date(deliveryDate).toISOString(),
                                    receivedBy: receivedBy,
                                    status: "Draft",
                                    isActive: true
                                }
                                
                                if (editId && editId !== 'undefined') {
                                    (payload as any).id = parseInt(editId)
                                }

                                const res = await fetch(`${API_BASE}/api/quotations${editId && editId !== 'undefined' ? `/${editId}` : ''}`, {
                                    method: editId && editId !== 'undefined' ? "PUT" : "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                })
                                if (res.ok) {
                                    toast.success("Proposal Manifest Salvaged", { description: "Quotation has been successfully committed to the ledger." })
                                    router.push("/estimator")
                                } else {
                                    toast.error("Manifest rejected by server.")
                                }
                            } catch {
                                toast.error("System communication failure.")
                            } finally {
                                setIsLoading(false)
                            }
                        }}
                    >
                        <Save className="h-3.5 w-3.5" /> <span>Save Draft</span>
                    </Button>
                </div>
            </div>

            {/* Main Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-3 sm:px-0">
                <div className="lg:col-span-12">
                    <Card className="shadow-lg border-none ring-1 ring-slate-200 ring-inset">
                        <CardHeader className="bg-slate-50 border-b py-4 px-4 sm:py-3 sm:px-5">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Quotation No.</Label>
                                        <Input 
                                            className="h-10 sm:h-9 text-xs font-bold bg-white text-primary/60 border-slate-200 rounded-lg shadow-sm" 
                                            value={quotationNumber} 
                                            readOnly 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Customer <span className="text-rose-500">*</span></Label>
                                        <SearchableSelect
                                            options={customers}
                                            value={selectedCustomer}
                                            placeholder="Select Customer"
                                            onValueChange={setSelectedCustomer}
                                            className="h-10 sm:h-9 text-xs font-bold rounded-lg shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Date</Label>
                                        <Input type="date" className="h-10 sm:h-9 text-xs bg-white py-1 rounded-lg shadow-sm" defaultValue={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Delivery Date</Label>
                                        <Input 
                                            type="date" 
                                            className="h-10 sm:h-9 text-xs bg-white py-1 rounded-lg shadow-sm" 
                                            value={deliveryDate} 
                                            onChange={(e) => setDeliveryDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Received By</Label>
                                        <SearchableSelect
                                            options={systemUsers}
                                            value={receivedBy}
                                            placeholder="Select User"
                                            onValueChange={setReceivedBy}
                                            className="h-10 sm:h-9 text-xs font-bold rounded-lg shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="w-full">
                                    <ClientPaymentStatus customerId={selectedCustomer} layout="horizontal" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-4 bg-slate-50/50">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        Items & Estimation
                                    </h3>
                                    <Button size="sm" variant="outline" className="h-8 gap-1.5 font-bold px-4 bg-white border border-indigo-100 text-[10px] shadow-sm rounded-lg text-indigo-600 hover:bg-indigo-50" onClick={addItem}>
                                        <Plus className="h-3.5 w-3.5" /> Add Item
                                    </Button>
                                </div>

                                {/* Desktop Table View */}
                                <div className="!hidden lg:!block rounded-lg border bg-white overflow-hidden shadow-sm overflow-x-auto no-scrollbar">
                                     <Table className="min-w-[800px]">
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] py-2 px-5 h-10">Description</TableHead>
                                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-center w-[100px] h-10">Qty</TableHead>
                                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-center w-[120px] h-10">Rate (₹)</TableHead>
                                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-center w-[140px] h-10">Amount (₹)</TableHead>
                                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-right px-5 w-[70px] h-10">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                         <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={item.id} className="group border-b last:border-0 hover:bg-slate-50/50">
                                                    <TableCell className="p-2 px-5">
                                                        <div className="relative group/field">
                                                            <Textarea
                                                                placeholder="Item Details, Specs, Sizes..."
                                                                className="min-h-[40px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-[13px] font-medium pr-8"
                                                                value={item.description}
                                                                onChange={(e) => {
                                                                    const newItems = [...items]
                                                                    newItems[index].description = e.target.value
                                                                    setItems(newItems)
                                                                }}
                                                            />
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute top-0 right-0 h-6 w-6 text-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-md border border-primary/10"
                                                                    >
                                                                        <Calculator className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[1200px] md:w-[1200px] p-0 overflow-hidden rounded-lg border border-slate-200 shadow-2xl bg-white">
                                                                    <DialogHeader className="px-5 py-3 text-left border-b border-slate-100 bg-white font-sans">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="p-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                                                                                <Calculator className="h-3.5 w-3.5" />
                                                                            </div>
                                                                            <DialogTitle className="text-sm font-bold tracking-tight text-slate-800 uppercase leading-none">Production Cost Estimator</DialogTitle>
                                                                        </div>
                                                                    </DialogHeader>
                                                                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                                                        <CostEstimator 
                                                                            onChange={handleEstimateChange} 
                                                                            initialQty={parseFloat(item.qty.toString()) || 0}
                                                                            initialRate={parseFloat(item.rate.toString()) || 0}
                                                                            initialDescription={item.description}
                                                                        />
                                                                    </div>
                                                                    <DialogFooter className="p-3 flex flex-row items-center justify-end gap-2 px-5 border-t border-slate-100 bg-slate-50/50">
                                                                        <DialogTrigger asChild>
                                                                            <Button variant="outline" className="h-7 px-3 rounded-md text-[10px] font-medium text-slate-500 border-slate-200 bg-white">
                                                                                Close
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogTrigger asChild>
                                                                            <Button 
                                                                                className="h-7 px-4 rounded-md bg-primary hover:opacity-90 font-semibold text-[10px] text-white shadow-sm transition-all text-primary-foreground"
                                                                                onClick={() => {
                                                                                    if (currentEstimate) {
                                                                                        const sis = currentEstimate.splitItems;
                                                                                        if (sis && sis.length > 0) {
                                                                                            const newItems = [...items]
                                                                                            newItems[index] = {
                                                                                                ...newItems[index],
                                                                                                description: sis[0].description,
                                                                                                qty: sis[0].qty,
                                                                                                rate: sis[0].rate,
                                                                                                amount: (parseFloat(sis[0].qty) || 0) * (parseFloat(sis[0].rate) || 0)
                                                                                            };
                                                                                            if (sis.length > 1) {
                                                                                                const extra = sis.slice(1).map((s: any, i: number) => ({
                                                                                                    id: (Date.now() + i).toString(),
                                                                                                    description: s.description,
                                                                                                    qty: s.qty,
                                                                                                    rate: s.rate,
                                                                                                    amount: (parseFloat(s.qty) || 0) * (parseFloat(s.rate) || 0)
                                                                                                }));
                                                                                                newItems.splice(index + 1, 0, ...extra);
                                                                                            }
                                                                                            setItems(newItems)
                                                                                        } else {
                                                                                            const newItems = [...items]
                                                                                            newItems[index].description = currentEstimate.description
                                                                                            newItems[index].qty = currentEstimate.qty
                                                                                            newItems[index].rate = currentEstimate.rate
                                                                                            newItems[index].amount = (parseFloat(currentEstimate.qty.toString()) || 0) * (parseFloat(currentEstimate.rate.toString()) || 0)
                                                                                            setItems(newItems)
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Apply Estimates
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center p-2">
                                                        <Input
                                                            type="number"
                                                            className="h-8 text-center text-xs font-bold border-none shadow-none focus-visible:ring-1 bg-transparent px-1"
                                                            value={item.qty}
                                                            onChange={(e) => {
                                                                const newItems = [...items]
                                                                newItems[index].qty = e.target.value
                                                                const r = parseFloat(newItems[index].rate.toString()) || 0
                                                                const q = parseFloat(e.target.value) || 0
                                                                newItems[index].amount = q * r
                                                                setItems(newItems)
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center p-2">
                                                        <Input
                                                            type="number"
                                                            className="h-8 text-center text-xs font-medium border-none shadow-none focus-visible:ring-1 bg-transparent px-1"
                                                            value={item.rate}
                                                            onChange={(e) => {
                                                                const newItems = [...items]
                                                                newItems[index].rate = e.target.value
                                                                const q = parseFloat(newItems[index].qty.toString()) || 0
                                                                const r = parseFloat(e.target.value) || 0
                                                                newItems[index].amount = q * r
                                                                setItems(newItems)
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center p-2 font-bold text-slate-800 text-xs">
                                                        ₹{(parseFloat(item.amount.toString()) || 0).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right p-2 px-5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                         </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View for Items */}
                                <div className="lg:hidden space-y-4">
                                    {items.map((item, index) => (
                                        <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20" />
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Description</Label>
                                                    <div className="relative">
                                                        <Textarea
                                                            placeholder="Item Details..."
                                                            className="min-h-[60px] text-xs font-bold bg-slate-50 border-slate-100 rounded-lg pr-10"
                                                            value={item.description}
                                                            onChange={(e) => {
                                                                const newItems = [...items]
                                                                newItems[index].description = e.target.value
                                                                setItems(newItems)
                                                            }}
                                                        />
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 h-7 w-7 text-indigo-600 bg-white border-indigo-100 shadow-sm rounded-md"
                                                                >
                                                                    <Calculator className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-xl">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                                                                        <Calculator className="h-4 w-4 text-indigo-500" /> Estimator
                                                                    </DialogTitle>
                                                                </DialogHeader>
                                                                <div className="max-h-[70vh] overflow-y-auto">
                                                                    <CostEstimator 
                                                                        onChange={handleEstimateChange} 
                                                                        initialQty={parseFloat(item.qty.toString()) || 0}
                                                                        initialRate={parseFloat(item.rate.toString()) || 0}
                                                                        initialDescription={item.description}
                                                                    />
                                                                </div>
                                                                <DialogFooter className="flex-row gap-2">
                                                                    <DialogTrigger asChild><Button variant="outline" className="flex-1 h-10 text-xs font-bold uppercase">Close</Button></DialogTrigger>
                                                                    <DialogTrigger asChild>
                                                                        <Button 
                                                                            className="flex-1 h-10 text-xs font-bold uppercase bg-indigo-600"
                                                                            onClick={() => {
                                                                                if (currentEstimate) {
                                                                                    const sis = currentEstimate.splitItems;
                                                                                    if (sis && sis.length > 0) {
                                                                                        const newItems = [...items]
                                                                                        newItems[index] = {
                                                                                            ...newItems[index],
                                                                                            description: sis[0].description,
                                                                                            qty: sis[0].qty,
                                                                                            rate: sis[0].rate,
                                                                                            amount: (parseFloat(sis[0].qty) || 0) * (parseFloat(sis[0].rate) || 0)
                                                                                        };
                                                                                        if (sis.length > 1) {
                                                                                            const extra = sis.slice(1).map((s: any, i: number) => ({
                                                                                                id: (Date.now() + i).toString(),
                                                                                                description: s.description,
                                                                                                qty: s.qty,
                                                                                                rate: s.rate,
                                                                                                amount: (parseFloat(s.qty) || 0) * (parseFloat(s.rate) || 0)
                                                                                            }));
                                                                                            newItems.splice(index + 1, 0, ...extra);
                                                                                        }
                                                                                        setItems(newItems)
                                                                                    } else {
                                                                                        const newItems = [...items]
                                                                                        newItems[index].description = currentEstimate.description
                                                                                        newItems[index].qty = currentEstimate.qty
                                                                                        newItems[index].rate = currentEstimate.rate
                                                                                        newItems[index].amount = (parseFloat(currentEstimate.qty.toString()) || 0) * (parseFloat(currentEstimate.rate.toString()) || 0)
                                                                                        setItems(newItems)
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >Apply</Button>
                                                                    </DialogTrigger>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-rose-500 bg-rose-50 rounded-lg shrink-0"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty</Label>
                                                    <Input
                                                        type="number"
                                                        className="h-10 text-xs font-black bg-slate-50 border-slate-100 rounded-lg text-center"
                                                        value={item.qty}
                                                        onChange={(e) => {
                                                            const newItems = [...items]
                                                            newItems[index].qty = e.target.value
                                                            const r = parseFloat(newItems[index].rate.toString()) || 0
                                                            const q = parseFloat(e.target.value) || 0
                                                            newItems[index].amount = q * r
                                                            setItems(newItems)
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        className="h-10 text-xs font-bold bg-slate-50 border-slate-100 rounded-lg text-center"
                                                        value={item.rate}
                                                        onChange={(e) => {
                                                            const newItems = [...items]
                                                            newItems[index].rate = e.target.value
                                                            const q = parseFloat(newItems[index].qty.toString()) || 0
                                                            const r = parseFloat(e.target.value) || 0
                                                            newItems[index].amount = q * r
                                                            setItems(newItems)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-lg mt-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Amount</span>
                                                <span className="text-sm font-black tabular-nums">₹{(parseFloat(item.amount.toString()) || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-12 border-t">
                            <div className="md:col-span-8 p-5 bg-slate-50/30">
                                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Quotations Terms & Notes</Label>
                                <div className="space-y-3">
                                    <Textarea
                                        placeholder="Enter custom payment terms..."
                                        className="min-h-[120px] sm:min-h-[100px] bg-white border-slate-200 text-xs rounded-xl resize-none p-4 font-medium leading-relaxed shadow-sm"
                                        value={footerNote}
                                        onChange={(e) => setFooterNote(e.target.value)}
                                    />
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                        Default terms will apply if left blank
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-4 p-5 sm:p-6 space-y-4 border-t sm:border-t-0 sm:border-l bg-slate-50/10">
                                <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest">Subtotal:</span>
                                    <span className="font-black text-slate-900 text-sm">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tax Type:</span>
                                        <SearchableSelect
                                            options={[
                                                { value: "gst-18", label: "GST 18%" },
                                                { value: "gst-12", label: "GST 12%" },
                                                { value: "no-tax", label: "No Tax" }
                                            ]}
                                            value="gst-18"
                                            onValueChange={(val: any) => console.log(val)}
                                            placeholder="Tax Type"
                                            className="h-8 w-32 text-[10px] font-black py-0 bg-white rounded-lg shadow-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">Tax Amount:</span>
                                        <span className="font-black text-slate-900 text-sm">₹{taxAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                                <Separator className="bg-slate-200" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-black text-slate-900 uppercase tracking-widest text-[11px] sm:text-[12px]">Grand Total:</span>
                                    <span className="font-black text-xl sm:text-2xl text-indigo-600 tabular-nums">₹{grandTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
