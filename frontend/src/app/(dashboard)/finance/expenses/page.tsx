"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
    Plus, Receipt, Wallet, Info, FileText,
    Edit, Trash2, CheckCircle, Search,
    IndianRupee, Calendar, CreditCard, Tag,
    Clock, ShieldCheck, Upload, Eye, User, Landmark
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/shared/searchable-select"
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Activity } from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────
type Expense = {
    _dbId: number
    id: string
    date: string
    title: string
    category: string
    reference: string
    paymentMethod: string
    notes: string
    isGstBill: boolean
    vendorId: string
    amount: number
    expenseDate: string // ISO string for editing
    paidTo: string
    recordedBy: string
    status: string
    receiptUrl: string | null
    department: string
}

type Category = { id: number; name: string }

const PAYMENT_METHODS = [
    { value: "Cash", label: "Cash" },
    { value: "UPI", label: "UPI / Online" },
    { value: "Bank", label: "Bank Transfer" },
    { value: "Cheque", label: "Cheque" },
]

// ─── Expense Form Dialog ─────────────────────────────────────────────────────
function ExpenseFormDialog({
    expense,
    categories,
    onSave,
    onClose,
}: {
    expense?: Expense | null
    categories: Category[]
    onSave: () => void
    onClose: () => void
}) {
    const isEdit = !!expense

    const [title, setTitle] = useState(expense?.title ?? "")
    const [category, setCategory] = useState(expense?.category ?? "")
    const [amount, setAmount] = useState(expense ? String(expense.amount) : "")
    const [expenseDate, setExpenseDate] = useState(
        expense?.expenseDate
            ? expense.expenseDate.split("T")[0]
            : new Date().toISOString().split("T")[0]
    )
    const [paymentMethod, setPaymentMethod] = useState(expense?.paymentMethod ?? "Cash")
    const [reference, setReference] = useState(expense?.reference !== "-" ? expense?.reference ?? "" : "")
    const [notes, setNotes] = useState(expense?.notes ?? "")
    const [isGst, setIsGst] = useState(expense?.isGstBill ?? false)
    const [paidTo, setPaidTo] = useState(expense?.paidTo ?? "")
    const [recordedBy, setRecordedBy] = useState(expense?.recordedBy ?? "Pravin Yadav")
    const [status, setStatus] = useState(expense?.status ?? "Approved")
    const [department, setDepartment] = useState(expense?.department ?? "General")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (expense) {
            setTitle(expense.title)
            setAmount(String(expense.amount))
            setCategory(expense.category)
            setExpenseDate(expense.expenseDate.split("T")[0])
            setPaymentMethod(expense.paymentMethod)
            setReference(expense.reference !== "-" ? expense.reference : "")
            setNotes(expense.notes)
            setIsGst(expense.isGstBill)
            setPaidTo(expense.paidTo)
            setRecordedBy(expense.recordedBy)
            setStatus(expense.status)
            setDepartment(expense.department)
            setSelectedFile(null)
        } else {
            setTitle("")
            setAmount("")
            setCategory("")
            setExpenseDate(new Date().toISOString().split("T")[0])
            setPaymentMethod("Cash")
            setReference("")
            setNotes("")
            setIsGst(false)
            setPaidTo("")
            setRecordedBy("Pravin Yadav")
            setStatus("Approved")
            setDepartment("General")
            setSelectedFile(null)
        }
    }, [expense])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleSave = async () => {
        if (!title.trim()) { toast.error("Expense title is required"); return }
        if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return }
        if (!category) { toast.error("Select a category"); return }
        if (!paidTo.trim()) { toast.error("Specify who was paid"); return }

        setIsSaving(true)
        let finalReceiptUrl = expense?.receiptUrl ?? null

        // 1. Upload file if selected
        if (selectedFile) {
            try {
                const formData = new FormData()
                formData.append("file", selectedFile)
                const res = await fetch(`${API_BASE}/api/expenses/upload`, {
                    method: "POST",
                    body: formData
                })
                if (res.ok) {
                    const data = await res.json()
                    finalReceiptUrl = data.Url || data.url
                } else {
                    toast.error("Receipt upload failed — saving record without file")
                }
            } catch {
                toast.error("Network error during file upload")
            }
        }

        const payload = {
            id: expense?._dbId ?? 0,
            title: title.trim(),
            category: category,
            amount: parseFloat(amount),
            expenseDate: new Date(expenseDate).toISOString(),
            paymentMethod: paymentMethod,
            referenceNumber: reference.trim() || null,
            isGstBill: isGst,
            vendorId: null,
            paidTo: paidTo.trim(),
            recordedBy: recordedBy.trim(),
            status: status,
            department: department,
            receiptUrl: finalReceiptUrl,
            notes: notes.trim(),
            createdAt: new Date().toISOString(),
            isActive: true,
        }

        try {
            const url = isEdit
                ? `${API_BASE}/api/Expenses/${expense!._dbId}`
                : `${API_BASE}/api/Expenses`
            const method = isEdit ? "PUT" : "POST"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (res.ok || res.status === 204) {
                toast.success(isEdit ? "Expense Updated" : "Expense Recorded", {
                    description: isEdit ? "Changes saved successfully." : "New expenditure logged.",
                })
                onSave()
                onClose()
            } else {
                const err = await res.json().catch(() => ({ Error: "Unknown error" }))
                toast.error(err.Error || "Failed to save expense")
            }
        } catch {
            toast.error("Network error — check backend connection")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[680px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-xl bg-white max-h-[90vh] flex flex-col font-sans">
            <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                        <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-bold text-slate-800 leading-none">
                            {isEdit ? "Edit Expense" : "Record New Expense"}
                        </DialogTitle>
                        <DialogDescription className="hidden">Expense record information form.</DialogDescription>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                            {isEdit ? `Editing: ${expense!.title}` : "Track new expenditure for accurate accounting."}
                        </p>
                    </div>
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-6 space-y-6">
                    {/* Section 1: Expense Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Expense Details</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-xs font-medium text-slate-600">Expense Title <span className="text-rose-500">*</span></Label>
                                <Input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Printer Paper Bundle"
                                    className="h-9 border-slate-200 bg-slate-50/50 font-medium text-sm focus:bg-white transition-all rounded-lg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Category <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={categories.map(c => ({ value: c.name, label: c.name }))}
                                    placeholder="Select Category"
                                    value={category}
                                    onValueChange={setCategory}
                                    className="h-9 rounded-lg border-slate-200 bg-slate-50 font-medium text-xs shadow-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Paid To / Vendor <span className="text-rose-500">*</span></Label>
                                <Input
                                    value={paidTo}
                                    onChange={e => setPaidTo(e.target.value)}
                                    placeholder="e.g. Office Supplies Ltd"
                                    className="h-9 border-slate-200 bg-slate-50/50 font-medium text-sm rounded-lg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Department</Label>
                                <SearchableSelect
                                    options={[
                                        { value: "Office", label: "Office & Admin" },
                                        { value: "Production", label: "Production/Factory" },
                                        { value: "Sales", label: "Sales & Marketing" },
                                        { value: "Transport", label: "Transport/Logistics" },
                                        { value: "General", label: "General" }
                                    ]}
                                    value={department}
                                    onValueChange={setDepartment}
                                    className="h-9 rounded-lg border-slate-200 bg-slate-50 font-medium text-xs shadow-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Transaction Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Wallet className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Transaction Details</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Amount (₹) <span className="text-rose-500">*</span></Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="h-9 border-slate-200 bg-white font-bold text-sm text-emerald-600 rounded-lg"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Date <span className="text-rose-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={expenseDate}
                                    onChange={e => setExpenseDate(e.target.value)}
                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-lg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Payment Method</Label>
                                <SearchableSelect
                                    options={PAYMENT_METHODS}
                                    placeholder="Select Method"
                                    value={paymentMethod}
                                    onValueChange={setPaymentMethod}
                                    className="h-9 rounded-lg border-slate-200 bg-white font-medium text-xs shadow-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Reference / Bill Number</Label>
                            <Input
                                value={reference}
                                onChange={e => setReference(e.target.value)}
                                placeholder="Enter Reference No."
                                className="h-9 border-slate-200 bg-white font-medium text-sm rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Receipt Upload */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Upload className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Supporting Document</span>
                        </div>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30 flex flex-col items-center justify-center gap-2 group hover:border-primary/40 transition-all cursor-pointer"
                        >
                            <div className="p-3 rounded-full bg-white border border-slate-100 shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                                {selectedFile ? <FileText className="h-5 w-5 text-emerald-500" /> : <Plus className="h-5 w-5" />}
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-600">
                                    {selectedFile ? selectedFile.name : "Click to upload Receipt / Bill"}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "PNG, JPG or PDF up to 5MB"}
                                </p>
                            </div>
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*,.pdf" 
                            />
                        </div>
                    </div>

                    {/* Status & Review */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Audit & Review</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Payment Status</Label>
                                <div className="flex gap-2">
                                    {["Approved", "Pending"].map(s => (
                                        <Button
                                            key={s}
                                            variant="outline"
                                            onClick={() => setStatus(s)}
                                            className={`flex-1 h-9 text-[11px] font-bold rounded-lg border transition-all ${status === s
                                                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                                }`}
                                        >
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Recorded By</Label>
                                <div className="flex items-center gap-2 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600">{recordedBy}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GST Toggle */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg transition-colors ${isGst ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>
                                <CheckCircle className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Has GST Bill?</p>
                                <p className="text-[10px] text-slate-400 font-medium">For Input Tax Credit calculation</p>
                            </div>
                        </div>
                        <Checkbox
                            checked={isGst}
                            onCheckedChange={(v: boolean) => setIsGst(v)}
                            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                    </div>
                </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-2">
                <Button variant="ghost" className="h-9 px-4 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800" onClick={onClose} disabled={isSaving}>
                    Discard
                </Button>
                <Button
                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-lg transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: "var(--primary)" }}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : isEdit ? "Update Expense" : "Save Expense"}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/expense-categories`)
            if (res.ok) setCategories(await res.json())
        } catch { }
    }, [])

    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/Expenses`)
            if (res.ok) {
                const data = await res.json()
                const mapped: Expense[] = data.map((e: any) => ({
                    _dbId: e.id ?? e.Id ?? 0,
                    id: `EXP-${String(e.id ?? e.Id ?? 0).padStart(3, "0")}`,
                    date: new Date(e.expenseDate ?? e.ExpenseDate).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                    }),
                    expenseDate: e.expenseDate ?? e.ExpenseDate ?? new Date().toISOString(),
                    title: e.title ?? e.Title ?? "Untitled",
                    category: e.category ?? e.Category ?? "-",
                    reference: e.referenceNumber ?? e.ReferenceNumber ?? "-",
                    paymentMethod: e.paymentMethod ?? e.PaymentMethod ?? "Cash",
                    notes: e.notes ?? e.Notes ?? "",
                    isGstBill: e.isGstBill ?? e.IsGstBill ?? false,
                    vendorId: e.vendorId ?? e.VendorId ?? "",
                    paidTo: e.paidTo ?? e.PaidTo ?? "-",
                    recordedBy: e.recordedBy ?? e.RecordedBy ?? "System",
                    status: e.status ?? e.Status ?? "Approved",
                    receiptUrl: e.receiptUrl ?? e.ReceiptUrl ?? null,
                    department: e.department ?? e.Department ?? "General",
                    amount: e.amount ?? e.Amount ?? 0,
                }))
                setExpenses(mapped)
            } else {
                toast.error("Could not load expenses")
            }
        } catch {
            toast.error("Network error — check backend connection")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchExpenses()
        fetchCategories()
    }, [fetchExpenses, fetchCategories])

    const handleDelete = async (dbId: number) => {
        if (!confirm("Are you sure you want to delete this expense?")) return
        try {
            const res = await fetch(`${API_BASE}/api/Expenses/${dbId}`, { method: "DELETE" })
            if (res.ok || res.status === 204) {
                toast.success("Expense Deleted")
                fetchExpenses()
            } else {
                toast.error("Failed to delete expense")
            }
        } catch {
            toast.error("Network error")
        }
    }

    const openAdd = () => { setEditingExpense(null); setIsDialogOpen(true) }
    const openEdit = (exp: Expense) => { setEditingExpense(exp); setIsDialogOpen(true) }

    // Summary stats
    const totalAmount = expenses.reduce((s, e) => s + e.amount, 0)
    const gstCount = expenses.filter(e => e.isGstBill).length
    const thisMonthAmount = expenses
        .filter(e => {
            const d = new Date(e.expenseDate)
            const now = new Date()
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        .reduce((s, e) => s + e.amount, 0)

    const todayAmount = expenses
        .filter(e => {
            const d = new Date(e.expenseDate).toDateString()
            const now = new Date().toDateString()
            return d === now
        })
        .reduce((s, e) => s + e.amount, 0)

    const largestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0

    const columns: ColumnDef<Expense>[] = [
        {
            key: "id",
            label: "Ref ID",
            render: (val) => <span className="text-xs font-mono text-slate-400">{val}</span>,
        },
        {
            key: "date",
            label: "Date",
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">{val}</span>
                </div>
            ),
        },
        {
            key: "title",
            label: "Expense Description",
            render: (val, row) => (
                <div className="flex flex-col gap-0.5 py-0.5">
                    <span className="font-bold text-sm text-slate-800">{val}</span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> {row.paymentMethod}
                        {row.reference !== "-" && <span className="ml-1 text-slate-300">• {row.reference}</span>}
                    </span>
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (val, row) => (
                <div className="flex flex-col items-start gap-1">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase bg-slate-50 border-slate-200 text-slate-500 tracking-wide rounded-md">
                        {val as string}
                        {row.department !== "General" && <span className="ml-1 opacity-60">• {row.department}</span>}
                    </Badge>
                    <div className="flex gap-1">
                        {row.isGstBill && (
                            <Badge className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md px-1.5">
                                GST
                            </Badge>
                        )}
                        <Badge className={`text-[9px] font-bold border rounded-md px-1.5 ${
                            row.status === "Approved" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            row.status === "Pending" ? "bg-orange-50 text-orange-600 border-orange-100" :
                            "bg-slate-50 text-slate-500 border-slate-100"
                        }`}>
                            {row.status}
                        </Badge>
                    </div>
                </div>
            ),
        },
        {
            key: "recordedBy",
            label: "Recorded By",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {String(val).charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-500">{val as string}</span>
                </div>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            render: (val) => (
                <span className="font-black text-base text-rose-600 tracking-tight flex items-center gap-0.5">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            key: "actions" as any,
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: (_: any, row: Expense) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button
                        size="icon" variant="outline"
                        className="h-7 w-7 rounded-md bg-white border-slate-200 text-slate-400 hover:text-primary transition-all hover:scale-105"
                        title="View Receipt"
                        onClick={() => {
                            if (row.receiptUrl) {
                                setPreviewUrl(row.receiptUrl)
                                setIsPreviewOpen(true)
                            } else {
                                toast.info("No receipt document linked to this record.")
                            }
                        }}
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="icon" variant="outline"
                        className="h-7 w-7 rounded-md bg-white shadow-none transition-all hover:scale-105"
                        style={{ color: "var(--primary)", borderColor: "color-mix(in srgb, var(--primary), white 70%)" }}
                        title="Edit Expense"
                        onClick={() => openEdit(row)}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="icon" variant="outline"
                        className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-none hover:scale-105"
                        title="Delete Expense"
                        onClick={() => handleDelete(row._dbId)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">Expense Board</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={openAdd}
                            className="h-9 px-5 rounded-lg font-bold gap-2 shadow-sm transition-all text-white text-xs active:scale-95 w-full sm:w-auto"
                            style={{ background: "var(--primary)" }}
                        >
                            <Plus className="h-4 w-4" /> New Expense
                        </Button>
                    </DialogTrigger>
                    <ExpenseFormDialog
                        expense={editingExpense}
                        categories={categories}
                        onSave={fetchExpenses}
                        onClose={() => setIsDialogOpen(false)}
                    />
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
                {/* 1. Total Expenses */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <IndianRupee className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">Total Expense</p>
                        <div className="text-base font-black truncate leading-none mb-1.5">₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">All-Time</p>
                    </CardContent>
                </Card>

                {/* 2. This Month */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Calendar className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">This Month</p>
                        <div className="text-base font-black truncate leading-none mb-1.5">₹{thisMonthAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">Monthly Spends</p>
                    </CardContent>
                </Card>

                {/* 3. GST Bills */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Tag className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">GST Invoices</p>
                        <div className="text-base font-black leading-none mb-1.5">{gstCount} Invoices</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">Tax Linked</p>
                    </CardContent>
                </Card>

                {/* 4. Today's Burn */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Clock className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">Today's Spends</p>
                        <div className="text-base font-black truncate leading-none mb-1.5">₹{todayAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">Daily Burn</p>
                    </CardContent>
                </Card>

                {/* 5. Largest Outflow */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Activity className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">Largest Single</p>
                        <div className="text-base font-black truncate leading-none mb-1.5">₹{largestExpense.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">Peak Outflow</p>
                    </CardContent>
                </Card>

                {/* 6. Verification Index */}
                <Card className="border-none shadow-sm rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <ShieldCheck className="size-8" />
                    </div>
                    <CardContent className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1 leading-none">Verified Status</p>
                        <div className="text-base font-black leading-none mb-1.5">100%</div>
                        <p className="text-[8px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded-md uppercase tracking-tighter leading-none">Audit Ready</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <DataGrid
                    data={expenses}
                    columns={columns}
                    isLoading={isLoading}
                    enableDateRange={true}
                    dateFilterKey="date"
                    searchPlaceholder="Search expenses by title, category..."
                />
            </div>

            {/* Receipt Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-2xl">
                    <DialogHeader className="p-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-slate-900 text-white">
                                <Eye className="h-4 w-4" />
                            </div>
                            <DialogTitle className="text-slate-900 text-sm font-black">Document Preview</DialogTitle>
                            <DialogDescription className="hidden">Detailed document review.</DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className="p-4 flex items-center justify-center min-h-[400px] bg-slate-50/30">
                        {previewUrl ? (
                            previewUrl.endsWith(".pdf") ? (
                                <iframe 
                                    src={previewUrl.startsWith("blob:") || previewUrl.startsWith("http") ? previewUrl : `${API_BASE}${previewUrl}`} 
                                    className="w-full h-[70vh] rounded-xl border border-slate-200 shadow-sm bg-white" 
                                />
                            ) : (
                                <img 
                                    src={previewUrl.startsWith("blob:") || previewUrl.startsWith("http") ? previewUrl : `${API_BASE}${previewUrl}`} 
                                    alt="Receipt" 
                                    className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-slate-100" 
                                />
                            )
                        ) : (
                            <div className="text-center text-slate-400 space-y-2">
                                <FileText className="h-10 w-10 mx-auto opacity-20" />
                                <p className="text-sm font-medium">Preview Unavailable</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
