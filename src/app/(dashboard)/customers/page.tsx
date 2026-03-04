"use client"

import React, { useState } from "react"
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
import { Button } from "@/components/ui/button"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import Link from "next/link"

// ─── Types ──────────────────────────────────────────────────────────────────
export type Customer = {
    id: string
    name: string
    gstNumber: string
    address: string
    state: string
    contactNumber: string
    contactPerson?: string
    email?: string
    status: "Active" | "Inactive"
    portalAccess: boolean
    totalWorkVolume: number
    netBalance: number
    lastVisitDate: string
    frequency: number // Visits this month
    orderSource: "WhatsApp" | "Mail" | "Walk-in"
    createdBy: string
    createdAt: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockCustomers: Customer[] = [
    {
        id: "CUST-001",
        name: "Shabdolok Publications",
        gstNumber: "09ABCDE1234F1Z5",
        address: "12/4, Sector 5, Rohini",
        state: "Delhi",
        contactNumber: "9540046568",
        status: "Active",
        portalAccess: true,
        totalWorkVolume: 125000,
        netBalance: -1135, // Negative means pending
        lastVisitDate: "2026-02-28",
        frequency: 4,
        orderSource: "WhatsApp",
        createdBy: "Admin",
        createdAt: "2025-12-01"
    },
    {
        id: "CUST-002",
        name: "Gaur City Center Admin",
        gstNumber: "GST-PENDING",
        address: "SF-37, Gaur City, Noida",
        state: "Uttar Pradesh",
        contactNumber: "9988776655",
        status: "Active",
        portalAccess: false,
        totalWorkVolume: 45000,
        netBalance: 500, // Positive means advance
        lastVisitDate: "2026-03-01",
        frequency: 2,
        orderSource: "Mail",
        createdBy: "Sunil",
        createdAt: "2026-01-15"
    },
    {
        id: "CUST-003",
        name: "Reliable Printers",
        gstNumber: "07AAACR1234Q1Z2",
        address: "Okhla Phase 3",
        state: "Delhi",
        contactNumber: "8877665544",
        status: "Inactive",
        portalAccess: false,
        totalWorkVolume: 0,
        netBalance: 0,
        lastVisitDate: "2025-11-20",
        frequency: 0,
        orderSource: "Walk-in",
        createdBy: "Admin",
        createdAt: "2025-10-10"
    }
]

export default function CustomerMasterPage() {
    const [isAdmin, setIsAdmin] = useState(true) // Mock role
    const [showPrivacy, setShowPrivacy] = useState(false)

    // ─── Edit Customer Modal ───────────────────
    function EditCustomerModal({ customer }: { customer: Customer }) {
        const [portalActive, setPortalActive] = useState(customer.portalAccess)
        return (
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[85vh] flex flex-col">
                <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md border transition-all" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                            <Edit2 className="h-4 w-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">Update Customer Record</DialogTitle>
                            <DialogDescription className="text-[10px] text-slate-400 font-medium tracking-tight">
                                {customer.id} • Last Updated: {customer.createdAt}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-6 py-6 space-y-6">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Info className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organizational Profile</span>
                                </div>
                                <Badge variant="outline" className="text-[9px] font-bold uppercase bg-slate-50 text-slate-600 border-slate-200 px-2 rounded-sm" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary), white 95%)' }}>
                                    {customer.id}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Company Name <span className="text-rose-500">*</span></Label>
                                    <Input defaultValue={customer.name} className="h-9 border-slate-200 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all rounded-md" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Contact Person <span className="text-rose-500">*</span></Label>
                                    <Input defaultValue={customer.contactPerson ?? ""} placeholder="Key Contact Name" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Phone Number <span className="text-rose-500">*</span></Label>
                                    <Input defaultValue={customer.contactNumber} className="h-9 border-slate-200 bg-white font-bold text-sm rounded-md" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Email Address</Label>
                                    <Input type="email" defaultValue={customer.email ?? ""} placeholder="office@company.com" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Tax & Financials */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tax & Financial Defaults</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-md border border-slate-100">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">GSTIN Number</Label>
                                    <Input defaultValue={customer.gstNumber} className="h-9 border-slate-200 bg-white font-bold text-sm uppercase rounded-md" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Opening Balance (₹)</Label>
                                    <Input type="number" defaultValue={customer.netBalance} className="h-9 border-slate-200 bg-white font-bold text-sm rounded-md" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Address Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Address</span>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Address Line 1</Label>
                                    <Input defaultValue={customer.address} placeholder="Street, Building, Area" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">State <span className="text-rose-500">*</span></Label>
                                        <Input defaultValue={customer.state} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Pincode</Label>
                                        <Input placeholder="6-digit" maxLength={6} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Access Policy */}
                        <div className="p-3 bg-white rounded-md border border-slate-200 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md transition-all ${portalActive ? 'text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-200'}`} style={portalActive ? { background: 'color-mix(in srgb, var(--primary), white 90%)', color: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Update Client Portal Access</p>
                                    <p className="text-[10px] text-slate-400 font-medium">B2B Dashboard Visibility</p>
                                </div>
                            </div>
                            <Switch checked={portalActive} onCheckedChange={setPortalActive} className="data-[state=checked]:bg-primary" />
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                    <Button variant="ghost" className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800">Discard Changes</Button>
                    <Button
                        onClick={() => toast.success("Record Updated", { description: `${customer.name} saved successfully.` })}
                        className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                        style={{ background: 'var(--primary)' }}
                    >
                        Save Master Record
                    </Button>
                </DialogFooter>
            </DialogContent>
        )
    }

    // ─── Delete Confirm Modal ────────────────────────────────────────────────
    function DeleteConfirmModal({ customer }: { customer: Customer }) {
        return (
            <DialogContent className="max-w-[400px] p-0 border border-slate-200 shadow-xl rounded-md overflow-hidden bg-white font-sans sm:max-w-[400px]">
                <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-rose-50/20">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-rose-100 text-rose-600 border border-rose-200">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">Delete Customer Record</DialogTitle>
                            <DialogDescription className="text-[10px] text-rose-500 font-medium">Critical Administrative Action</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-6 font-sans space-y-4">
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                        Permanently remove <span className="font-bold underline underline-offset-2" style={{ color: 'var(--primary)' }}>{customer.name}</span> from the master directory?
                    </p>
                    <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex gap-3 items-center">
                        <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <p className="text-[10px] font-medium text-slate-500 italic">
                            All linked job history, invoices, and ledger records will be archived but hidden from active view.
                        </p>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-end gap-2">
                    <Button variant="ghost" className="h-9 rounded-md text-xs font-medium text-slate-400 hover:text-slate-600 px-4">Keep Record</Button>
                    <Button
                        className="h-9 px-6 rounded-md bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white shadow-sm"
                        onClick={() => toast.error("Customer Removed")}
                    >
                        Confirm Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        )
    }

    // ─── Portal Control Modal ────────────────────────────────────────────────
    function PortalControlModal({ customer }: { customer: Customer }) {
        const [access, setAccess] = useState(customer.portalAccess)
        const [password, setPassword] = useState("PASS1234")
        const [showPass, setShowPass] = useState(false)

        return (
            <DialogContent className="max-w-[420px] p-0 border border-slate-200 shadow-xl rounded-md overflow-hidden bg-white font-sans">
                <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md border ${access ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                            <Shield className="h-4 w-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">Portal Security Settings</DialogTitle>
                            <DialogDescription className="text-[10px] text-slate-400 font-medium">B2B Access Management • {customer.id}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-6 space-y-6 font-sans">
                    {/* Status Toggle Pin */}
                    <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Connection Status</p>
                            <p className={`text-[11px] font-bold ${access ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {access ? 'AUTHORIZED' : 'RESTRICTED'}
                            </p>
                        </div>
                        <Button
                            onClick={() => setAccess(!access)}
                            className={`h-8 px-4 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm ${access ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                        >
                            {access ? 'Revoke Access' : 'Authorize Client'}
                        </Button>
                    </div>

                    {/* Password Control */}
                    {access && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Access Key / Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-9 rounded-md bg-white border-slate-200 font-bold text-slate-800 px-3 pr-20 text-sm"
                                        style={{ '--ring': 'var(--primary)' } as any}
                                    />
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-slate-400"
                                            style={{ '--hover-color': 'var(--primary)' } as any}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                                            onClick={() => setShowPass(!showPass)}
                                        >
                                            {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-slate-400"
                                            style={{ '--hover-color': 'var(--primary)' } as any}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                                            onClick={() => setPassword(Math.random().toString(36).slice(-8).toUpperCase())}
                                        >
                                            <RefreshCcw className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-[9px] font-medium text-slate-400 italic">User ID: Registered Mobile No. • {customer.contactNumber}</p>
                            </div>

                            <Button className="w-full h-8 rounded-md text-white hover:opacity-90 font-bold text-[10px] uppercase tracking-wider gap-2 shadow-sm" style={{ background: 'var(--primary)' }}>
                                <LinkIcon className="h-3.5 w-3.5" /> Send Login Credentials
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-end">
                    <Button
                        className="h-9 px-6 rounded-md bg-slate-900 hover:bg-black font-bold text-xs text-white"
                        onClick={() => toast.success("Permissions Synced")}
                    >
                        Sync Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        )
    }

    const columns: ColumnDef<Customer>[] = [
        {
            key: "id",
            label: "Client ID",
            render: (val) => <span className="font-mono font-black text-slate-900 text-xs uppercase italic">{val}</span>
        },
        {
            key: "name",
            label: "Customer / Entity",
            render: (val, row) => (
                <div className="flex flex-col gap-0.5 py-1">
                    <Link href={`/customers/${row.id}`} className="font-black text-sm tracking-tight transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>
                        {val}
                    </Link>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="h-2 w-2" /> {row.state}
                    </span>
                </div>
            )
        },
        {
            key: "contactNumber",
            label: "Contact No.",
            render: (val) => {
                const isMasked = !isAdmin && !showPrivacy;
                const displayVal = isMasked
                    ? `${val.substring(0, 2)}******${val.substring(val.length - 2)}`
                    : val;

                return (
                    <div className="flex items-center">
                        <span className={`text-[13px] font-black tracking-widest tabular-nums ${isMasked ? 'text-slate-300' : 'text-slate-700'}`}>
                            {displayVal}
                        </span>
                    </div>
                );
            }
        },
        {
            key: "netBalance",
            label: "Net Balance",
            render: (val) => {
                const isPending = val < 0
                return (
                    <div className="flex flex-col">
                        <span className={`font-black tracking-tighter text-sm italic ${isPending ? 'text-rose-600' : val > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                            {isPending ? `Pending: ₹${Math.abs(val)}` : val > 0 ? `Advance: ₹${val}` : "Settled / Nil"}
                        </span>
                        {isPending && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Due Payment</span>}
                    </div>
                )
            }
        },
        {
            key: "lastVisitDate",
            label: "Recent Ops",
            render: (val, row) => {
                const isActiveThisMonth = row.frequency > 0
                return (
                    <div className="flex items-center gap-3">
                        <Badge className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border-none shadow-sm ${isActiveThisMonth
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                            }`}>
                            {isActiveThisMonth ? 'Active' : 'Dormant'}
                        </Badge>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase">{val}</span>
                            <span className="text-[9px] font-bold text-slate-400 italic">{row.frequency} Tickets Logged</span>
                        </div>
                    </div>
                )
            }
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: (val, row) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    {/* Edit */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="outline" className="h-7 w-7 rounded-md bg-white transition-all shadow-none" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }} title="Edit">
                                <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                        </DialogTrigger>
                        <EditCustomerModal customer={row} />
                    </Dialog>
                    {/* Delete */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </DialogTrigger>
                        <DeleteConfirmModal customer={row} />
                    </Dialog>
                    {/* Portal Access */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="outline" className={`h-7 w-7 rounded-md transition-all shadow-none ${row.portalAccess ? 'border-emerald-300 text-emerald-600 bg-white hover:bg-emerald-50' : 'border-slate-200 text-slate-400 bg-white hover:opacity-80'}`} style={!row.portalAccess ? { color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' } : {}} title="Portal Access">
                                <Shield className="h-3.5 w-3.5" />
                            </Button>
                        </DialogTrigger>
                        <PortalControlModal customer={row} />
                    </Dialog>
                </div>
            )
        }
    ]

    const [isImportOpen, setIsImportOpen] = useState(false)

    return (
        <div className="space-y-4 font-sans bg-slate-50/30 p-4 rounded-lg">
            {/* ── Header Area ────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4 mb-2 px-1">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">Customer Master</h1>
                    <p className="text-xs font-medium text-slate-500">Manage client directory, GST records, and business relationships</p>
                </div>

                <div className="flex items-center gap-3">
                    <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-9 px-4 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans">
                                <Upload className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Bulk Import
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white font-sans">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100 text-slate-500 transition-all" style={{ color: 'var(--primary)' }}>
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">Data Migration Utility</DialogTitle>
                                        <DialogDescription className="text-[10px] text-slate-400 font-medium">Bulk import client records via Excel/CSV</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="px-6 py-8 space-y-6">
                                <div className="border border-dashed border-slate-200 rounded-md p-8 flex flex-col items-center justify-center text-center gap-4 hover:bg-slate-50 transition-all cursor-pointer group">
                                    <div className="h-12 w-12 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 transition-colors group-hover:opacity-80" style={{ color: 'var(--primary)' }}>
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-700">Select Customer Ledger File</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">XLSX, CSV (Max 2.5MB)</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-8 border-slate-200 font-bold text-[10px] uppercase tracking-tight transition-all" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }}>
                                        Download Schema Template
                                    </Button>
                                </div>

                                <div className="p-3 bg-slate-900 rounded-md text-white flex items-start gap-3 shadow-md">
                                    <Info className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-300">Validation Schema</p>
                                        <p className="text-[10px] font-medium opacity-80 leading-normal">
                                            Required: Company_Name, Contact_Primary, GSTIN_Optional, Shipping_State_Code
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-end gap-2">
                                <Button variant="ghost" onClick={() => setIsImportOpen(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800">Cancel</Button>
                                <Button
                                    onClick={() => setIsImportOpen(false)}
                                    className="h-9 px-6 rounded-md font-bold text-xs text-white shadow-sm"
                                    style={{ background: 'var(--primary)' }}
                                >
                                    Process & Map Records
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <CustomerAddModal
                        trigger={
                            <Button className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-md gap-2 transition-all active:scale-95" style={{ background: 'var(--primary)' }}>
                                <Plus className="h-4 w-4" /> Add New Customer
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* ── Main Data Intelligence Grid ─────────────────────────── */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm px-1">
                <DataGrid
                    data={mockCustomers}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    searchPlaceholder="Search Name, Phone, or GST..."
                    toolbarClassName="border-b px-4 py-1.5 bg-white"
                />
            </div>
        </div>
    );
}
