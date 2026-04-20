"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    Calculator,
    Plus,
    Trash2,
    Save,
    FileText,
    Calendar,
    Settings2,
    ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { CostEstimator } from "@/components/shared/cost-estimator"
import { toast } from "sonner"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { DropdownRegistrySelect } from "@/components/shared/dropdown-registry-select"
import { ClientPaymentStatus } from "@/components/shared/client-payment-status"

type JobItem = {
    id: string
    description: string
    qty: number | string
    rate: number | string
    amount: number | string
}

export default function CreateJobCardPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [customers, setCustomers] = useState<{value: string, label: string}[]>([])
    
    // Form state
    const [selectedCustomer, setSelectedCustomer] = useState("")
    const [machineType, setMachineType] = useState("Digital")
    const [dueDate, setDueDate] = useState("")
    const [ticketId, setTicketId] = useState("")
    const estimatorRef = useRef<{ [key: number]: any }>({})
    const [files, setFiles] = useState<File[]>([])
    
    const [items, setItems] = useState<JobItem[]>([
        { id: "1", description: "Standard Printing Job", qty: "", rate: "", amount: "" }
    ])

    // Payment/Advance state
    const [advanceAmount, setAdvanceAmount] = useState<number | string>("")
    const [paymentMode, setPaymentMode] = useState("Cash")
    const [paymentRef, setPaymentRef] = useState("")

    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount.toString()) || 0), 0)

    useEffect(() => {
        const fetchLookups = async () => {
            try {
                // Fetch Customers
                const res = await fetch(`${API_BASE}/api/Customers/lookup`)
                if (res.ok) {
                    const data = await res.json()
                    const mapped = (data || []).map((c: any) => ({ 
                        value: (c.value || c.Value || c.id || c.Id || "").toString(), 
                        label: c.label || c.Label || c.name || c.Name || "Unknown Client" 
                    }))
                    setCustomers(mapped)
                }

                // Fetch Next Job Ticket Number
                const nextRes = await fetch(`${API_BASE}/api/jobcards/next-id`)
                if (nextRes.ok) {
                    const { nextId } = await nextRes.json()
                    setTicketId(nextId)
                } else {
                    setTicketId(`JB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
                }
            } catch (err) { 
                console.error("Lookup fetch error:", err)
                toast.error("Systems partially offline.") 
            }
        }
        fetchLookups()
        
        // Default due date (7 days from now)
        const d = new Date()
        d.setDate(d.getDate() + 7)
        setDueDate(d.toISOString().split('T')[0])
    }, [])

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: "", qty: "", rate: "", amount: "" }])
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    return (
        <div className="space-y-1 pb-4 font-sans bg-white min-h-screen p-0 sm:p-1 lg:p-2">
            {/* Main Form */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-1">
                <div className="lg:col-span-12">
                    <Card className="shadow-2xl shadow-slate-200/50 border-none rounded-xl sm:rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 sm:py-5 px-2.5 sm:px-6 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Ticket Identity</Label>
                                    <Input 
                                        className="h-10 text-xs text-primary font-black bg-white border-slate-200 rounded-xl tracking-widest focus:bg-slate-50 transition-all shadow-sm" 
                                        value={ticketId} 
                                        onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                                        placeholder="JB-2026-0001"
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Client Assignment <span className="text-rose-500">*</span></Label>
                                    <SearchableSelect
                                        options={customers}
                                        value={selectedCustomer}
                                        placeholder="Select Business Unit"
                                        onValueChange={setSelectedCustomer}
                                        className="h-10 text-xs rounded-xl shadow-sm border-slate-200"
                                    />
                                </div>
                                <div className="space-y-0.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Machine Unit</Label>
                                        <DropdownRegistrySelect
                                            category="MachineType"
                                            value={machineType}
                                            onValueChange={setMachineType}
                                            placeholder="Select Machine"
                                            className="h-10 text-xs font-bold rounded-xl shadow-sm border-slate-200"
                                            fallbackOptions={[
                                            { value: "Digital", label: "Konica AccurioPress" },
                                            { value: "Offset", label: "Heidelberg GTO" },
                                            { value: "Flex", label: "Wide Format Inkjet" }
                                            ]}
                                        />
                                    </div>
                                <div className="space-y-0.5">
                                    <Label className="text-[10px] font-bold uppercase text-rose-400 tracking-widest">Delivery Deadline</Label>
                                    <Input 
                                        type="date" 
                                        className="h-10 text-xs bg-white border-slate-200 font-bold rounded-xl px-4 shadow-sm" 
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {selectedCustomer && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                    <ClientPaymentStatus customerId={selectedCustomer} layout="horizontal" />
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-3 sm:p-5 bg-white">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Production Specifications</h3>
                                    <Button size="sm" variant="outline" className="h-9 gap-2 font-bold px-4 bg-white border-slate-200 text-xs rounded-xl shadow-sm hover:bg-slate-50 transition-all text-primary" onClick={addItem}>
                                        <Plus className="h-4 w-4" /> Add Production Cell
                                    </Button>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm overflow-x-auto no-scrollbar">
                                    <Table className="min-w-[800px]">
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] py-4 px-6 h-12">Production Brief</TableHead>
                                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-center w-[120px] h-12">Target Qty</TableHead>
                                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-center w-[140px] h-12">Rate (₹)</TableHead>
                                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-center w-[160px] h-12">Amount (₹)</TableHead>
                                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-right px-6 w-[80px] h-12">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={item.id} className="group border-b last:border-0 hover:bg-slate-50/30 transition-colors">
                                                    <TableCell className="py-1.5 px-3 sm:px-6">
                                                        <div className="relative group/field flex items-center gap-3">
                                                            <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center text-primary font-bold text-xs">
                                                                #{index + 1}
                                                            </div>
                                                            <Textarea
                                                                placeholder="Paper Type, Size, Pages, Binding Specs..."
                                                                className="min-h-[40px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-sm font-semibold text-slate-700 placeholder:text-slate-300 pr-10"
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
                                                                        className="absolute top-0 right-0 h-8 w-8 text-primary hover:bg-primary/10 opacity-0 group-hover/field:opacity-100 transition-opacity rounded-lg"
                                                                    >
                                                                        <Calculator className="h-4 w-4" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[1200px] md:w-[1200px] p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white">
                                                                    <div className="p-4 border-b flex items-center gap-3 bg-slate-50 relative">
                                                                        <Calculator className="h-5 w-5 text-primary" />
                                                                        <DialogTitle className="text-sm font-bold uppercase tracking-widest text-slate-900">Production Estimator Console</DialogTitle>
                                                                    </div>
                                                                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                                                        <CostEstimator 
                                                                            initialQty={parseFloat(item.qty.toString()) || 0} 
                                                                            initialRate={parseFloat(item.rate.toString()) || 0} 
                                                                            initialDescription={item.description}
                                                                            onChange={(data) => { estimatorRef.current[index] = data }} 
                                                                        />
                                                                    </div>
                                                                    <DialogFooter className="p-4 px-6 border-t bg-slate-50">
                                                                        <DialogClose asChild>
                                                                            <Button 
                                                                                className="h-10 px-8 text-xs font-bold uppercase tracking-widest bg-primary text-white rounded-xl shadow-lg shadow-indigo-500/10"
                                                                                onClick={() => {
                                                                                    const data = estimatorRef.current[index]
                                                                                    if (data) {
                                                                                        const newItems = [...items]
                                                                                        if (data.splitItems && Array.isArray(data.splitItems) && data.splitItems.length > 1) {
                                                                                            // Replace single item at index with multiple split items
                                                                                            const expanded = data.splitItems.map((si: any, i: number) => ({
                                                                                                id: (Date.now() + i).toString(),
                                                                                                description: si.description,
                                                                                                qty: si.qty,
                                                                                                rate: si.rate,
                                                                                                amount: si.qty * si.rate
                                                                                            }));
                                                                                            newItems.splice(index, 1, ...expanded);
                                                                                            setItems(newItems)
                                                                                        } else {
                                                                                            // Standard single item update
                                                                                            newItems[index].qty = data.qty
                                                                                            newItems[index].rate = data.rate
                                                                                            newItems[index].amount = data.qty * data.rate
                                                                                            newItems[index].description = data.description
                                                                                            setItems(newItems)
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Apply To Item
                                                                            </Button>
                                                                        </DialogClose>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <Input
                                                            type="number"
                                                            className="h-10 text-center text-sm font-bold border border-slate-100 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 bg-slate-50/50 rounded-xl px-2 tabular-nums"
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
                                                    <TableCell className="text-center py-1.5">
                                                        <Input
                                                            type="number"
                                                            className="h-10 text-center text-sm font-bold border border-slate-100 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 bg-slate-50/50 rounded-xl px-2 tabular-nums"
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
                                                    <TableCell className="text-center py-4 font-bold text-slate-900 text-sm tabular-nums">
                                                        ₹{(parseFloat(item.amount.toString()) || 0).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right py-4 px-6">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>

                        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-slate-100 font-sans">
                            <div className="p-3 sm:p-4 bg-slate-50/30 border-b md:border-b-0 md:border-r border-slate-100">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Settings2 className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Special Instructions</span>
                                </div>
                                <Textarea 
                                    className="min-h-[40px] h-10 bg-white border-slate-200 text-sm font-semibold text-slate-700 rounded-xl focus-visible:ring-primary/20 p-2.5 transition-all"
                                    placeholder="Add team instructions..."
                                />
                            </div>
                            <div className="p-3 sm:p-4 bg-slate-50/30 relative">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Design Ref Assets</span>
                                </div>
                                <label className="border border-dashed border-slate-200 rounded-xl p-2 text-center hover:bg-white hover:border-primary/30 transition-all cursor-pointer group bg-white/50 block relative overflow-hidden h-10 flex items-center justify-center">
                                    <input 
                                        type="file" 
                                        multiple 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setFiles(Array.from(e.target.files))
                                            }
                                        }}
                                    />
                                    {files.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5 text-primary" />
                                            <p className="text-[10px] font-bold uppercase text-slate-900 truncate max-w-[150px]">
                                                {files.length} File(s) Selected
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Plus className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary" />
                                            <p className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-slate-900 transition-colors">Attach CDR / PDF / AI</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Advance Payment Section */}
                        <div className="border-t border-slate-100 bg-emerald-50/10 p-4 sm:p-5">
                            <div className="flex flex-col lg:flex-row gap-4 items-start">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                                            <Calculator className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">Advance / Payment Record</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-slate-400">Advance Amount (₹)</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                <Input 
                                                    type="number" 
                                                    className="h-10 pl-7 font-black text-emerald-600 border-slate-200 bg-white rounded-xl focus:ring-emerald-500/20" 
                                                    value={advanceAmount}
                                                    onChange={(e) => setAdvanceAmount(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                             <Label className="text-[10px] font-bold uppercase text-slate-400">Payment Mode</Label>
                                             <DropdownRegistrySelect
                                                 category="PaymentMode"
                                                 value={paymentMode}
                                                 onValueChange={setPaymentMode}
                                                 className="h-10 rounded-xl"
                                                 fallbackOptions={[
                                                    { value: "Cash", label: "Cash" },
                                                    { value: "UPI", label: "UPI / QR" },
                                                    { value: "Bank Transfer", label: "NEFT / RTGS" },
                                                    { value: "Cheque", label: "Cheque" }
                                                ]}
                                             />
                                         </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-slate-400">Transaction Ref / UTR</Label>
                                            <Input 
                                                className="h-10 font-bold border-slate-200 bg-white rounded-xl uppercase tracking-wider" 
                                                placeholder="REF# 12345"
                                                value={paymentRef}
                                                onChange={(e) => setPaymentRef(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full lg:w-64 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                                    <div className="flex justify-between items-center text-slate-400 font-bold text-[10px] uppercase">
                                        <span>Job Total</span>
                                        <span>₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-600 font-black text-[10px] uppercase">
                                        <span>Advance</span>
                                        <span>- ₹{advanceAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-[1px] bg-slate-100" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-900 font-bold text-[11px] uppercase">Balance Due</span>
                                        <span className="text-xl font-black text-slate-900">₹{(totalAmount - (parseFloat(advanceAmount.toString()) || 0)).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Form Action Buttons */}
                        <div className="border-t border-slate-100 bg-white p-4 sm:p-5 flex items-center justify-end gap-3 rounded-b-2xl">
                            <Button variant="ghost" className="h-10 px-6 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl" onClick={() => router.back()}>
                                Discard Ticket
                            </Button>
                            <Button
                                disabled={isLoading}
                                className="h-11 font-bold px-8 text-xs shadow-lg shadow-indigo-500/20 gap-2 text-white transition-all active:scale-95 rounded-xl bg-primary"
                                onClick={async () => {
                                    if (!selectedCustomer) { toast.error("Assign a customer first."); return }
                                    setIsLoading(true)
                                    try {
                                        const payload = {
                                            customerId: parseInt(selectedCustomer),
                                            jobNumber: ticketId,
                                            jobDescription: items.length > 1 ? JSON.stringify(items) : (items[0]?.description || "General Production"),
                                            machineType: machineType,
                                            quantity: items[0]?.qty || 0,
                                            rate: items[0]?.rate || 0,
                                            dueDate: new Date(dueDate).toISOString(),
                                            jobStatus: "Pending"
                                        }
                                        const res = await fetch(`${API_BASE}/api/jobcards`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(payload)
                                        })
                                        if (res.ok) {
                                            const created = await res.json()
                                            const newId = created.id
        
                                            // Upload design file if selected
                                            if (files.length > 0 && newId) {
                                                const fd = new FormData()
                                                fd.append('file', files[0])
                                                await fetch(`${API_BASE}/api/jobcards/${newId}/upload-design`, {
                                                    method: 'POST',
                                                    body: fd,
                                                })
                                            }
        
                                            // Record advance payment if any
                                            if ((parseFloat(advanceAmount.toString()) || 0) > 0) {
                                                await fetch(`${API_BASE}/api/payments`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        customerId: parseInt(selectedCustomer),
                                                        jobCardId: newId,
                                                        amount: parseFloat(advanceAmount.toString()) || 0,
                                                        paymentDate: new Date().toISOString(),
                                                        paymentMethod: paymentMode,
                                                        referenceNumber: paymentRef,
                                                        remarks: `Advance for Job Card #${ticketId}`
                                                    })
                                                })
                                            }
        
                                            toast.success("Job Ticket Authorized", { description: "Production sequence initiated." })
                                            router.push("/jobs")
                                        } else {
                                            toast.error("Ticket authorization failed.")
                                        }
                                    } catch {
                                        toast.error("Factory link offline.")
                                    } finally {
                                        setIsLoading(false)
                                    }
                                }}
                            >
                                <Save className="h-4 w-4" /> Finalize & Start Job
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
