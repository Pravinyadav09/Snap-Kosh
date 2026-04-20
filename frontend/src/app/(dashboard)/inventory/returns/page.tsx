"use client"

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect } from "react"
import { Plus, RefreshCcw, Undo2, Info, Package, Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function SupplierReturnsPage() {
    const [returns, setReturns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Lookup data
    const [lookups, setLookups] = useState({
        suppliers: [],
        inventory: []
    })

    // Form state
    const [formData, setFormData] = useState({
        supplierId: "",
        inventoryItemId: "",
        quantity: 0,
        returnDate: new Date().toISOString().split("T")[0],
        reason: "",
        debitNoteNumber: ""
    })

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const [returnsRes, suppliersRes, inventoryRes] = await Promise.all([
                fetch(`${API_BASE}/api/SupplierReturn`),
                fetch(`${API_BASE}/api/Suppliers/lookup`),
                fetch(`${API_BASE}/api/Inventory/lookup`)
            ])

            if (returnsRes.ok) setReturns(await returnsRes.json())
            
            if (suppliersRes.ok && inventoryRes.ok) {
                const suppData = await suppliersRes.json()
                const invData = await inventoryRes.json()
                setLookups({
                    suppliers: suppData.map((s: any) => ({ value: s.value?.toString() || "", label: s.label || s.name })),
                    inventory: invData.map((i: any) => ({ value: (i.value || i.id)?.toString() || "", label: i.label || i.name }))
                })
            }
        } catch (error) {
            toast.error("Failed to load return records from server.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleNewReturn = () => {
        setFormData({
            supplierId: "",
            inventoryItemId: "",
            quantity: 0,
            returnDate: new Date().toISOString().split("T")[0],
            reason: "",
            debitNoteNumber: ""
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.supplierId || !formData.inventoryItemId || formData.quantity <= 0) {
            toast.error("Please fill required fields and ensure quantity > 0")
            return
        }

        try {
            const response = await fetch(`${API_BASE}/api/SupplierReturn`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supplierId: parseInt(formData.supplierId),
                    inventoryItemId: parseInt(formData.inventoryItemId),
                    quantity: formData.quantity,
                    returnDate: formData.returnDate,
                    reason: formData.reason,
                    debitNoteNumber: formData.debitNoteNumber,
                    status: "Completed"
                })
            })

            if (response.ok) {
                toast.success("Goods return successfully recorded.")
                setIsDialogOpen(false)
                fetchData()
            } else {
                toast.error("Failed to initiate return. Check constraints.")
            }
        } catch (error) {
            toast.error("Critical failure during return process.")
        }
    }

    const cancelReturn = async (id: number) => {
        if (!confirm("Are you sure you want to delete this return record?")) return
        try {
            const response = await fetch(`${API_BASE}/api/SupplierReturn/${id}`, { method: "DELETE" })
            if (response.ok) {
                toast.success("Return record purged.")
                fetchData()
            } else {
                toast.error("Failed to delete record.")
            }
        } catch {
            toast.error("Network error.")
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            key: "returnDate",
            label: "Date",
            render: (v) => <span className="text-sm font-bold text-slate-500 font-sans">{new Date(v as string).toLocaleDateString()}</span>
        },
        {
            key: "supplierName",
            label: "Supplier Name",
            render: (v, i) => (
                <div className="flex flex-col font-sans">
                    <span className="font-bold text-sm text-slate-800">{v || "Unknown Vendor"}</span>
                    <span className="text-[10px] text-slate-400">Debit Note: {i.debitNoteNumber || "N/A"}</span>
                </div>
            )
        },
        {
            key: "itemName",
            label: "Material Description",
            render: (v, i) => (
                <div className="flex flex-col font-sans">
                    <span className="font-bold text-sm text-slate-800">{v || "-"}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[200px]">Reason: {i.reason || "N/A"}</span>
                </div>
            )
        },
        {
            key: "quantity",
            label: "Qty Returned",
            className: "text-right font-sans",
            render: (v) => <span className="font-bold text-base text-rose-600">-{v as number}</span>
        },
        {
            key: "status",
            label: "Status",
            className: "text-center font-sans",
            render: (v) => <Badge className="text-[10px] font-bold px-2 rounded-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{v as string}</Badge>
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (_, row) => (
                <div className="flex justify-end pr-2">
                    <Button variant="ghost" size="sm" onClick={() => cancelReturn(row.id)} className="text-slate-400 hover:text-rose-500 text-[10px] h-7 px-2">Void</Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Return to Supplier</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchData} className={cn("h-9 w-9 p-0 rounded-lg border-slate-200", isLoading && "animate-spin")}>
                        <RefreshCcw className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleNewReturn} className="h-9 px-6 text-white font-bold text-xs rounded-lg gap-2 shadow-sm transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                                <Undo2 className="h-4 w-4" /> New Return Entry
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden font-sans border border-slate-200 shadow-xl rounded-xl bg-white flex flex-col max-h-[92vh]">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 p-2 rounded-lg border bg-rose-50 flex items-center justify-center shadow-sm border-rose-100">
                                        <Undo2 className="h-5 w-5 text-rose-600" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold text-slate-800 leading-none">Record Supplier Return</DialogTitle>
                                        <DialogDescription className="text-xs text-slate-500 mt-1.5 font-sans">Log returned materials and adjust current inventory stock levels.</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1"><Users2 className="h-3 w-3" /> Supplier <span className="text-rose-500">*</span></Label>
                                        <SearchableSelect 
                                            options={lookups.suppliers} 
                                            value={formData.supplierId} 
                                            onValueChange={(v: string) => setFormData({...formData, supplierId: v})} 
                                            placeholder="Select Vendor" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600 flex items-center gap-1"><Package className="h-3 w-3" /> Material <span className="text-rose-500">*</span></Label>
                                        <SearchableSelect 
                                            options={lookups.inventory} 
                                            value={formData.inventoryItemId} 
                                            onValueChange={(v: string) => setFormData({...formData, inventoryItemId: v})} 
                                            placeholder="Select Material to Return" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Return Quantity <span className="text-rose-500">*</span></Label>
                                        <Input 
                                            type="number" 
                                            className="h-9 rounded-md border-slate-200 shadow-none text-sm font-bold px-3 bg-white text-rose-600" 
                                            placeholder="0" 
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Dispatch / Return Date</Label>
                                        <Input 
                                            type="date" 
                                            className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                            value={formData.returnDate}
                                            onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Debit Note Reference No.</Label>
                                        <Input 
                                            className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                            placeholder="e.g. DN-2026-X01" 
                                            value={formData.debitNoteNumber}
                                            onChange={(e) => setFormData({...formData, debitNoteNumber: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Reason for Return</Label>
                                        <Input 
                                            className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                            placeholder="Damaged print, Wrong GSM..." 
                                            value={formData.reason}
                                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-md border border-amber-100 text-[10px] font-bold text-amber-800">
                                    <Info className="h-4 w-4 shrink-0 text-amber-500" />
                                    Submitting this form will automatically deduct the specified quantity from your active warehouse stock. This action is tracked via system logs.
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-9 px-4 rounded-md text-xs font-bold text-slate-500 hover:bg-slate-100 font-sans uppercase tracking-wider w-full sm:w-auto">Cancel</Button>
                                <Button onClick={handleSubmit} className="h-9 px-8 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 font-sans w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                                    Confirm Return
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                <DataGrid 
                    data={returns} 
                    columns={columns} 
                    isLoading={isLoading} 
                    searchPlaceholder="Search return history..." 
                    hideTitle={true} 
                    toolbarClassName="px-5 py-3 border-b" 
                />
            </div>
        </div>
    )
}
