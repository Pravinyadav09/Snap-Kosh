"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useMemo } from "react"
import {
    Plus, UserCog, Trash2, Edit,
    ShieldCheck, Lock, CheckCircle2,
    Check, X, Activity, Users, Info,
    FileText, Box, Wallet, Users2,
    BarChart3, Settings, RefreshCcw, AlertTriangle, Printer, ShoppingCart, Calendar as CalendarIcon, Briefcase, Cpu, Truck, Wrench, Calculator,
    LayoutDashboard, Database, ListChecks, UserCircle, Gauge, BookOpen, ClipboardCheck, Layers, Undo2, Package, Boxes, Maximize2, Cog, ExternalLink, CreditCard, Tag, FileSpreadsheet, Landmark, LifeBuoy, User, Banknote, Search, ChevronDown, ChevronRight
} from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ─── Types ──────────────────────────────────────────────────────────────────
type Role = {
    id: number
    name: string
    permissions: string | null // JSON string from backend
    isActive: boolean
}

type PermissionScope = {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    approve: boolean
    print: boolean
}

const modules = [
    {
        name: "Dashboard & Analysis",
        id: "dashboard_root",
        icon: LayoutDashboard,
        validActions: ["view"],
        submodules: [
            { id: "dashboard", name: "Main Dashboard", icon: LayoutDashboard, validActions: ["view"] },
        ]
    },
    {
        name: "CRM & Sales",
        id: "sales_root",
        icon: Users,
        validActions: ["view", "create", "edit", "delete", "print", "approve"],
        submodules: [
            { id: "customers", name: "Customers", icon: UserCircle, validActions: ["view", "create", "edit", "delete"] },
            { id: "customers_analysis", name: "Customer Analysis", icon: BarChart3, validActions: ["view"] },
            { id: "quotations", name: "Quotations", icon: Calculator, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "invoices", name: "Invoices", icon: FileText, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "client_portals", name: "Client Portals", icon: ExternalLink, validActions: ["view"] },
        ]
    },
    {
        name: "Production",
        id: "production_root",
        icon: Activity,
        validActions: ["view", "create", "edit", "delete", "print", "approve"],
        submodules: [
            { id: "production", name: "Production Jobs", icon: Activity, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "scheduler", name: "Scheduler", icon: CalendarIcon, validActions: ["view", "create", "edit", "delete", "print"] },
            { id: "readings", name: "Daily Readings", icon: BookOpen, validActions: ["view", "create", "edit", "delete"] },
        ]
    },
    {
        name: "Inventory",
        id: "inventory_root",
        icon: Package,
        validActions: ["view", "create", "edit", "delete", "print", "approve"],
        submodules: [
            { id: "purchases", name: "Purchase Order", icon: ShoppingCart, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "inventory", name: "GRN (Stock In)", icon: Layers, validActions: ["view", "create", "edit", "delete", "print"] },
            { id: "returns", name: "Return to Supplier", icon: Undo2, validActions: ["view", "create", "edit", "delete", "print"] },
            { id: "stock", name: "Stock", icon: Package, validActions: ["view"] },
        ]
    },
    {
        name: "Masters",
        id: "masters_root",
        icon: Database,
        validActions: ["view", "create", "edit", "delete"],
        submodules: [
            { id: "masters", name: "Master Hub", icon: Database, validActions: ["view", "create", "edit", "delete"] },
            { id: "machines", name: "Machine Master", icon: Gauge, validActions: ["view", "create", "edit", "delete"] },
            { id: "paper_stocks", name: "Paper Stocks Master", icon: Boxes, validActions: ["view", "create", "edit", "delete"] },
            { id: "media_stocks", name: "Media Stocks Master", icon: Maximize2, validActions: ["view", "create", "edit", "delete"] },
            { id: "suppliers", name: "Suppliers Master", icon: Users2, validActions: ["view", "create", "edit", "delete"] },
            { id: "processes", name: "Process Masters", icon: Cog, validActions: ["view", "create", "edit", "delete"] },
            { id: "users", name: "User Master", icon: Users, validActions: ["view", "create", "edit", "delete"] },
            { id: "roles", name: "Role Master", icon: UserCog, validActions: ["view", "create", "edit", "delete"] },
            { id: "dropdowns", name: "Dropdown Master", icon: ListChecks, validActions: ["view", "create", "edit", "delete"] },
        ]
    },
    {
        name: "Logistics",
        id: "logistics_root",
        icon: Truck,
        validActions: ["view", "create", "edit", "delete", "print", "approve"],
        submodules: [
            { id: "dispatch", name: "Dispatch Board", icon: Truck, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
        ]
    },
    {
        name: "Finance",
        id: "finance_root",
        icon: Wallet,
        validActions: ["view", "create", "edit", "delete", "print", "approve"],
        submodules: [
            { id: "job_finance", name: "Job Finance", icon: Banknote, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "finance", name: "Expenses", icon: CreditCard, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "expense_categories", name: "Expense Categories", icon: Tag, validActions: ["view", "create", "edit", "delete"] },
        ]
    },
    {
        name: "Outsource",
        id: "outsource_root",
        icon: ExternalLink,
        validActions: ["view", "create", "edit", "delete", "print"],
        submodules: [
            { id: "vendors", name: "Vendors", icon: Users2, validActions: ["view", "create", "edit", "delete", "print"] },
            { id: "outsource_jobs", name: "Outsource Jobs", icon: ExternalLink, validActions: ["view", "create", "edit", "delete", "print"] },
        ]
    },
    {
        name: "Maintenance",
        id: "maintenance_root",
        icon: Wrench,
        validActions: ["view", "create", "edit", "delete", "print"],
        submodules: [
            { id: "maintenance", name: "Maintenance Center", icon: Wrench, validActions: ["view", "create", "edit", "delete", "print"] },
            { id: "tasks", name: "My Tasks", icon: ClipboardCheck, validActions: ["view", "create", "edit", "delete"] },
        ]
    },
    {
        name: "Reports",
        id: "reports_root",
        icon: BarChart3,
        validActions: ["view", "print"],
        submodules: [
            { id: "reports", name: "Reports", icon: BarChart3, validActions: ["view", "print"] },
            { id: "ledger", name: "Paper Usage Ledger", icon: FileSpreadsheet, validActions: ["view", "print"] },
            { id: "gst", name: "GST Reports", icon: Landmark, validActions: ["view", "print"] },
        ]
    },
    {
        name: "Management",
        id: "management_root",
        icon: Settings,
        validActions: ["view", "create", "edit", "delete"],
        submodules: [
            { id: "support", name: "Support Intelligence", icon: LifeBuoy, validActions: ["view", "create", "edit", "delete"] },
            { id: "settings", name: "Settings", icon: Settings, validActions: ["view", "edit"] },
        ]
    },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    
    // Form States
    const [roleName, setRoleName] = useState("")

    const fetchRoles = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/roles`)
            if (res.ok) setRoles(await res.json())
        } catch (err) {
            toast.error("Security sync failed")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    const handleOpenDialog = (role?: Role) => {
        if (role) {
            setSelectedRole(role)
            setRoleName(role.name)
        } else {
            setSelectedRole(null)
            setRoleName("")
        }
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        if (!roleName) {
            toast.error("Role Name Required")
            return
        }

        const payload = {
            id: selectedRole?.id || 0,
            name: roleName,
            permissions: null, // Permissions no longer managed at role level
            isActive: true
        }

        try {
            const method = selectedRole ? "PUT" : "POST"
            const url = selectedRole ? `${API_BASE}/api/roles/${selectedRole.id}` : `${API_BASE}/api/roles`
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(selectedRole ? "Role Identity Updated" : "Role Identity Defined", {
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                })
                setIsDialogOpen(false)
                fetchRoles()
            } else {
                toast.error("Operation Failed", { description: "Failed to save role identity." })
            }
        } catch (err) {
            toast.error("Network synchronization failed")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Remove this role identity? This action cannot be undone.")) return
        try {
            const res = await fetch(`${API_BASE}/api/roles/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Role Removed", { icon: <AlertTriangle className="h-4 w-4 text-rose-500" /> })
                fetchRoles()
            }
        } catch (err) {
            toast.error("Network error")
        }
    }

    const columns: ColumnDef<Role>[] = useMemo(() => [
        {
            key: "name",
            label: "Role Name",
            render: (val, row) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0">
                        <Lock className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm leading-none">{val as string}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">SID-{String(row.id).padStart(3, '0')}</span>
                    </div>
                </div>
            )
        },
        {
            key: "id",
            label: "Actions",
            headerClassName: "text-right",
            className: "text-right",
            filterable: false,
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button 
                        size="icon" variant="outline"
                        className="h-7 w-7 rounded-md bg-white shadow-none transition-all hover:scale-105"
                        style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }}
                        onClick={() => handleOpenDialog(row)}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                        size="icon" variant="outline"
                        className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-none hover:scale-105"
                        onClick={() => handleDelete(row.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ], [])

    return (
        <div className="space-y-1 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2 mb-2 px-4 sm:px-1 uppercase">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-100">
                        <UserCog className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-slate-900 leading-none">Role Master</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchRoles} className="h-9 px-3 border-slate-200 text-slate-500 hover:text-slate-800 font-medium text-xs rounded-lg shadow-sm">
                        <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                onClick={() => handleOpenDialog()}
                                className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95"
                                style={{ background: 'var(--primary)' }}
                            >
                                <Plus className="h-4 w-4" /> New Role
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[450px] p-0 overflow-hidden border border-slate-200 rounded-xl shadow-xl bg-white font-sans">
                            <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                                        <UserCog className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold text-slate-800 leading-none">{selectedRole ? "Edit Role" : "New Role"}</DialogTitle>
                                        <DialogDescription className="text-xs text-slate-400 font-medium mt-1">Define system role designations</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Role Name <span className="text-rose-500">*</span></Label>
                                    <Input
                                        value={roleName}
                                        onChange={e => setRoleName(e.target.value)}
                                        placeholder="e.g. Operations Manager"
                                        className="h-9 border-slate-200 bg-slate-50/50 rounded-lg font-medium text-sm focus:bg-white"
                                    />
                                </div>
                                
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="flex gap-2">
                                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                        <p className="text-[10px] leading-relaxed text-blue-700">
                                            <strong>Note:</strong> Permissions are now managed individually within the <strong>User Master</strong> page. This role serves as a designation for organizational categorization.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-2">
                                <Button variant="ghost" className="h-9 px-4 font-medium text-xs text-slate-500 rounded-lg" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={handleSave}
                                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-lg transition-all active:scale-95 flex items-center gap-2"
                                    style={{ background: 'var(--primary)' }}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    {selectedRole ? "Update Role" : "Save Role"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                <DataGrid
                    data={roles}
                    columns={columns}
                    isLoading={isLoading}
                    hideTitle={true}
                    searchPlaceholder="Search roles by name..."
                />
            </div>
        </div>
    )
}
