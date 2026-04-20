"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import {
    Plus,
    Upload,
    Download,
    Search,
    UserPlus,
    Phone,
    Mail,
    MapPin,
    Shield,
    ExternalLink,
    Filter,
    ArrowUpRight,
    History,
    FileText,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Eye,
    EyeOff,
    LayoutDashboard,
    PieChart,
    Calendar,
    Printer,
    Link as LinkIcon,
    Info,
    RefreshCcw,
    Edit2,
    Trash2,
    AlertTriangle,
    Building2,
    Smartphone,
    Globe,
    Wallet,
    ShieldCheck
} from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { CustomerAddModal } from "@/components/shared/customer-add-modal"
import { PageActionButtons } from "@/components/shared/page-action-buttons"
import { Can } from "@/components/shared/permission-context"
import { Button } from "@/components/ui/button"
import { GeoSelect } from "@/components/shared/geo-select"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────
export type Customer = {
    id: string
    _dbId: number
    companyName: string
    contactPerson: string
    addressLine1: string
    country?: string
    city: string
    state: string
    pincode: string
    gstNumber: string
    phone: string
    email?: string
    status: "Active" | "Inactive"
    portalAccess: boolean
    netBalance: number
    createdAt: string
}

// ─── Component Props ────────────────────────────────────────────────────────
interface ModalProps {
    customer: Customer;
    fetchCustomers: () => void;
}

// ─── Edit Customer Modal ───────────────────────────────────────────────────
function EditCustomerModal({ customer, fetchCustomers }: ModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [companyName, setCompanyName] = useState(customer.companyName || "")
    const [contactPerson, setContactPerson] = useState(customer.contactPerson || "")
    const [phone, setPhone] = useState(customer.phone || "")
    const [email, setEmail] = useState(customer.email || "")
    const [gstNumber, setGstNumber] = useState(customer.gstNumber || "")
    const [netBalance, setNetBalance] = useState(customer.netBalance || 0)
    
    const [addressLine1, setAddressLine1] = useState(customer.addressLine1 || "")
    const [country, setCountry] = useState(customer.country || "IN")
    const [city, setCity] = useState(customer.city || "")
    const [stateVal, setStateVal] = useState(customer.state || "")
    const [pincode, setPincode] = useState(customer.pincode || "")
    const [isActive, setIsActive] = useState(customer.status === "Active")

    const handleUpdate = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/customers/${customer._dbId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: customer._dbId,
                    companyName,
                    contactPerson,
                    phone,
                    email,
                    gstNumber,
                    addressLine1,
                    country,
                    city,
                    state: stateVal,
                    pincode,
                    netBalance,
                    isActive,
                    portalAccessEnabled: true
                })
            })
            if (res.ok) {
                toast.success("Entity Profile Synchronized")
                setIsOpen(false)
                fetchCustomers()
            } else {
                toast.error("Persistence error")
            }
        } catch (err) {
            toast.error("Synchronization aborted")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    type="button" 
                    size="icon" 
                    variant="outline" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
                    className="h-8 w-8 rounded-xl border-slate-200 text-slate-400 hover:text-emerald-600 transition-all"
                >
                    <Edit2 className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[92vh] flex flex-col">
                <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                            <Edit2 className="h-4 w-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-800 leading-none">Update Entity Protocol</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 mt-1">Re-initializing portfolio: {customer.id}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-6 py-6 space-y-6">
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Info className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organizational Profile</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Company Name</Label>
                                    <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md font-sans" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Contact Person</Label>
                                    <Input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md font-sans" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Phone</Label>
                                    <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md font-sans" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Email Address</Label>
                                    <Input value={email} onChange={e => setEmail(e.target.value)} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md font-sans" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tax & Financial Defaults</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">GSTIN Number</Label>
                                    <Input value={gstNumber} onChange={e => setGstNumber(e.target.value)} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md uppercase font-sans" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Opening Balance (₹)</Label>
                                    <Input type="number" value={netBalance} onChange={e => setNetBalance(parseFloat(e.target.value) || 0)} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md font-sans" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Address</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div className="space-y-1.5 md:col-span-1">
                                    <Label className="text-xs font-medium text-slate-600">Address Line 1</Label>
                                    <Input value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md font-sans" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <GeoSelect 
                                        countryValue={country}
                                        stateValue={stateVal}
                                        cityValue={city}
                                        onCountryChange={setCountry}
                                        onStateChange={setStateVal}
                                        onCityChange={setCity}
                                    />
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Pincode</Label>
                                        <Input value={pincode} onChange={e => setPincode(e.target.value)} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md font-sans" />
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500">Abort</Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all"
                        style={{ background: 'var(--primary)' }}
                    >
                        {isLoading ? "Syncing..." : "Commit Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────
function DeleteConfirmModal({ customer, fetchCustomers }: ModalProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/customers/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                toast.success("Security Clearance: Record Purged")
                fetchCustomers()
                setIsOpen(false)
            } else {
                toast.error("Access Denied: Record Locked")
            }
        } catch (err) {
            toast.error("Decommissioning process aborted")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    type="button" 
                    size="icon" 
                    variant="outline" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
                    className="h-8 w-8 rounded-xl border-slate-200 text-slate-400 hover:text-rose-600 transition-all"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[400px] p-0 border border-slate-200 shadow-xl rounded-md overflow-hidden bg-white">
                <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md border border-rose-100 bg-rose-50 text-rose-600">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-800">Entity Decommissioning</DialogTitle>
                            <DialogDescription className="text-xs text-rose-500 font-medium mt-1">Critical purge initiated</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-6 space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        Permanently liquidate <span className="font-bold text-rose-600">{customer.companyName}</span> from central intelligence?
                    </p>
                    <div className="p-3 rounded-md bg-rose-50 border border-rose-100 flex gap-3 items-center">
                        <Info className="h-4 w-4 text-rose-400 shrink-0" />
                        <p className="text-xs text-rose-600">
                            All linked job cards, financial ledgers, and communication logs will be archived in the shadow database.
                        </p>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500">Abort</Button>
                    <Button
                        className="h-9 px-6 rounded-md text-white font-bold text-xs shadow-sm transition-all active:scale-95 bg-rose-600 hover:bg-rose-700"
                        onClick={() => handleDelete(customer._dbId)}
                    >
                        Authorize Purge
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── View Customer Modal ──────────────────────────────────────────────────
function CustomerViewModal({ customer }: { customer: Customer }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true) }}
                    className="h-8 w-8 rounded-xl border-slate-200 text-slate-400 hover:text-primary transition-all"
                >
                    <Eye className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[500px] p-0 overflow-hidden font-sans border border-slate-200 shadow-xl rounded-xl bg-white">
                {/* Header */}
                <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 p-2 rounded-lg border bg-white flex items-center justify-center shadow-sm" style={{ color: 'var(--primary)' }}>
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-800 leading-none">Customer Profile</DialogTitle>
                            <DialogDescription className="text-[10px] text-slate-500 uppercase tracking-widest mt-1.5 font-bold">Client Records & Account</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Customer / Entity */}
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Customer / Entity</h4>
                        <p className="text-sm font-bold text-slate-800">{customer.companyName}</p>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <UserPlus className="h-3 w-3" /> {customer.contactPerson || "—"}
                        </p>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Contact Details</h4>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Smartphone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="font-medium">{customer.phone || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="font-medium">{customer.email || "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Registered Address</h4>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed min-h-[48px] flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>
                                {[customer.addressLine1, customer.city, customer.state, customer.pincode].filter(Boolean).join(", ") || "No address on file."}
                            </span>
                        </div>
                    </div>

                    {/* Tax & Financial */}
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.1em] flex items-center gap-2">
                            <Wallet className="h-3 w-3" /> Tax & Financial
                        </h4>
                        <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium uppercase tracking-wide">GSTIN</span>
                                <span className="font-bold text-slate-700 uppercase">{customer.gstNumber || "—"}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium uppercase tracking-wide">Balance</span>
                                <span className={cn("font-bold", customer.netBalance < 0 ? "text-rose-600" : customer.netBalance > 0 ? "text-emerald-600" : "text-slate-400")}>
                                    {customer.netBalance < 0 ? `Pending ₹${Math.abs(customer.netBalance).toLocaleString()}` : customer.netBalance > 0 ? `Credit ₹${customer.netBalance.toLocaleString()}` : "Zero Exposure"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Grid: Initialized + Status */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Initialized</h4>
                            <p className="text-xs font-bold text-slate-700">{customer.createdAt || "—"}</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Status</h4>
                            <Badge className={cn(
                                "text-[10px] font-bold uppercase border-none px-2 py-0.5",
                                customer.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                            )}>
                                {customer.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                    <Button
                        onClick={() => setIsOpen(false)}
                        className="h-9 px-6 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95 hover:bg-slate-800"
                    >
                        Close Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Portal Security Modal ────────────────────────────────────────────────
function PortalSecurityModal({ customer }: { customer: Customer }) {
    const [isOpen, setIsOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    
    const handleUpdate = async () => {
        if(!password) return toast.error("Critical: Access Key Empty")
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/portal/update-password/${customer._dbId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: password })
            })
            if(res.ok) {
                toast.success("Security Clearance: Key Synchronized")
                setIsOpen(false)
            } else {
                toast.error("Transmission Error: DB Refused")
            }
        } catch (err) {
            toast.error("Network Failure: Secure Link Broken")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    type="button" 
                    size="icon" 
                    variant="outline" 
                    onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        e.nativeEvent.stopImmediatePropagation();
                        setIsOpen(true); 
                    }}
                    className="h-8 w-8 rounded-xl border-slate-200 text-slate-400 hover:text-emerald-600 transition-all"
                >
                    <Shield className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent 
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="max-w-[calc(100%-1rem)] sm:max-w-[500px] p-0 border border-slate-200 shadow-xl rounded-md overflow-hidden bg-white"
            >
                <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md border border-emerald-100 bg-emerald-50 text-emerald-600">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-800">Portal Security Settings</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 font-medium mt-1">B2B Access Management • {customer.id}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-6 space-y-6">
                    <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connection Status</p>
                                <p className={cn("text-xs font-bold uppercase", customer.portalAccess ? "text-emerald-600" : "text-rose-600")}>
                                    {customer.portalAccess ? "Authorized" : "Deactivated"}
                                </p>
                            </div>
                            <Button type="button" variant="outline" className="h-8 px-4 text-xs font-bold text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-md transition-colors" onClick={() => toast.info("Toggle Access in Edit Modal")}>
                                MANAGE ACCESS
                            </Button>
                        </div>
                        <div className="pt-3 border-t border-slate-200/60">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Portal Login Identity</p>
                            <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase">User ID (Mobile):</span>
                                <span className="text-sm font-bold text-[var(--primary)] tabular-nums">{customer.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-medium text-slate-600">Set Access Key / Password</Label>
                        <div className="relative">
                            <Input 
                                autoComplete="new-password"
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter Secure Key"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-10 pr-20 border-slate-200 bg-white font-medium text-sm rounded-md font-sans" 
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" onClick={() => toast.success("Password reset request sent")}>
                                    <RefreshCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-end pt-2">
                            <Button 
                                type="button"
                                disabled={loading}
                                onClick={handleUpdate}
                                className="h-8 px-8 text-white font-bold text-[10px] uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm active:scale-95 transition-all"
                            >
                                {loading ? "Synching..." : "Commit Key"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


export default function CustomerMasterPage() {
    const [isAdmin, setIsAdmin] = useState(true)
    const [showPrivacy, setShowPrivacy] = useState(false)
    const [customersData, setCustomersData] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchCustomers = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/api/customers?size=1000`)
            if (response.ok) {
                const data = await response.json()
                const mapped = (data.items || []).map((apiCust: any) => {
                    const pkId = apiCust.id ?? apiCust.Id ?? 0;
                    return {
                        id: `CXT-${String(pkId).padStart(3, '0')}`,
                        _dbId: pkId,
                        companyName: apiCust.companyName ?? apiCust.CompanyName ?? "",
                        contactPerson: apiCust.contactPerson ?? apiCust.ContactPerson ?? "",
                        phone: apiCust.phone ?? apiCust.Phone ?? "-",
                        email: apiCust.email ?? apiCust.Email ?? "-",
                        gstNumber: apiCust.gstNumber ?? apiCust.GstNumber ?? "-",
                        addressLine1: apiCust.addressLine1 ?? apiCust.AddressLine1 ?? "",
                        city: apiCust.city ?? apiCust.City ?? "",
                        state: apiCust.state ?? apiCust.State ?? "",
                        pincode: apiCust.pincode ?? apiCust.Pincode ?? "",
                        status: (apiCust.isActive ?? apiCust.IsActive) ? "Active" : "Inactive" as const,
                        portalAccess: apiCust.portalAccessEnabled ?? apiCust.PortalAccessEnabled ?? false,
                        netBalance: apiCust.netBalance ?? apiCust.NetBalance ?? 0,
                        createdAt: apiCust.createdAt ? new Date(apiCust.createdAt).toLocaleDateString('en-GB') : "-"
                    };
                })
                setCustomersData(mapped)
            } else {
                toast.error("Telemetry link lost with central database")
            }
        } catch (error) {
            toast.error("Network communication failure")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])


    const columns: ColumnDef<Customer>[] = [
        {
            key: "id",
            label: "Client ID",
            render: (val) => <span className="text-slate-500 text-xs font-medium">{val}</span>
        },
        {
            key: "companyName",
            label: "Customer / Entity",
            render: (val, row) => (
                <div className="flex flex-col gap-0.5 py-1">
                    <Link href={`/customers/${row._dbId}`} className="font-bold text-sm transition-colors hover:opacity-80 text-slate-800">
                        {val || "(No Company Name)"}
                    </Link>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <UserPlus className="h-3.5 w-3.5" /> {row.contactPerson || "N/A"}
                    </span>
                </div>
            )
        },
        {
            key: "phone",
            label: "Communication",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <Smartphone className="h-3 w-3 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 tabular-nums">
                        {val || "Not Listed"}
                    </span>
                </div>
            )
        },
        {
            key: "netBalance",
            label: "Financial Status",
            render: (val) => {
                const isPending = val < 0
                return (
                    <div className="flex flex-col">
                        <div className={cn(
                            "text-sm font-semibold",
                            isPending ? "text-rose-600" : val > 0 ? "text-emerald-600" : "text-slate-400"
                        )}>
                            {isPending ? `Pending: ₹${Math.abs(val).toLocaleString()}` : val > 0 ? `Credit: ₹${val.toLocaleString()}` : "Zero Exposure"}
                        </div>
                        <div className="text-xs font-medium text-slate-400 mt-0.5">Live Exposure Index</div>
                    </div>
                )
            }
        },
        {
            key: "createdAt",
            label: "Initialized",
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-600">{val}</span>
                    <Badge className={cn(
                        "w-fit px-2 py-0 border-none font-medium mt-1 uppercase text-[10px]",
                        row.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                    )}>
                        {row.status}
                    </Badge>
                </div>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: (val, row) => (
                <div className="flex items-center justify-end gap-1.5 px-2" onClick={(e) => e.stopPropagation()}>
                    <Can I="edit" a="sales">
                        <EditCustomerModal customer={row} fetchCustomers={fetchCustomers} />
                    </Can>
                    <Can I="delete" a="sales">
                        <DeleteConfirmModal customer={row} fetchCustomers={fetchCustomers} />
                    </Can>
                    <Can I="approve" a="sales">
                        <PortalSecurityModal customer={row} />
                    </Can>
                </div>
            )
        }
    ]

    const [isImportOpen, setIsImportOpen] = useState(false)

    return (
        <div className="space-y-6 font-sans">
            {/* ── Header Area ────────────────────────────────────────── */}
            <div className="flex flex-row items-center justify-between gap-2 px-4 sm:px-0 mb-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-slate-900 leading-none">Customer Master</h1>
                </div>

                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={fetchCustomers}
                        className="h-9 w-9 p-0 rounded-lg border-slate-200 text-slate-500 hover:text-slate-800 transition-all shadow-sm"
                    >
                        <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                    <Can I="create" a="sales">
                        <CustomerAddModal
                            onSuccess={fetchCustomers}
                            trigger={
                                <Button type="button" className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                                    <Plus className="h-4 w-4" /> Register Client
                                </Button>
                            }
                        />
                    </Can>
                </div>
            </div>

            {/* ── Main Data Grid ─────────────────────────── */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <DataGrid
                    data={customersData}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    enableDateRange={true}
                    dateFilterKey="createdAt"
                    searchPlaceholder="Search Name, Phone, or GST..."
                />
            </div>
        </div>
    );
}
