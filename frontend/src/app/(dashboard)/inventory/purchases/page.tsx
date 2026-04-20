"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useMemo, useEffect, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Icons are imported from lucide-react (correcting p.tsx error from lucide-center)
import { 
    Plus as PlusIcon, 
    ShoppingCart as ShopIcon, 
    Trash2 as TrashIcon, 
    Edit as EditIcon, 
    RefreshCcw as RefreshIcon, 
    Package as PackIcon, 
    Info as InfoIcon, 
    PlusCircle as PlusCircleIcon, 
    Search as SearchIcon,
    Printer as PrinterIcon
} from "lucide-react"
import Link from "next/link"

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isGst, setIsGst] = useState(false)
    const [editingPurchase, setEditingPurchase] = useState<any>(null)
    const [items, setItems] = useState<any[]>([{ id: "1", inventoryItemId: "", quantity: 0, unitPrice: 0, subtotal: 0 }])
    
    const [lookups, setLookups] = useState<{ suppliers: any[], products: any[] }>({ suppliers: [], products: [] })
    const [procurement, setProcurement] = useState({ supplierId: "", purchaseNumber: "", purchaseDate: new Date().toISOString().split('T')[0] })

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [pRes, sRes, iRes] = await Promise.all([
                fetch(`${API_BASE}/api/purchases`),
                fetch(`${API_BASE}/api/suppliers/lookup`),
                fetch(`${API_BASE}/api/Inventory/lookup`)
            ])
            
            if (pRes.ok) setPurchases(await pRes.json())
            if (sRes.ok) {
                const supplierData = await sRes.json()
                setLookups(prev => ({ ...prev, suppliers: supplierData.map((s: any) => ({ label: s.label || s.name, value: (s.value || s.id)?.toString() || "" })) }))
            }
            if (iRes.ok) {
                const itemData = await iRes.json()
                setLookups(prev => ({ ...prev, products: itemData.map((v: any) => ({ 
                    label: v.label || v.name, 
                    value: (v.value || v.id)?.toString() || "",
                    rate: v.rate || 0
                })) }))
            }
        } catch { toast.error("Communication failure with procurement server.") }
        finally { setIsLoading(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const totals = useMemo(() => {
        const amount = items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0)
        const tax = isGst ? amount * 0.18 : 0
        return { amount, tax, total: amount + tax }
    }, [items, isGst])

    const addItem = () => setItems([...items, { id: Math.random().toString(), inventoryItemId: "", quantity: 0, unitPrice: 0, subtotal: 0 }])
    const removeItem = (id: string) => items.length > 1 && setItems(items.filter(i => i.id !== id))

    const updateItem = (id: string, field: string, val: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: val }
                
                // Auto-fill rate if material is selected
                if (field === 'inventoryItemId' && val) {
                    const product = lookups.products.find(p => p.value === val)
                    if (product) {
                        updated.unitPrice = product.rate || 0
                        // Recalculate subtotal immediately
                        updated.subtotal = (updated.quantity || 0) * (updated.unitPrice || 0)
                    }
                }

                if (field === 'quantity' || field === 'unitPrice') {
                    updated.subtotal = (updated.quantity || 0) * (updated.unitPrice || 0)
                }
                return updated
            }
            return item
        }))
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this purchase record?")) return
        try {
            const res = await fetch(`${API_BASE}/api/purchases/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Record removed")
                fetchData()
            }
        } catch {
            toast.error("Failed to delete record")
        }
    }

    const handleEdit = (p: any) => {
        setEditingPurchase(p)
        setProcurement({
            supplierId: p.supplierId?.toString() || "",
            purchaseNumber: p.purchaseNumber || "",
            purchaseDate: p.purchaseDate ? p.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0]
        })
        setItems([{
            id: p.id?.toString() || "",
            inventoryItemId: p.inventoryItemId?.toString() || "",
            quantity: p.quantity || 0,
            unitPrice: p.rate || 0,
            subtotal: p.totalAmount || 0
        }])
        setIsGst(p.taxRate > 0)
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!procurement.supplierId) {
            toast.error("Please identify the material supplier.")
            return
        }

        const validItems = items.filter(i => i.inventoryItemId && i.quantity > 0)
        if (validItems.length === 0) {
            toast.error("Material manifest cannot be empty.")
            return
        }

        try {
            setIsLoading(true)
            
            // Helper to extract numeric ID from prefixed string (e.g. INV:4 -> 4)
            const getRawId = (prefixedId: string) => {
                if (!prefixedId) return 0;
                const match = prefixedId.match(/\d+$/);
                return match ? parseInt(match[0]) : 0;
            };

            if (editingPurchase) {
                // Update single record
                const item = validItems[0]
                const payload = {
                    supplierId: parseInt(procurement.supplierId),
                    inventoryItemId: getRawId(item.inventoryItemId),
                    quantity: item.quantity,
                    receivedQuantity: editingPurchase.receivedQuantity || 0,
                    rate: item.unitPrice,
                    taxRate: isGst ? 18 : 0,
                    taxAmount: isGst ? (item.quantity * item.unitPrice) * 0.18 : 0,
                    totalAmount: (item.quantity * item.unitPrice) * (isGst ? 1.18 : 1),
                    purchaseNumber: procurement.purchaseNumber,
                    purchaseDate: new Date(procurement.purchaseDate).toISOString(),
                    status: editingPurchase.status
                }

                const res = await fetch(`${API_BASE}/api/purchases/${editingPurchase.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || "Failed to update purchase record.");
                }
            } else {
                // Bulk Create
                for (const item of validItems) {
                    const payload = {
                        supplierId: parseInt(procurement.supplierId),
                        inventoryItemId: getRawId(item.inventoryItemId),
                        quantity: item.quantity,
                        receivedQuantity: 0,
                        rate: item.unitPrice,
                        taxRate: isGst ? 18 : 0,
                        taxAmount: isGst ? (item.quantity * item.unitPrice) * 0.18 : 0,
                        totalAmount: (item.quantity * item.unitPrice) * (isGst ? 1.18 : 1),
                        purchaseNumber: procurement.purchaseNumber,
                        purchaseDate: new Date(procurement.purchaseDate).toISOString(),
                        status: "Pending"
                    }

                    const res = await fetch(`${API_BASE}/api/purchases`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    })

                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(errorData.message || "Failed to create one or more purchase records.");
                    }
                }
            }

            toast.success(editingPurchase ? "Record updated." : "Inventory replenished successfully.")
            setIsDialogOpen(false)
            setEditingPurchase(null)
            fetchData()
            setItems([{ id: "1", inventoryItemId: "", quantity: 0, unitPrice: 0, subtotal: 0 }])
        } catch {
            toast.error("Critical failure during procurement commit.")
        } finally {
            setIsLoading(false)
        }
    }

    const columns: ColumnDef<any>[] = [
        { key: "purchaseDate", label: "Date", render: (v) => <span className="text-xs font-bold text-slate-500">{new Date(v as string).toLocaleDateString()}</span> },
        { 
            key: "supplierName", 
            label: "Supplier", 
            render: (v, i) => (
                <div className="flex items-center gap-3 font-sans">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><ShopIcon className="h-4 w-4" /></div>
                    <div className="flex flex-col"><span className="font-bold text-sm text-slate-800">{v || "Direct Supplier"}</span><span className="text-[10px] text-slate-400">UID: #{i.id} | Bill: {i.purchaseNumber}</span></div>
                </div>
            ) 
        },
        { key: "itemName", label: "Material", render: (v) => <span className="text-sm font-semibold text-slate-700">{v || "-"}</span> },
        { key: "quantity", label: "Qty", className: "text-right", render: (v) => <span className="font-bold text-sm text-slate-600">{(v as number).toLocaleString()}</span> },
        { key: "rate", label: "Rate (₹)", className: "text-right", render: (v) => <span className="font-bold text-sm text-slate-600">₹{(v as number).toLocaleString()}</span> },
        { key: "taxAmount", label: "Tax", className: "text-right", render: (v) => <span className="font-bold text-sm text-slate-400">₹{(v as number).toLocaleString()}</span> },
        { key: "totalAmount", label: "Total Amount", className: "text-right", render: (v) => <span className="font-black text-sm text-slate-900">₹{(v as number).toLocaleString()}</span> },
        { 
            key: "status", 
            label: "Status", 
            render: (v) => (
                <Badge className={cn(
                    "text-[9px] font-black uppercase tracking-wider h-5 rounded-sm px-2",
                    v === 'Completed' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                )}>
                    {v || 'Pending'}
                </Badge>
            )
        },
        { 
            key: "actions", 
            label: "Actions", 
            className: "text-right", 
            render: (v, i) => (
                <div className="flex justify-end gap-1 px-1">
                    <Link href={`/print/purchase/${i.id}`} target="_blank">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600"><PrinterIcon className="h-4 w-4" /></Button>
                    </Link>
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(i)} className="h-8 w-8 text-slate-400 hover:text-indigo-600"><EditIcon className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(i.id)} className="h-8 w-8 text-slate-400 hover:text-rose-500"><TrashIcon className="h-4 w-4" /></Button>
                </div>
            ) 
        }
    ]

    return (
        <div className="space-y-2 font-sans px-1">
            <div className="flex flex-row items-center justify-between gap-2 font-sans mb-1">
                <div className="text-left">
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase leading-none">Purchase Orders</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchData} className="h-9 w-9 p-0 rounded-lg"><RefreshIcon className="h-4 w-4" /></Button>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingPurchase(null); }}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-6 text-white font-bold text-xs rounded-lg gap-2 shadow-sm" style={{ background: "var(--primary)" }} onClick={() => {
                                setEditingPurchase(null);
                                const nextNum = (purchases.length + 1).toString().padStart(4, '0');
                                setProcurement({ 
                                    supplierId: "", 
                                    purchaseNumber: `PO-${nextNum}`, 
                                    purchaseDate: new Date().toISOString().split('T')[0] 
                                });
                                setItems([{ id: "1", inventoryItemId: "", quantity: 0, unitPrice: 0, subtotal: 0 }]);
                            }}>
                                <PlusIcon className="h-4 w-4" /> New Purchase
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden font-sans border border-slate-200 shadow-xl rounded-xl bg-white flex flex-col max-h-[92vh]">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white relative">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        <ShopIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold text-slate-800 leading-none uppercase tracking-tight">{editingPurchase ? "Update Purchase Entry" : "New Purchase Protocol"}</DialogTitle>
                                        <DialogDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{editingPurchase ? "Modify institutional procurement record" : "Initialize material procurement record"}</DialogDescription>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-12">
                                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 bg-slate-50 uppercase tracking-widest px-2.5 h-6 rounded-sm">PO-2026</Badge>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                {/* SECTION 1: PROCUREMENT DETAILS */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <InfoIcon className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Procurement Logistics</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Supplier Name <span className="text-rose-500">*</span></Label>
                                            <SearchableSelect 
                                                options={lookups.suppliers} 
                                                value={procurement.supplierId}
                                                placeholder="Identify source..." 
                                                onValueChange={(v) => setProcurement({...procurement, supplierId: v})} 
                                                className="h-9 rounded-md border-slate-200 bg-white font-medium text-sm shadow-none" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Reference No.</Label>
                                            <Input 
                                                className="h-9 rounded-md border-slate-200 bg-white font-medium text-sm px-3" 
                                                placeholder="PO-0000" 
                                                value={procurement.purchaseNumber}
                                                onChange={(e) => setProcurement({...procurement, purchaseNumber: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Filing Date <span className="text-rose-500">*</span></Label>
                                            <Input 
                                                type="date" 
                                                className="h-9 rounded-md border-slate-200 bg-white font-medium text-sm px-3" 
                                                value={procurement.purchaseDate}
                                                onChange={(e) => setProcurement({...procurement, purchaseDate: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: TAX & BILLING */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <PackIcon className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tax & Financial Defaults</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-between">
                                            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setIsGst(!isGst)}>
                                                <Checkbox id="isGst" checked={isGst} onCheckedChange={(v: boolean) => setIsGst(v)} className={cn("h-4 w-4 rounded border-slate-300", isGst && "bg-emerald-500 border-emerald-500")} />
                                                <Label htmlFor="isGst" className="text-xs font-medium text-slate-600 cursor-pointer">Enable GST Billing (18%)</Label>
                                            </div>
                                            {isGst && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase text-[9px] tracking-wider px-2 h-5 rounded-sm">Registered</Badge>}
                                        </div>
                                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-between shadow-sm">
                                            <span className="text-xs font-bold text-emerald-700">Gross Payable Amount:</span>
                                            <span className="text-lg font-black text-emerald-700 tracking-tighter">₹{totals.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: INVENTORY ITEMS */}
                                <div className="space-y-4 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1">
                                            <PlusCircleIcon className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Material Items Entry</span>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold rounded-md px-3 border-slate-200 hover:bg-slate-50 transition-all font-sans" onClick={addItem}>
                                            <PlusCircleIcon className="h-3 w-3 mr-1.5 text-indigo-500" /> Add New Row
                                        </Button>
                                    </div>

                                    <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm bg-white">
                                        <Table>
                                            <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                                                <TableRow className="hover:bg-transparent border-0 h-10">
                                                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-6 font-sans">Material Description</TableHead>
                                                    <TableHead className="text-center w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Qty</TableHead>
                                                    <TableHead className="text-center w-[150px] text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Rate (₹)</TableHead>
                                                    <TableHead className="text-right w-[150px] text-[10px] font-bold uppercase tracking-wider text-slate-400 pr-8 font-sans">Subtotal</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {items.map((item, idx) => (
                                                    <TableRow key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/20 transition-colors">
                                                        <TableCell className="px-6 py-3">
                                                            <div className="flex items-center gap-3 font-sans">
                                                                <SearchableSelect 
                                                                    options={lookups.products} 
                                                                    value={item.inventoryItemId}
                                                                    placeholder="Select material..." 
                                                                    onValueChange={(v) => updateItem(item.id, 'inventoryItemId', v)} 
                                                                    className="h-8 border-slate-100 shadow-none bg-transparent hover:bg-white text-xs rounded-md" 
                                                                />
                                                                <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)} className="h-7 w-7 text-slate-300 hover:text-rose-500"><TrashIcon className="h-4 w-4" /></Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="p-0 text-center font-sans">
                                                            <Input 
                                                                type="number" 
                                                                className="h-8 w-20 mx-auto text-center text-xs font-bold border-slate-100 rounded-md shadow-none focus:bg-white bg-transparent" 
                                                                value={item.quantity} 
                                                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-0 text-center font-sans">
                                                            <Input 
                                                                type="number" 
                                                                className="h-8 w-24 mx-auto text-center text-xs font-bold border-slate-100 rounded-md shadow-none focus:bg-white bg-transparent" 
                                                                value={item.unitPrice} 
                                                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-8 py-3 text-right text-xs font-black text-slate-700 tracking-tight font-sans">
                                                            ₹{item.subtotal.toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>

                             <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                                 <Button variant="ghost" onClick={() => { setIsDialogOpen(false); setEditingPurchase(null); }} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800">Abort</Button>
                                <Button onClick={handleSubmit} className="h-9 px-8 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95" style={{ background: "var(--primary)" }}>
                                    {editingPurchase ? "Update Record" : "Save Entry"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                <DataGrid 
                    data={purchases} 
                    columns={columns} 
                    isLoading={isLoading} 
                    searchPlaceholder="Search ledge records..." 
                    hideTitle={true} 
                    toolbarClassName="px-5 py-3 border-b" 
                    initialPageSize={10}
                />
            </div>
        </div>
    )
}
