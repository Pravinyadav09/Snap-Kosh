"use client"

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Phone,
    Mail,
    MapPin,
    UserCircle,
    Building2,
    CheckCircle2,
    XCircle,
    Info,
    RefreshCcw,
    Users,
    Wallet
} from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// Shared Grid
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"

type Supplier = {
    id: number
    name: string
    contactPerson: string
    email: string
    phone: string
    city: string
    gstNumber: string
    balance: number
    isActive: boolean
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gstNumber: "",
        balance: "" as number | string
    })

    const fetchSuppliers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/suppliers`)
            if (res.ok) {
                const data = await res.json()
                setSuppliers(data)
            }
        } catch (err) {
            toast.error("Failed to load suppliers")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const handleSave = async () => {
        if (!formData.name) return toast.error("Supplier Name is required")
        
        const method = editingSupplier ? "PUT" : "POST"
        const url = editingSupplier ? `${API_BASE}/api/suppliers/${editingSupplier.id}` : `${API_BASE}/api/suppliers`

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success(editingSupplier ? "Supplier updated" : "Supplier added")
                setIsModalOpen(false)
                setEditingSupplier(null)
                setFormData({
                    name: "", contactPerson: "", email: "", phone: "", 
                    address: "", city: "", state: "", pincode: "", gstNumber: "", balance: ""
                })
                fetchSuppliers()
            } else {
                toast.error("Failed to save supplier")
            }
        } catch (err) {
            toast.error("An error occurred")
        }
    }

    const startEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier)
        setFormData({
            name: supplier.name,
            contactPerson: (supplier as any).contactPerson || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: (supplier as any).address || "",
            city: supplier.city || "",
            state: (supplier as any).state || "",
            pincode: (supplier as any).pincode || "",
            gstNumber: supplier.gstNumber || "",
            balance: supplier.balance || 0
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this supplier?")) return
        try {
            const res = await fetch(`${API_BASE}/api/suppliers/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Supplier removed")
                fetchSuppliers()
            }
        } catch (err) {
            toast.error("Failed to delete")
        }
    }

    const columns: ColumnDef<Supplier>[] = [
        {
            key: "name",
            label: "Supplier Name",
            render: (val, row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900 uppercase tracking-tight">{String(val)}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{row.contactPerson || "No Contact Person"}</span>
                </div>
            )
        },
        {
            key: "contact",
            label: "Contact Info",
            render: (_, row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <Phone className="h-3 w-3 text-primary/60" /> {row.phone || "---"}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium lowercase">
                        <Mail className="h-3 w-3 text-primary/60" /> {row.email || "---"}
                    </div>
                </div>
            )
        },
        {
            key: "city",
            label: "Location",
            render: (val) => (
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase">
                    <MapPin className="h-3 w-3 text-slate-400" /> {String(val) || "N/A"}
                </div>
            )
        },
        {
            key: "gstNumber",
            label: "GST Number",
            render: (val) => (
                <Badge variant="outline" className="text-[10px] font-bold text-slate-500 bg-slate-50 border-slate-200">
                    {String(val) || "UNREGISTERED"}
                </Badge>
            )
        },
        {
            key: "balance",
            label: "Balance",
            render: (val) => (
                <span className={`font-bold ${Number(val) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ₹{Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: "actions",
            label: "Action",
            className: "text-right",
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600" onClick={() => startEdit(row)}>
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(row.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-2 font-sans px-1">
            <div className="flex flex-row items-center justify-between gap-2 font-sans mb-1">
                <div className="text-left">
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase leading-none">Supplier Master</h1>
                </div>

                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={fetchSuppliers}
                        className="h-9 w-9 p-0 rounded-lg border-slate-200 text-slate-500 hover:text-slate-800 transition-all shadow-sm"
                    >
                        <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                    <Dialog open={isModalOpen} onOpenChange={(val) => {
                        setIsModalOpen(val)
                        if(!val) {
                            setEditingSupplier(null)
                            setFormData({
                                name: "", contactPerson: "", email: "", phone: "", 
                                address: "", city: "", state: "", pincode: "", gstNumber: "", balance: ""
                            })
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                                <Plus className="h-4 w-4" /> {editingSupplier ? "Edit Supplier" : "Register Supplier"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[92vh] flex flex-col font-sans">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        {editingSupplier ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold text-slate-800 leading-none">{editingSupplier ? "Update Supplier Protocol" : "New Supplier Profile"}</DialogTitle>
                                        <DialogDescription className="text-xs text-slate-500 mt-1">{editingSupplier ? `Re-initializing portfolio: SUP-${editingSupplier.id}` : "Create a new organizational record"}</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="px-6 py-6 space-y-6">
                                    {/* Section 1: Basic Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Info className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organizational Profile</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5 col-span-2">
                                                <Label className="text-xs font-medium text-slate-600">Company / Shop Name <span className="text-rose-500">*</span></Label>
                                                <Input 
                                                    value={formData.name}
                                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                                    placeholder="Enter supplier legal name" 
                                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Contact Person</Label>
                                                <Input 
                                                    value={formData.contactPerson}
                                                    onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                                                    placeholder="Primary Contact" 
                                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Phone Number</Label>
                                                <Input 
                                                    value={formData.phone}
                                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                                    placeholder="+91 XXXXX XXXXX" 
                                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Email Address</Label>
                                                <Input 
                                                    value={formData.email}
                                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                                    type="email" 
                                                    placeholder="official@company.com" 
                                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">GSTIN Number</Label>
                                                <Input 
                                                    value={formData.gstNumber}
                                                    onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                                                    placeholder="TAX REGISTRATION ID" 
                                                    className="h-9 border-slate-200 bg-white font-medium text-sm uppercase rounded-md" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Financials */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Financial Ledger Defaults</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Opening Balance / Carry Forward (₹)</Label>
                                                <Input 
                                                    type="number" 
                                                    value={formData.balance}
                                                    onChange={e => setFormData({...formData, balance: e.target.value})}
                                                    placeholder="0.00" 
                                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                                />
                                                <p className="text-[10px] text-slate-400 font-medium pt-0.5">Existing dues or credit balance with supplier</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Address */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Office Address</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5 md:col-span-3">
                                                <Label className="text-xs font-medium text-slate-600">Complete Address</Label>
                                                <Input 
                                                    value={formData.address}
                                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                                    placeholder="Street, Building, Area" 
                                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">City</Label>
                                                <Input 
                                                    value={formData.city}
                                                    onChange={e => setFormData({...formData, city: e.target.value})}
                                                    placeholder="Indore" 
                                                    className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500">Abort</Button>
                                <Button
                                    onClick={handleSave}
                                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                                    style={{ background: 'var(--primary)' }}
                                >
                                    {editingSupplier ? "Commit Update" : "Save Supplier"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* List Table Area */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-6">
                <DataGrid 
                    data={suppliers}
                    columns={columns}
                    isLoading={isLoading}
                    searchPlaceholder="Filter suppliers by name or city..."
                    initialPageSize={10}
                />
            </div>
        </div>
    )
}
