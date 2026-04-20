"use client"

import { API_BASE } from '@/lib/api'

import React, { useState } from "react"
import { Plus, Layers, Search, RefreshCcw, Box, Maximize2, CreditCard, Info, PlusCircle, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, CheckCircle, Package, Hash, Wand2, ChevronsUpDown, X } from "lucide-react"



import { DropdownRegistrySelect } from "@/components/shared/dropdown-registry-select"


import { toast } from "sonner"

// Hybrid Autocomplete Component
function MasterAutocomplete({ category, value, onChange, placeholder }: { category: string, value: string, onChange: (val: string) => void, placeholder: string }) {
    const [options, setOptions] = React.useState<any[]>([])
    const [isOpen, setIsOpen] = React.useState(false)

    React.useEffect(() => {
        fetch(`${API_BASE}/api/dropdowns/${category}`)
            .then(res => res.json())
            .then(data => setOptions(Array.isArray(data) ? data : []))
            .catch(() => setOptions([]))
    }, [category])

    const uniqueOptions = React.useMemo(() => {
        const seen = new Set();
        return options.filter(opt => {
            const label = (opt.label || "").trim().toUpperCase();
            if (!label || seen.has(label)) return false;
            seen.add(label);
            return true;
        });
    }, [options]);

    const filtered = uniqueOptions.filter(opt => 
        (opt.label || "").toLowerCase().includes((value || "").toLowerCase())
    )

    return (
        <div className="relative w-full group">
            <Input 
                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white w-full pr-8" 
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {value && (
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange("");
                        }}
                        className="h-5 w-5 rounded-full hover:bg-slate-100 flex items-center justify-center group/clear"
                    >
                        <X className="h-3 w-3 text-slate-300 group-hover/clear:text-rose-500 transition-colors" />
                    </button>
                )}
                <ChevronsUpDown className="h-3 w-3 text-slate-300 pointer-events-none" />
            </div>
            {isOpen && filtered.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl max-h-48 overflow-y-auto custom-scrollbar anim-in-fade-up">
                    {filtered.map((opt, i) => (
                        <div 
                            key={i} 
                            className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none flex justify-between items-center group/item uppercase"
                            onClick={() => {
                                onChange(opt.label)
                                setIsOpen(false)
                            }}
                        >
                            {opt.label}
                            <Plus className="h-3 w-3 text-slate-300 group-hover/item:text-primary" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function PaperStocksPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [stocks, setStocks] = useState<any[]>([])
    const [pendings, setPendings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        itemCode: "",
        type: "",
        gsm: 170,
        size: '12 x 18"',
        unit: "Sheets",
        quantity: "" as number | string,
        unitPrice: "" as number | string,
        lowStockAlert: 50,
        calcMode: "manual",
        color: "White",
        priceSlabs: [] as { from: number; to: number; price: number }[]
    })

    const addSlab = () => {
        const lastSlab = formData.priceSlabs[formData.priceSlabs.length - 1]
        const fromQty = lastSlab ? (Number(lastSlab.to) || 0) + 1 : 1
        setFormData({
            ...formData,
            priceSlabs: [...formData.priceSlabs, { from: fromQty, to: fromQty + 9, price: 0 }]
        })
    }

    const removeSlab = (index: number) => {
        const updated = formData.priceSlabs.filter((_, i) => i !== index)
        setFormData({ ...formData, priceSlabs: updated })
    }

    const updateSlab = (index: number, field: string, value: any) => {
        const updated = [...formData.priceSlabs]
        updated[index] = { ...updated[index], [field]: value }
        setFormData({ ...formData, priceSlabs: updated })
    }

    const fetchStocks = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const [sRes, pRes] = await Promise.all([
                fetch(`${API_BASE}/api/SpecializedInventory/paper`),
                fetch(`${API_BASE}/api/purchases`)
            ])
            
            if (sRes.ok) setStocks(await sRes.json())
            if (pRes.ok) {
                const pData = await pRes.json()
                setPendings(pData.filter((p: any) => p.status === 'Pending'))
            }
        } catch (error) {
            toast.error("System offline. Please check backend connection.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleGRN = async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/purchases/${id}/grn`, { method: 'POST' })
            if (res.ok) {
                toast.success("GRN Authenticated. Material inwarded to inventory.")
                fetchStocks()
            } else {
                toast.error("GRN Authorization Failed.")
            }
        } catch {
            toast.error("Network instability detected.")
        }
    }

    React.useEffect(() => {
        fetchStocks()
    }, [fetchStocks])

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this paper stock?")) return
        try {
            const res = await fetch(`${API_BASE}/api/SpecializedInventory/paper/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Stock deleted successfully.")
                fetchStocks()
            } else {
                toast.error("Failed to delete stock.")
            }
        } catch {
            toast.error("Server connection failed.")
        }
    }
    
    const generateNextCode = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/settings`)
            if (res.ok) {
                const data: any[] = await res.json()
                const prefix = data.find(s => (s.key ?? s.Key) === 'item_code_prefix')?.value ?? ""
                const sequenceNum = data.find(s => (s.key ?? s.Key) === 'item_code_sequence')?.value ?? ""
                if (prefix || sequenceNum) {
                    return `${prefix}${sequenceNum}`
                }
            }
        } catch (error) {
            console.error("Sequence fetch failed", error)
        }
        return ""
    }


    const handleAddNew = async () => {
        setEditingId(null)
        const nextCode = await generateNextCode()
        setFormData({
            name: "",
            itemCode: nextCode,
            type: "",
            gsm: 170,
            size: '12 x 18"',
            unit: "Sheets",
            quantity: "",
            unitPrice: 0,
            lowStockAlert: 50,
            calcMode: "manual",
            color: "White",
            priceSlabs: []
        })
        setIsDialogOpen(true)
    }


    const openEditModal = (row: any) => {
        setEditingId(row.id)
        setFormData({
            name: row.name,
            itemCode: row.itemCode || "",
            type: row.type,
            gsm: row.gsm,
            size: row.size,
            unit: row.unit || "Sheets",
            quantity: row.quantity,
            unitPrice: row.unitPrice || 0,
            lowStockAlert: row.lowStockAlert,
            calcMode: row.calcMode || "manual",
            color: row.color || "White",
            priceSlabs: row.priceSlabsJson ? JSON.parse(row.priceSlabsJson) : []
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Category is required", { description: "Please enter a category like 'Art Paper'." })
            return
        }
        if (!formData.type) {
            toast.error("Product Name is required", { description: "Choose or type a name like 'Single Side'." })
            return
        }


        try {
            const url = editingId ? `${API_BASE}/api/SpecializedInventory/paper/${editingId}` : `${API_BASE}/api/SpecializedInventory/paper`
            const method = editingId ? "PUT" : "POST"
            
            const payload = { 
                id: editingId || 0, 
                ...formData,
                width: 0, 
                height: 0,
                gsm: Number(formData.gsm) || 0,
                quantity: parseFloat(formData.quantity.toString()) || 0,
                unitPrice: parseFloat(formData.unitPrice.toString()) || 0,
                priceSlabsJson: JSON.stringify(formData.priceSlabs),
                rate1To10: Number(formData.priceSlabs.find((s: any) => s.from === 1 && s.to === 10)?.price) || 0,
                rate11To50: Number(formData.priceSlabs.find((s: any) => s.from === 11 && s.to === 50)?.price) || 0,
                rate51To200: Number(formData.priceSlabs.find((s: any) => s.from === 51 && s.to === 200)?.price) || 0,
                rate201To500: Number(formData.priceSlabs.find((s: any) => s.from === 201 && s.to === 500)?.price) || 0,
                rate501Plus: Number(formData.priceSlabs.find((s: any) => s.from >= 501)?.price) || 0,
                createdAt: new Date().toISOString(),
                isActive: true
            }


            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(`Sheet material ${editingId ? 'updated' : 'registered'} successfully.`)
                
                // Increment sequence if new entry
                if (!editingId && formData.itemCode) {
                    try {
                        const sRes = await fetch(`${API_BASE}/api/settings`)
                        if (sRes.ok) {
                            const settings: any[] = await sRes.json()
                            const seqSetting = settings.find(s => (s.key ?? s.Key) === 'item_code_sequence')
                            if (seqSetting) {
                                const nextSeq = (parseInt(seqSetting.value ?? seqSetting.Value) || 0) + 1
                                await fetch(`${API_BASE}/api/settings`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ key: 'item_code_sequence', value: nextSeq.toString() })
                                })
                            }
                        }
                    } catch (e) {
                        console.error("Sequence increment fail", e)
                    }
                }
                
                setIsDialogOpen(false)
                fetchStocks()
            } else {

                const errData = await res.json()
                toast.error("Operation Denied", { description: errData.message || "Manifest rejected by server." })
            }
        } catch (error) {
            toast.error("Critical failure during registration.")
        }
    }

    const columns: ColumnDef<any>[] = React.useMemo(() => [
        {
            key: "name",
            label: "Category",
            render: (val) => <span className="text-sm font-bold tracking-tight text-slate-900 uppercase">{val || "—"}</span>
        },
        {
            key: "type",
            label: "Product Name",
            render: (val) => <span className="text-xs font-medium text-slate-600 uppercase">{val || "—"}</span>
        },
        {
            key: "gsm",
            label: "GSM",
            render: (val) => <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 font-bold text-[10px] px-1.5 h-5 rounded-md">{val ? `${val} GSM` : "—"}</Badge>
        },
        {
            key: "itemCode",
            label: "Product Code",
            render: (val) => <code className="text-[11px] font-black text-indigo-500 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100/50">{val || "—"}</code>
        },
        {
            key: "size",
            label: "Sheet Size (In)",
            render: (val) => (
                <span className="font-sans font-bold text-xs text-slate-600">
                    {val || "Standard"}
                </span>
            )
        },
        {
            key: "quantity",
            label: "Current On-Hand",
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    <Badge variant={Number(val) < 100 ? "destructive" : "outline"} className="font-sans font-bold text-[10px] h-5 px-2 rounded-sm uppercase tracking-wider">
                        {val || 0} {row.unit || "SHEETS"}
                    </Badge>
                </div>
            )
        },
        {
            key: "priceSlabsJson",
            label: "Volume Pricing Matrix",
            initialWidth: 350,
            render: (val) => {
                const slabs = val ? JSON.parse(val) : []
                if (slabs.length === 0) return <span className="text-[10px] text-slate-400 italic font-medium">No tiers defined</span>
                return (
                    <div className="flex flex-wrap gap-x-2 gap-y-1.5 max-w-[450px] py-1">
                        {slabs.map((s: any, i: number) => (
                            <div key={i} className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs hover:border-indigo-400 transition-colors group/slab">
                                <div className="bg-slate-50 px-2 py-0.5 border-r border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                    {s.from}-{s.to === 99999 ? '∞' : s.to}
                                </div>
                                <div className="px-2 py-0.5 text-[10px] font-black text-indigo-600 bg-indigo-50/10 group-hover/slab:bg-indigo-50/30 transition-colors">
                                    ₹{Number(s.price).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: (_val, row: any) => (
                <div className="flex items-center justify-end gap-1 pr-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                        onClick={() => openEditModal(row)}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        onClick={() => handleDelete(row.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ], [openEditModal, handleDelete])

    const pendingColumns: ColumnDef<any>[] = React.useMemo(() => [
        {
            key: "purchaseNumber",
            label: "Purchase Manifest",
            render: (val, row) => (
                <div className="flex flex-col font-sans">
                    <span className="text-sm font-black tracking-tight text-slate-900">{val || "INV-PO-000"}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{row.supplierName || "Internal Ledger"}</span>
                </div>
            )
        },
        {
            key: "itemName",
            label: "Material Description",
            render: (val, row) => (
                <div className="flex flex-col font-sans">
                    <span className="text-xs font-bold text-slate-600">{val}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Quantity: {row.quantity || 0} Units</span>
                </div>
            )
        },
        {
            key: "createdAt",
            label: "Dispatch Time",
            render: (val) => (
                <span className="text-xs font-bold text-slate-500 tabular-nums">
                    {val ? new Date(val).toLocaleDateString() : "Pending"}
                </span>
            )
        },
        {
            key: "status",
            label: "Flow Status",
            render: () => (
                <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-amber-100 text-[9px] font-black uppercase tracking-wider h-5 rounded-sm shadow-none">
                    Waiting Authentication
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Inventory Action",
            className: "text-right",
            filterable: false,
            render: (_val, row: any) => (
                <div className="flex items-center justify-end pr-2">
                    <Button 
                        onClick={() => handleGRN(row.id)}
                        className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase gap-2 rounded-md shadow-sm transition-all active:scale-95"
                    >
                        <CheckCircle className="h-3.5 w-3.5" /> Authenticate GRN
                    </Button>
                </div>
            )
        }
    ], [handleGRN])

    return (
        <div className="space-y-2 font-sans px-1">
            <div className="flex flex-row items-center justify-between gap-2 font-sans mb-1">
                <div className="text-left">
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase leading-none">Paper Master</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchStocks} className={cn("h-9 w-9 p-0 rounded-lg border-slate-200 bg-white", isLoading && "animate-spin")}>
                        <RefreshCcw className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button onClick={handleAddNew} className="h-9 px-5 text-white font-bold text-xs rounded-lg gap-2 shadow-sm transition-all active:scale-95" style={{ background: "var(--primary)" }}>
                        <Plus className="h-4 w-4" /> Add New Stock
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden font-sans border border-slate-200 shadow-xl rounded-xl bg-white flex flex-col max-h-[92vh]">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white relative">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 p-2 rounded-lg border bg-slate-50 flex items-center justify-center shadow-sm" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        <Layers className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold text-slate-800 leading-none">{editingId ? 'Update Paper Material' : 'Register Paper Material'}</DialogTitle>
                                        <DialogDescription className="text-xs text-slate-500 mt-1.5 font-sans">Configure technical production specifications for new sheet stock.</DialogDescription>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-12">
                                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 bg-slate-50 uppercase tracking-widest px-2.5 h-6 rounded-sm">STK-SH-2026</Badge>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <Box className="h-3 w-3" /> Technical Specifications
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Category <span className="text-rose-500">*</span></Label>
                                            <DropdownRegistrySelect
                                                category="PaperCategory"
                                                value={formData.name}
                                                onValueChange={(val) => setFormData({...formData, name: val})}
                                                placeholder="e.g. Art Paper"
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-bold bg-white"
                                            />
                                        </div>

                                        <div className="space-y-1.5 flex-1 relative">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Product Code</Label>
                                            <div className="relative group">
                                                <Input 
                                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm font-bold px-3 pl-9 bg-slate-50/50 focus:bg-white transition-all uppercase" 
                                                    placeholder="e.g. CPP/PD-015"
                                                    value={formData.itemCode}
                                                    onChange={(e) => setFormData({...formData, itemCode: e.target.value.toUpperCase()})}
                                                />
                                                <Hash className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Product Name <span className="text-rose-500">*</span></Label>
                                            <MasterAutocomplete
                                                category="PaperProductName"
                                                value={formData.type}
                                                onChange={(val) => setFormData({...formData, type: val})}
                                                placeholder="e.g. Single Side"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <Maximize2 className="h-3 w-3" /> Dimensions & GSM
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">GSM Weight</Label>
                                            <Input 
                                                type="number" 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="170"
                                                value={formData.gsm}
                                                onChange={(e) => setFormData({...formData, gsm: parseInt(e.target.value) || 0})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Standard Size</Label>
                                            <Input 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder='12 x 18"'
                                                value={formData.size}
                                                onChange={(e) => setFormData({...formData, size: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <CreditCard className="h-3 w-3" /> Inventory & Pricing
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Initial Quantity</Label>
                                            <Input 
                                                type="number" 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="0"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Unit of Measurement</Label>
                                            <Input 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="Sheets / Reams / Kg"
                                                value={formData.unit}
                                                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Low Stock Alert</Label>
                                            <Input 
                                                type="number" 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="100"
                                                value={formData.lowStockAlert}
                                                onChange={(e) => setFormData({...formData, lowStockAlert: parseFloat(e.target.value) || 0})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <div className="flex items-center gap-2">
                                            <Badge className="h-4 px-1 py-0 bg-slate-100 text-slate-400 border-none font-bold text-[8px]">RATES</Badge> Custom Pricing Slabs
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={addSlab}
                                            className="h-6 px-2 text-[9px] font-bold border-slate-200 text-indigo-600 hover:text-indigo-700 hover:bg-slate-50 gap-1 rounded-sm"
                                        >
                                            <PlusCircle className="h-3 w-3" /> Add New Slab
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {formData.priceSlabs.length === 0 ? (
                                            <div className="py-8 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                                                <Layers className="h-8 w-8 mb-2 opacity-20" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">No custom slabs defined</span>
                                                <Button variant="ghost" onClick={addSlab} className="mt-2 h-7 text-[9px] font-bold text-indigo-600 hover:bg-white underline">Create first slab</Button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-2">
                                                {formData.priceSlabs.map((slab, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 bg-slate-50/30 group animate-in slide-in-from-left-2 duration-200">
                                                        <div className="flex-1 grid grid-cols-3 gap-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-[9px] font-bold text-slate-500 uppercase px-1">From Qty</Label>
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-8 text-xs font-bold bg-white" 
                                                                    value={slab.from === 0 ? "" : slab.from} 
                                                                    onChange={(e) => updateSlab(idx, 'from', e.target.value)} 
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[9px] font-bold text-slate-500 uppercase px-1">To Qty</Label>
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-8 text-xs font-bold bg-white" 
                                                                    value={slab.to === 0 ? "" : slab.to} 
                                                                    onChange={(e) => updateSlab(idx, 'to', e.target.value)} 
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[9px] font-bold text-indigo-600 uppercase px-1">Rate (₹)</Label>
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-8 text-xs font-bold bg-white border-indigo-100 text-indigo-600" 
                                                                    placeholder="0.00"
                                                                    value={slab.price === 0 ? "" : slab.price} 
                                                                    onChange={(e) => updateSlab(idx, 'price', e.target.value)} 
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => removeSlab(idx)}
                                                            className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md mt-4 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-9 px-4 rounded-md text-xs font-bold text-slate-500 hover:bg-slate-100 font-sans uppercase tracking-wider">Discard Entry</Button>
                                <Button onClick={handleSubmit} className="h-9 px-8 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 font-sans" style={{ background: "var(--primary)" }}>
                                    Save Material Specs
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] h-11 p-1 bg-slate-100 rounded-lg">
                    <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-bold text-xs">
                        <Package className="h-3.5 w-3.5 mr-2" /> Active Inventory
                    </TabsTrigger>
                    <TabsTrigger value="pendings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-bold text-xs relative">
                        <Truck className="h-3.5 w-3.5 mr-2" /> Pending Receipts
                        {pendings.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-black animate-pulse">
                                {pendings.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="mt-2">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                        <DataGrid 
                            data={stocks} 
                            columns={columns} 
                            hideTitle={true} 
                            searchPlaceholder="Search materials..." 
                            toolbarClassName="px-5 py-3 border-b" 
                            initialPageSize={10}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="pendings" className="mt-2">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                        <DataGrid 
                            data={pendings} 
                            columns={pendingColumns} 
                            hideTitle={true} 
                            searchPlaceholder="Search PO or Supplier..." 
                            toolbarClassName="px-5 py-3 border-b"
                            isLoading={isLoading}
                            initialPageSize={10}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
