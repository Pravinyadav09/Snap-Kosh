"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import {
    ChevronLeft,
    Calculator,
    Plus,
    Trash2,
    Save,
    FileText,
    Settings2,
    ImageIcon,
    ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type JobItem = {
    id: string
    description: string
    qty: number
    rate: number
    amount: number
}

export default function EditJobCardPage() {
    const router = useRouter()
    const params = useParams()
    const jobId = params.id as string

    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [customers, setCustomers] = useState<{ value: string; label: string }[]>([])

    // Form state - same as create page
    const [jobNumber, setJobNumber] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState("")
    const [machineType, setMachineType] = useState("Digital")
    const [dueDate, setDueDate] = useState("")
    const [jobStatus, setJobStatus] = useState("Pending")
    const [isApproved, setIsApproved] = useState(false)
    const [paperSize, setPaperSize] = useState("")
    const [paperType, setPaperType] = useState("")
    const [bookDetails, setBookDetails] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const estimatorRef = useRef<{ [key: number]: any }>({})

    const [items, setItems] = useState<JobItem[]>([
        { id: "1", description: "", qty: 0, rate: 0, amount: 0 }
    ])

    // Payment state
    const [advanceAmount, setAdvanceAmount] = useState<number>(0)
    const [paymentMode, setPaymentMode] = useState("Cash")
    const [paymentRef, setPaymentRef] = useState("")
    const [previousPayments, setPreviousPayments] = useState<any[]>([])

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
    const totalPaid = previousPayments.reduce((sum, p) => sum + p.amount, 0)

    // Load existing job data
    useEffect(() => {
        const init = async () => {
            try {
                // Fetch customers
                const custRes = await fetch(`${API_BASE}/api/Customers/lookup`)
                if (custRes.ok) {
                    const data = await custRes.json()
                    setCustomers((data || []).map((c: any) => ({ 
                        value: (c.value || c.Value || c.id || c.Id || "").toString(), 
                        label: c.label || c.Label || c.name || c.Name || "Unknown Client" 
                    })))
                }

                // Fetch the job
                const jobRes = await fetch(`${API_BASE}/api/jobcards/${jobId}`)
                if (jobRes.ok) {
                    const job = await jobRes.json()
                    console.log("Loaded Job Core Data:", job)

                    // Robust mapping for both camelCase and PascalCase
                    const jNum = job.jobNumber || job.JobNumber || ""
                    const cId = job.customerId || job.CustomerId || ""
                    const mType = job.machineType || job.MachineType || "Digital"
                    const dDate = job.dueDate || job.DueDate || ""
                    const jStatus = job.jobStatus || job.JobStatus || "Pending"
                    const jDesc = job.jobDescription || job.JobDescription || ""
                    const jQty = job.quantity || job.Quantity || 0
                    const jRate = job.rate || job.Rate || 0
                    const jPaperSize = job.paperSize || job.PaperSize || ""
                    const jPaperType = job.paperType || job.PaperType || ""
                    const jBookDetails = job.bookDetails || job.BookDetails || ""
                    const jIsApproved = job.isApproved !== undefined ? job.isApproved : (job.IsApproved || false)

                    let initialItems = []
                    try {
                        const parsed = JSON.parse(jDesc)
                        if (Array.isArray(parsed)) {
                            initialItems = parsed.map((item: any, idx: number) => ({
                                id: (idx + 1).toString(),
                                description: item.description || "Production Sequence",
                                qty: Number(item.qty) || 0,
                                rate: Number(item.rate) || 0,
                                amount: (Number(item.qty) || 0) * (Number(item.rate) || 0)
                            }))
                        } else {
                            throw new Error("Not an array")
                        }
                    } catch {
                        initialItems = [{
                            id: "1",
                            description: jDesc || "General Production",
                            qty: jQty,
                            rate: jRate,
                            amount: jQty * jRate,
                        }]
                    }
                    
                    setItems(initialItems)
                    setJobNumber(jNum)
                    setSelectedCustomer(cId.toString())
                    setMachineType(mType)
                    setDueDate(dDate ? dDate.split('T')[0] : "")
                    setJobStatus(jStatus)
                    setPaperSize(jPaperSize)
                    setPaperType(jPaperType)
                    setBookDetails(jBookDetails)
                    setIsApproved(jIsApproved)
                } else {
                    console.error("Failed to load job. Status:", jobRes.status)
                    toast.error("Could not load job data.")
                }

                // Fetch previous payments
                const payRes = await fetch(`${API_BASE}/api/payments/jobcard/${jobId}`)
                if (payRes.ok) {
                    const payments = await payRes.json()
                    setPreviousPayments(payments)
                }

            } catch (err) {
                console.error("Job load error:", err)
                toast.error("Network error loading job.")
            } finally {
                setIsFetching(false)
            }
        }
        init()
    }, [jobId])

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: "", qty: 1, rate: 0, amount: 0 }])
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const handleSave = async () => {
        if (!selectedCustomer) { toast.error("Assign a customer first."); return }
        setIsLoading(true)
        try {
            const payload = {
                id: parseInt(jobId),
                customerId: parseInt(selectedCustomer),
                jobNumber,
                jobDescription: items.length > 1 ? JSON.stringify(items) : (items[0]?.description || "General Production"),
                machineType,
                quantity: items[0]?.qty || 0,
                rate: items[0]?.rate || 0,
                dueDate: new Date(dueDate).toISOString(),
                jobStatus,
                paperSize,
                paperType,
                bookDetails,
                isApproved,
                isActive: true
            }
            const res = await fetch(`${API_BASE}/api/jobcards/${jobId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (res.ok) {
                // Upload new design file if one was selected
                if (files.length > 0) {
                    const fd = new FormData()
                    fd.append('file', files[0])
                    await fetch(`${API_BASE}/api/jobcards/${jobId}/upload-design`, {
                        method: 'POST',
                        body: fd,
                    })
                }

                // Record new payment if any
                if (advanceAmount > 0) {
                    await fetch(`${API_BASE}/api/payments`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            customerId: parseInt(selectedCustomer),
                            jobCardId: parseInt(jobId),
                            amount: advanceAmount,
                            paymentDate: new Date().toISOString(),
                            paymentMethod: paymentMode,
                            referenceNumber: paymentRef,
                            remarks: `Installment for Job Card #${jobNumber}`
                        })
                    })
                }

                toast.success("Job Ticket Updated", { description: "Production sequence modified." })
                router.push("/jobs")
            } else {
                toast.error("Update failed.")
            }
        } catch {
            toast.error("Factory link offline.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/jobcards/${jobId}/approve`, {
                method: "POST"
            })
            if (res.ok) {
                setIsApproved(true)
                toast.success("Job Ticket Approved", { description: "Visible in Client Portal now." })
            } else {
                toast.error("Approval failed.")
            }
        } catch {
            toast.error("Network error.")
        } finally {
            setIsLoading(true)
            // Refresh status
            setJobStatus("Approved")
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="text-center space-y-3">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Job Data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 pb-10 font-sans bg-[#F8FAFC] min-h-screen p-2 lg:p-4">
            {/* Page Header */}
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 border border-slate-200 bg-white shadow-sm rounded-xl hover:bg-slate-50 transition-all"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Job Ticket</h1>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{jobNumber}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownRegistrySelect
                        category="JobStatus"
                        value={jobStatus}
                        onValueChange={setJobStatus}
                        className="h-10 w-[150px] text-xs font-bold border-slate-200 rounded-xl bg-white"
                        fallbackOptions={[
                            { value: "Pending", label: "Pending" },
                            { value: "Designing", label: "Designing" },
                            { value: "Printing", label: "Printing" },
                            { value: "Finishing", label: "Finishing" },
                            { value: "Completed", label: "Completed" },
                            { value: "Dispatched", label: "Dispatched" },
                            { value: "Cancelled", label: "Cancelled" }
                        ]}
                    />


                    <Button
                        variant="ghost"
                        className="h-10 px-6 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl"
                        onClick={() => router.back()}
                    >
                        Discard Changes
                    </Button>
                    <Button
                        disabled={isLoading}
                        className="h-11 font-bold px-8 text-xs shadow-lg shadow-indigo-500/20 gap-2 text-white transition-all active:scale-95 rounded-xl bg-primary"
                        onClick={handleSave}
                    >
                        <Save className="h-4 w-4" />
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            {/* Main Form — identical to Create page */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12">
                    <Card className="shadow-2xl shadow-slate-200/50 border-none rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 sm:py-5 px-4 sm:px-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Ticket Identity</Label>
                                    <Input
                                        className="h-10 text-xs text-primary font-black bg-white border-slate-200 rounded-xl tracking-widest focus:bg-slate-50 transition-all shadow-sm"
                                        value={jobNumber}
                                        readOnly
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Client Assignment <span className="text-rose-500">*</span></Label>
                                    <SearchableSelect
                                        options={customers}
                                        value={selectedCustomer}
                                        placeholder="Select Business Unit"
                                        onValueChange={setSelectedCustomer}
                                        className="h-10 text-xs rounded-xl shadow-sm border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
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
                                            { value: "Flex", label: "Wide Format Inkjet" },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-2">
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
                            <div className="p-5 bg-white">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Production Specifications</h3>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 gap-2 font-bold px-4 bg-white border-slate-200 text-xs rounded-xl shadow-sm hover:bg-slate-50 transition-all text-primary"
                                        onClick={addItem}
                                    >
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
                                                    <TableCell className="py-2.5 px-6">
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
                                                            {/* Cost Estimator Popup */}
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
                                                                    <div className="p-4 border-b flex items-center gap-3 bg-slate-50">
                                                                        <Calculator className="h-5 w-5 text-primary" />
                                                                        <DialogTitle className="text-sm font-bold uppercase tracking-widest text-slate-900">Production Estimator Console</DialogTitle>
                                                                    </div>
                                                                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                                                        <CostEstimator
                                                                            initialQty={item.qty}
                                                                            initialRate={item.rate}
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
                                                                newItems[index].qty = Number(e.target.value)
                                                                newItems[index].amount = newItems[index].qty * newItems[index].rate
                                                                setItems(newItems)
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <Input
                                                            type="number"
                                                            className="h-10 text-center text-sm font-bold border border-slate-100 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 bg-slate-50/50 rounded-xl px-2 tabular-nums"
                                                            value={item.rate}
                                                            onChange={(e) => {
                                                                const newItems = [...items]
                                                                newItems[index].rate = Number(e.target.value)
                                                                newItems[index].amount = newItems[index].qty * newItems[index].rate
                                                                setItems(newItems)
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center py-4 font-bold text-slate-900 text-sm tabular-nums">
                                                        ₹{item.amount.toLocaleString()}
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

                        {/* Bottom: Instructions + Design File */}
                        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-slate-100 font-sans">
                            <div className="p-4 sm:p-6 bg-slate-50/30 border-b md:border-b-0 md:border-r border-slate-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Settings2 className="h-4 w-4 text-slate-400" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Special Instructions</span>
                                </div>
                                <Textarea
                                    className="min-h-[120px] bg-white border-slate-200 text-sm font-semibold text-slate-700 rounded-2xl focus-visible:ring-primary/20 p-4 transition-all"
                                    placeholder="Add specific instructions for pre-press, printing or binding team..."
                                />
                            </div>
                            <div className="p-4 sm:p-6 bg-slate-50/30 relative">
                                <div className="flex items-center gap-2 mb-4">
                                    <ImageIcon className="h-4 w-4 text-slate-400" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Design Ref Assets</span>
                                </div>
                                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-white hover:border-primary/30 transition-all cursor-pointer group bg-white/50 block relative overflow-hidden">
                                    <input
                                        type="file"
                                        multiple
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            if (e.target.files) setFiles(Array.from(e.target.files))
                                        }}
                                    />
                                    {files.length > 0 ? (
                                        <div className="flex flex-col items-center">
                                            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 w-fit mx-auto mb-3 text-primary">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <p className="text-[11px] font-bold uppercase text-slate-900 tracking-tight">
                                                {files.length} File(s) Selected
                                            </p>
                                            <p className="text-[10px] text-primary font-bold mt-2 tracking-tighter truncate w-full max-w-[200px]">
                                                {files.map(f => f.name).join(', ')}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 w-fit mx-auto mb-3 text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                <Plus className="h-6 w-6" />
                                            </div>
                                            <p className="text-[11px] font-bold uppercase text-slate-500 tracking-tight group-hover:text-slate-900 transition-colors">Replace Design File</p>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">CDR / PDF / AI · Max 50MB</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Payment / Finance Section */}
                        <div className="border-t border-slate-100 bg-emerald-50/10 p-4 sm:p-6">
                            <div className="flex flex-col lg:flex-row gap-6 items-start">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                                                <Calculator className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">Payment & Installment Record</h3>
                                        </div>
                                        {totalPaid > 0 && (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                                                Already Paid: ₹{totalPaid.toLocaleString()}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-slate-400">New Payment Amount (₹)</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                <Input 
                                                    type="number" 
                                                    className="h-10 pl-7 font-black text-emerald-600 border-slate-200 bg-white rounded-xl focus:ring-emerald-500/20" 
                                                    value={advanceAmount}
                                                    onChange={(e) => setAdvanceAmount(Number(e.target.value))}
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
                                    <div className="flex justify-between items-center text-slate-400 font-bold text-[10px] uppercase">
                                        <span>Total Paid</span>
                                        <span>- ₹{totalPaid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-600 font-black text-[10px] uppercase">
                                        <span>New Entry</span>
                                        <span>- ₹{advanceAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-[1px] bg-slate-100" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-900 font-bold text-[11px] uppercase">Balance Due</span>
                                        <span className="text-xl font-black text-slate-900">₹{(totalAmount - totalPaid - advanceAmount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
