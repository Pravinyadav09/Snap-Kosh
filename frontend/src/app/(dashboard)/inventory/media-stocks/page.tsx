"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useCallback } from "react"
import { Plus, RefreshCcw, Edit, Trash2, Maximize2, Activity, Info, Package, CreditCard } from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function MediaStocksPage() {
    const [stocks, setStocks] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        rollWidth: 60,
        rollLength: 50,
        costPerRoll: "" as number | string,
        costPerSqFt: "" as number | string,
        quantitySqFt: "" as number | string,
        lowStockAlert: 100,
        status: "In Stock"
    })

    const fetchStocks = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/SpecializedInventory/media`)
            if (res.ok) setStocks(await res.json())
            else toast.error("Media registry sync failed.")
        } catch { toast.error("System offline. Check backend.") }
        finally { setIsLoading(false) }
    }, [])

    useEffect(() => { fetchStocks() }, [fetchStocks])

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this media stock?")) return
        try {
            const res = await fetch(`${API_BASE}/api/SpecializedInventory/media/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Stock deleted successfully.")
                fetchStocks()
            } else {
                toast.error("Failed to delete media stock.")
            }
        } catch {
            toast.error("Server connection failed.")
        }
    }

    const handleAddNew = () => {
        setEditingId(null)
        setFormData({
            name: "",
            type: "",
            rollWidth: 60,
            rollLength: 50,
            costPerRoll: "",
            costPerSqFt: "",
            quantitySqFt: "",
            lowStockAlert: 100,
            status: "In Stock"
        })
        setIsDialogOpen(true)
    }

    const openEditModal = (row: any) => {
        setEditingId(row.id)
        setFormData({
            name: row.name,
            type: row.type || "",
            rollWidth: row.rollWidth,
            rollLength: row.rollLength,
            costPerRoll: row.costPerRoll,
            costPerSqFt: row.costPerSqFt,
            quantitySqFt: row.quantitySqFt,
            lowStockAlert: row.lowStockAlert,
            status: row.status || "In Stock"
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.type) {
            toast.error("Please define material name and type.")
            return
        }

        try {
            const url = editingId ? `${API_BASE}/api/SpecializedInventory/media/${editingId}` : `${API_BASE}/api/SpecializedInventory/media`
            const method = editingId ? "PUT" : "POST"
            
            const payload = editingId ? { 
                id: editingId, 
                ...formData,
                costPerRoll: parseFloat(formData.costPerRoll.toString()) || 0,
                costPerSqFt: parseFloat(formData.costPerSqFt.toString()) || 0,
                quantitySqFt: parseFloat(formData.quantitySqFt.toString()) || 0,
            } : {
                ...formData,
                costPerRoll: parseFloat(formData.costPerRoll.toString()) || 0,
                costPerSqFt: parseFloat(formData.costPerSqFt.toString()) || 0,
                quantitySqFt: parseFloat(formData.quantitySqFt.toString()) || 0,
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(`Roll ${editingId ? 'updated' : 'materialized'} successfully.`)
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

    const columns: ColumnDef<any>[] = [
        {
            key: "name",
            label: "Media Description",
            render: (v, i) => (
                <div className="flex flex-col font-sans">
                    <span className="font-bold text-sm text-slate-800">{v as string}</span>
                    <span className="text-[10px] text-slate-400">UID: #{i.id} | Class: {i.type}</span>
                </div>
            )
        },
        {
            key: "rollWidth",
            label: "Roll Dimension",
            render: (_, i) => <span className="text-sm font-bold text-slate-700 font-sans">{i.rollWidth}" x {i.rollLength}m</span>
        },
        {
            key: "quantitySqFt",
            label: "Current Stock",
            className: "text-right font-sans",
            render: (v) => <span className="font-bold text-sm">{(v as number).toLocaleString()} Sq.Ft</span>
        },
        {
            key: "costPerSqFt",
            label: "Cost / Sq.Ft",
            className: "text-right font-sans",
            render: (v) => <span className="font-bold text-sm text-slate-900">₹{(v as number).toFixed(2)}</span>
        },
        {
            key: "status",
            label: "Status",
            className: "text-center font-sans",
            render: (v) => <Badge variant={v === 'In Stock' ? 'default' : 'secondary'} className={cn(
                "text-[10px] font-bold px-2 rounded-lg border-none h-6",
                v === 'In Stock' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
            )}>{v as string}</Badge>
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (_, row: any) => (
                <div className="flex justify-end gap-1 px-1">
                    <Button onClick={() => openEditModal(row)} size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"><Edit className="h-4 w-4" /></Button>
                    <Button onClick={() => handleDelete(row.id)} size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"><Trash2 className="h-4 w-4" /></Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none font-sans">Media Stocks</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchStocks} className={cn("h-9 w-9 p-0 rounded-lg border-slate-200", isLoading && "animate-spin")}>
                        <RefreshCcw className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button onClick={handleAddNew} className="h-9 px-6 text-white font-bold text-xs rounded-lg gap-2 shadow-sm font-sans" style={{ background: "var(--primary)" }}>
                        <Plus className="h-4 w-4" /> Add New Roll
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden font-sans border border-slate-200 shadow-xl rounded-xl bg-white flex flex-col max-h-[92vh]">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white relative">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 p-2 rounded-lg border bg-slate-50 flex items-center justify-center shadow-sm" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold text-slate-800 leading-none">{editingId ? 'Update Media / Roll Stock' : 'Register Media / Roll Stock'}</DialogTitle>
                                        <DialogDescription className="text-xs text-slate-500 mt-1.5 font-sans">Define roll material parameters for wide format production.</DialogDescription>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-12">
                                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 bg-slate-50 uppercase tracking-widest px-2.5 h-6 rounded-sm">STK-RL-2026</Badge>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <Package className="h-3 w-3" /> Material Classification
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Media Material Description <span className="text-rose-500">*</span></Label>
                                            <Input 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="e.g. FRONTLIT FLEX STAR" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Material Category / Type</Label>
                                            <Input 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="Flex / Vinyl / Canvas" 
                                                value={formData.type}
                                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <Maximize2 className="h-3 w-3" /> Roll Dimensions
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Roll Width (Inches)</Label>
                                            <Input 
                                                type="number" 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder='60"' 
                                                value={formData.rollWidth}
                                                onChange={(e) => setFormData({...formData, rollWidth: parseFloat(e.target.value) || 0})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Roll Length (Meters)</Label>
                                            <Input 
                                                type="number" 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="50" 
                                                value={formData.rollLength}
                                                onChange={(e) => setFormData({...formData, rollLength: parseFloat(e.target.value) || 0})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <CreditCard className="h-3 w-3" /> Costing & Inventory
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Cost / Roll (₹)</Label>
                                            <Input 
                                                type="number" 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="0.00" 
                                                value={formData.costPerRoll}
                                                onChange={(e) => setFormData({...formData, costPerRoll: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Cost / Sq.Ft (₹)</Label>
                                            <Input 
                                                type="number" 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="0.00" 
                                                value={formData.costPerSqFt}
                                                onChange={(e) => setFormData({...formData, costPerSqFt: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Initial Sq.Ft Stock</Label>
                                            <Input 
                                                type="number" 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="0" 
                                                value={formData.quantitySqFt}
                                                onChange={(e) => setFormData({...formData, quantitySqFt: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-9 px-4 rounded-md text-xs font-bold text-slate-500 hover:bg-slate-100 font-sans uppercase tracking-wider">Discard Entry</Button>
                                <Button onClick={handleSubmit} className="h-9 px-8 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 font-sans" style={{ background: 'var(--primary)' }}>
                                    Authorize Material
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                <DataGrid data={stocks} columns={columns} isLoading={isLoading} searchPlaceholder="Search media rolls..." hideTitle={true} toolbarClassName="px-5 py-3 border-b" />
            </div>
        </div>
    )
}
