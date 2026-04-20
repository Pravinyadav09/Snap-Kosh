"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import {
    Plus, Edit, ExternalLink as ExtLink, Trash2,
    Users2, Phone, Mail, MapPin, RefreshCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Vendor = {
    id: number
    name: string
    phone: string
    email: string
    specialization: string
    address?: string
    balance?: number
}

export default function VendorsPage() {
    const [vendorsList, setVendorsList] = useState<any[]>([])
    const [isAddVendorOpen, setIsAddVendorOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        specialization: "CTP Plates",
        gstNumber: ""
    })

    const fetchVendors = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/Outsource/vendors`)
            if (res.ok) setVendorsList(await res.json())
            else toast.error("Vendor registry sync failed.")
        } catch { toast.error("System offline. Check backend connectivity.") }
        finally { setIsLoading(false) }
    }, [])

    useEffect(() => { fetchVendors() }, [fetchVendors])

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this vendor?")) return
        try {
            const res = await fetch(`${API_BASE}/api/Outsource/vendors/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Vendor deleted successfully.")
                fetchVendors()
            } else {
                toast.error("Failed to delete vendor.")
            }
        } catch {
            toast.error("Server connection failed.")
        }
    }

    const handleAddNew = () => {
        setEditingId(null)
        setFormData({ name: "", phone: "", email: "", address: "", specialization: "CTP Plates", gstNumber: "" })
        setIsAddVendorOpen(true)
    }

    const openEditModal = (row: any) => {
        setEditingId(row.id)
        setFormData({
            name: row.name || "",
            phone: row.phone || "",
            email: row.email || "",
            address: row.address || "",
            specialization: row.specialization || "CTP Plates",
            gstNumber: row.gstNumber || ""
        })
        setIsAddVendorOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone) {
            toast.error("Name and contact details are mandatory.")
            return
        }

        try {
            const url = editingId ? `${API_BASE}/api/Outsource/vendors/${editingId}` : `${API_BASE}/api/Outsource/vendors`
            const method = editingId ? "PUT" : "POST"
            const payload = editingId ? { id: editingId, ...formData } : formData

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(`Partner successfully ${editingId ? 'updated' : 'onboarded'}.`)
                setIsAddVendorOpen(false)
                fetchVendors()
            } else {
                toast.error("Registration rejected by server.")
            }
        } catch {
            toast.error("Critical failure during onboarding.")
        }
    }

    const vendorColumns: ColumnDef<Vendor>[] = React.useMemo(() => [
        {
            key: "name",
            label: "Vendor Identity",
            render: (val, item) => (
                <div className="flex flex-col font-sans">
                    <span className="text-sm font-bold tracking-tight text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.specialization}</span>
                </div>
            )
        },
        {
            key: "contact",
            label: "Communication Details",
            render: (val, item) => (
                <div className="space-y-0.5 font-sans">
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-300" />{val}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                        <Mail className="h-3 w-3 text-slate-300" />{item.email}
                    </p>
                </div>
            )
        },
        {
            key: "address",
            label: "Location / Address",
            render: (_, item) => (
                <div className="flex items-center gap-1.5 font-sans">
                    <MapPin className="h-3 w-3 text-slate-300 shrink-0" />
                    <span className="font-semibold text-xs text-slate-600 truncate max-w-[180px]" title={item.address || "Address not provided"}>
                        {item.address || "Not provided"}
                    </span>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: () => (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px] uppercase tracking-wider px-2 h-5 rounded-sm font-sans">
                    Active Partner
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Management",
            className: "text-right",
            filterable: false,
            render: (_, item: any) => (
                <div className="flex items-center justify-end gap-1 font-sans">
                    <Button onClick={() => openEditModal(item)} size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit Profile">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(item.id)} size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Delete Partner">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ], [])

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-xl font-bold tracking-tight text-slate-900 capitalize">Vendor Directory</h1>
                     <p className="text-xs font-medium text-slate-400 mt-1">Manage external outsourcing partners and production collaborators.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchVendors} className={cn("h-9 w-9 p-0 rounded-lg border-slate-200", isLoading && "animate-spin")}>
                        <RefreshCcw className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button onClick={handleAddNew} className="h-9 px-6 text-white font-bold text-xs rounded-lg gap-2 shadow-sm transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                        <Plus className="h-4 w-4" /> Onboard Vendor
                    </Button>
                    <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
                        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden font-sans border border-slate-200 shadow-xl rounded-xl bg-white flex flex-col max-h-[92vh]">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white relative">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 p-2 rounded-lg border bg-slate-50 flex items-center justify-center shadow-sm" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        <Users2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold text-slate-800 leading-none">{editingId ? 'Update Partner Details' : 'Register Outsource Partner'}</DialogTitle>
                                        <DialogDescription className="text-xs text-slate-500 mt-1.5 font-sans">Define technical specialization and billing profile for new vendor.</DialogDescription>
                                    </div>
                                </div>
                                <div className="hidden sm:block absolute top-6 right-12">
                                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 bg-slate-50 uppercase tracking-widest px-2.5 h-6 rounded-sm">VND-OUT-2026</Badge>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <Users2 className="h-3 w-3" /> Partner Identification
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Vendor Name <span className="text-rose-500">*</span></Label>
                                            <Input 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="e.g. Galaxy Flex Printing" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Contact Number <span className="text-rose-500">*</span></Label>
                                                <Input 
                                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                    placeholder="+91 XXXXX XXXXX" 
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Email Address</Label>
                                                <Input 
                                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                    placeholder="vendor@company.com" 
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <MapPin className="h-3 w-3" /> Localization & Logistics
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Factory / Office Address</Label>
                                        <Input 
                                            className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                            placeholder="Street, Industrial Area..." 
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Technical Specialization</Label>
                                        <SearchableSelect 
                                            options={[
                                                {value: 'CTP Plates', label: 'CTP Plates'}, 
                                                {value: 'Flex Printing', label: 'Flex Printing'},
                                                {value: 'Binding', label: 'Binding'},
                                                {value: 'Lamination', label: 'Lamination'}
                                            ]} 
                                            value={formData.specialization}
                                            placeholder="Select primary capability..." 
                                            onValueChange={(v) => setFormData({...formData, specialization: v})} 
                                            className="h-9 rounded-md border-slate-200 shadow-none text-sm" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                                <Button variant="ghost" onClick={() => setIsAddVendorOpen(false)} className="h-9 px-4 rounded-md text-xs font-bold text-slate-500 hover:bg-slate-100 font-sans uppercase tracking-wider">Discard</Button>
                                <Button onClick={handleSubmit} className="h-9 px-8 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 font-sans" style={{ background: 'var(--primary)' }}>
                                    Authorize Partner
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                <DataGrid data={vendorsList} columns={vendorColumns} isLoading={isLoading} hideTitle={true} searchPlaceholder="Search vendor directory..." toolbarClassName="px-5 py-3 border-b" />
            </div>
        </div>
    )
}
