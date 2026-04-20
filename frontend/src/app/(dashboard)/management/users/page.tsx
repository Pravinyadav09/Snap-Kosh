"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useMemo } from "react"
import {
    UserPlus, Trash2, Edit2,
    Mail, Key, ShieldCheck, RefreshCcw, CheckCircle2, AlertCircle,
    Eye, EyeOff, ChevronDown, ChevronRight,
    LayoutDashboard, Users, Activity, Package, Database, Truck, Wallet, ExternalLink, Wrench, BarChart3, Settings,
    UserCircle, Calculator, FileText, CalendarIcon, BookOpen, ShoppingCart, Layers, Undo2, Gauge, Boxes, Maximize2, Users2, Cog, UserCog, ListChecks, Banknote, CreditCard, Tag, FileSpreadsheet, Landmark, LifeBuoy, ClipboardCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { toast } from "sonner"
import { Can } from "@/components/shared/permission-context"

// ─── Types ──────────────────────────────────────────────────────────────────
type UserType = {
    id: number
    employeeId: string
    fullName: string
    email: string
    roleId: number
    department: string
    status: "Active" | "Inactive" | "Suspended"
    phone: string
    passwordHash?: string
}

type Role = { id: number; name: string; permissions?: string | null }

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
        name: "Dashboard & Analysis", id: "dashboard_root", icon: LayoutDashboard,
        submodules: [{ id: "dashboard", name: "Main Dashboard", icon: LayoutDashboard, validActions: ["view"] }]
    },
    {
        name: "CRM & Sales", id: "sales_root", icon: Users,
        submodules: [
            { id: "customers", name: "Customers", icon: UserCircle, validActions: ["view", "create", "edit", "delete"] },
            { id: "customers_analysis", name: "Customer Analysis", icon: BarChart3, validActions: ["view"] },
            { id: "quotations", name: "Quotations", icon: Calculator, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "invoices", name: "Invoices", icon: FileText, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "client_portals", name: "Client Portals", icon: ExternalLink, validActions: ["view"] },
        ]
    },
    {
        name: "Production", id: "production_root", icon: Activity,
        submodules: [
            { id: "production", name: "Production Jobs", icon: Activity, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "scheduler", name: "Scheduler", icon: CalendarIcon, validActions: ["view", "create", "edit", "delete", "print"] },
            { id: "readings", name: "Daily Readings", icon: BookOpen, validActions: ["view", "create", "edit", "delete"] },
        ]
    },
    {
        name: "Inventory", id: "inventory_root", icon: Package,
        submodules: [
            { id: "purchases", name: "Purchase Order", icon: ShoppingCart, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "inventory", name: "GRN (Stock In)", icon: Layers, validActions: ["view", "create", "edit", "delete", "print"] },
            { id: "returns", name: "Return to Supplier", icon: Undo2, validActions: ["view", "create", "edit", "delete", "print"] },
            { id: "stock", name: "Stock", icon: Package, validActions: ["view"] },
        ]
    },
    {
        name: "Masters", id: "masters_root", icon: Database,
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
        name: "Logistics", id: "logistics_root", icon: Truck,
        submodules: [{ id: "dispatch", name: "Dispatch Board", icon: Truck, validActions: ["view", "create", "edit", "delete", "print", "approve"] }]
    },
    {
        name: "Finance", id: "finance_root", icon: Wallet,
        submodules: [
            { id: "job_finance", name: "Job Finance", icon: Banknote, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "finance", name: "Expenses", icon: CreditCard, validActions: ["view", "create", "edit", "delete", "print", "approve"] },
            { id: "expense_categories", name: "Expense Categories", icon: Tag, validActions: ["view", "create", "edit", "delete"] },
        ]
    },
    {
        name: "Outsource", id: "outsource_root", icon: ExternalLink,
        submodules: [
            { id: "vendors", name: "Vendors", icon: Users2, validActions: ["view", "create", "edit", "delete", "print"] },
            { id: "outsource_jobs", name: "Outsource Jobs", icon: ExternalLink, validActions: ["view", "create", "edit", "delete", "print"] },
        ]
    },
    {
        name: "Maintenance", id: "maintenance_root", icon: Wrench,
        submodules: [
            { id: "maintenance", name: "Maintenance Center", icon: Wrench, validActions: ["view", "create", "edit", "delete", "print"] },
            { id: "tasks", name: "My Tasks", icon: ClipboardCheck, validActions: ["view", "create", "edit", "delete"] },
        ]
    },
    {
        name: "Reports", id: "reports_root", icon: BarChart3,
        submodules: [
            { id: "reports", name: "Reports", icon: BarChart3, validActions: ["view", "print"] },
            { id: "ledger", name: "Paper Usage Ledger", icon: FileSpreadsheet, validActions: ["view", "print"] },
            { id: "gst", name: "GST Reports", icon: Landmark, validActions: ["view", "print"] },
        ]
    },
    {
        name: "Management", id: "management_root", icon: Settings,
        submodules: [
            { id: "support", name: "Support Intelligence", icon: LifeBuoy, validActions: ["view", "create", "edit", "delete"] },
            { id: "settings", name: "Settings", icon: Settings, validActions: ["view", "edit"] },
        ]
    },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManagementUsersPage() {
    const [users, setUsers] = useState<UserType[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

    // Form states
    const [employeeId, setEmployeeId] = useState("")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [roleId, setRoleId] = useState<string>("")
    const [department, setDepartment] = useState<string>("")
    const [status, setStatus] = useState<string>("Active")
    const [showPassword, setShowPassword] = useState(false)
    const [useCustomPermissions, setUseCustomPermissions] = useState(false)
    const [permissionMap, setPermissionMap] = useState<Record<string, PermissionScope>>({})
    const [showPermissions, setShowPermissions] = useState(false)

    const fetchAllData = async () => {
        setIsLoading(true)
        try {
            const [usersRes, rolesRes] = await Promise.all([
                fetch(`${API_BASE}/api/users`),
                fetch(`${API_BASE}/api/roles`)
            ])
            if (usersRes.ok) setUsers(await usersRes.json())
            if (rolesRes.ok) setRoles(await rolesRes.json())
        } catch (err) {
            toast.error("Network synchronization failed")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    const handleOpenDialog = (user?: UserType) => {
        if (user) {
            setSelectedUser(user)
            setEmployeeId(user.employeeId || "")
            setFullName(user.fullName)
            setEmail(user.email)
            setPhone(user.phone)
            setRoleId(user.roleId.toString())
            setDepartment(user.department)
            setStatus(user.status)
            setPassword(user.passwordHash || "")
            // Load user-level permissions
            if ((user as any).permissions) {
                try {
                    setPermissionMap(JSON.parse((user as any).permissions))
                    setUseCustomPermissions(true)
                } catch (e) {
                    setPermissionMap({})
                    setUseCustomPermissions(false)
                }
            } else {
                setPermissionMap({})
                setUseCustomPermissions(false)
            }
        } else {
            // Auto-generate next Employee ID based on current users
            const nextSeq = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            const autoId = `DEP-${String(nextSeq).padStart(4, '0')}`;
            
            setSelectedUser(null)
            setEmployeeId(autoId)
            setFullName("")
            setEmail("")
            setPhone("")
            setRoleId("")
            setDepartment("")
            setStatus("Active")
            setPassword("")
            setPermissionMap({})
            setUseCustomPermissions(false)
        }
        setShowPermissions(false)
        setIsDialogOpen(true)
    }

    const togglePermission = (moduleId: string, type: keyof PermissionScope) => {
        setPermissionMap(prev => {
            const current = prev[moduleId] || { view: false, create: false, edit: false, delete: false, approve: false, print: false }
            return {
                ...prev,
                [moduleId]: { ...current, [type]: !current[type] }
            }
        })
    }

    const handleSave = async () => {
        // Frontend check for duplicate email
        const emailExists = users.some(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.id !== (selectedUser?.id || 0)
        );

        if (emailExists) {
            toast.error("Account identity conflict detected", {
                description: `The email address '${email}' is already registered to another user profile.`,
                icon: <AlertCircle className="h-4 w-4 text-rose-500" />
            });
            return;
        }

        const payload = {
            id: selectedUser?.id || 0,
            employeeId,
            fullName,
            email,
            phone,
            roleId: parseInt(roleId),
            department,
            status,
            permissions: useCustomPermissions ? JSON.stringify(permissionMap) : null,
            passwordHash: password || "temp_hash" 
        }

        try {
            const method = selectedUser ? "PUT" : "POST"
            const url = selectedUser ? `${API_BASE}/api/users/${selectedUser.id}` : `${API_BASE}/api/users`
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(selectedUser ? "Access Credentials Updated" : "Personnel Provisioned", {
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                })
                setIsDialogOpen(false)
                fetchAllData()
            } else {
                const errData = await res.json()
                toast.error("Operation failed", { description: errData.message || "Security server rejected the request." })
            }
        } catch (err) {
            toast.error("Network error")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Authorize removal of access rights? This action is permanent.")) return
        try {
            const res = await fetch(`${API_BASE}/api/users/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Identity Neutralized", { icon: <AlertCircle className="h-4 w-4 text-rose-500" /> })
                fetchAllData()
            }
        } catch (err) {
            toast.error("Network error")
        }
    }

    const handlePasswordReset = async () => {
        if (!password) {
            toast.error("Please enter a new password");
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/users/${selectedUser?.id}/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: password })
            });

            if (res.ok) {
                toast.success("Security Credentials Updated");
                setPassword("");
            } else {
                toast.error("Security update rejected");
            }
        } catch (err) {
            toast.error("Network error during security update");
        }
    }

    const columns: ColumnDef<UserType>[] = [
        {
            key: "fullName",
            label: "User",
            render: (val, row) => (
                <div className="flex items-center gap-3 py-1">
                    <Avatar className="h-8 w-8 rounded-lg border border-slate-200 shadow-sm">
                        <AvatarFallback className="font-bold text-xs" style={{ background: 'color-mix(in srgb, var(--primary), white 90%)', color: 'var(--primary)' }}>
                            {(val as string).split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm leading-none">{val as string}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium tracking-tight">UID-{String(row.id).padStart(4, '0')}</span>
                            {row.employeeId && (
                                <span className="text-[9px] px-1 bg-slate-100 text-slate-500 rounded font-black border border-slate-200">{row.employeeId}</span>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "email",
            label: "Email",
            render: (val) => (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Mail className="h-3 w-3 text-slate-400" /> {val as string}
                </div>
            )
        },
        {
            key: "roleId",
            label: "Role",
            render: (val) => {
                const roleName = roles.find(r => r.id === val)?.name || "Unassigned"
                return (
                    <Badge variant="outline" className="font-bold text-[10px] px-2.5 rounded-md border" style={{ background: 'color-mix(in srgb, var(--primary), white 93%)', color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }}>
                        {roleName}
                    </Badge>
                )
            }
        },
        {
            key: "department",
            label: "Department",
            render: (val) => <span className="text-xs font-medium text-slate-500">{val as string || "—"}</span>
        },
        {
            key: "status",
            label: "Status",
            render: (val) => {
                const styles: Record<string, string> = {
                    Active: "bg-emerald-50 text-emerald-600 border-emerald-100",
                    Inactive: "bg-slate-100 text-slate-500 border-slate-200",
                    Suspended: "bg-rose-50 text-rose-600 border-rose-100"
                }
                return (
                    <Badge variant="outline" className={`${styles[val as string] || "bg-slate-100"} text-[10px] font-bold rounded-md px-2`}>
                        {val as string}
                    </Badge>
                )
            }
        },
        {
            key: "id",
            label: "Actions",
            headerClassName: "text-right",
            className: "text-right",
            filterable: false,
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Can I="edit" a="users">
                        <Button 
                            size="icon" variant="outline"
                            className="h-7 w-7 rounded-md bg-white shadow-none transition-all hover:scale-105"
                            style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }}
                            onClick={() => handleOpenDialog(row)}
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                    </Can>
                    <Can I="delete" a="users">
                        <Button 
                            size="icon" variant="outline"
                            className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-none hover:scale-105"
                            onClick={() => handleDelete(row.id)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </Can>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-1 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2 mb-2 px-4 sm:px-1 uppercase">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                        <Users2 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-slate-900 leading-none">User Master</h1>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={fetchAllData} className="h-9 px-3 border-slate-200 text-slate-500 hover:text-slate-800 font-medium text-xs rounded-lg shadow-sm">
                        <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Can I="create" a="users">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    onClick={() => handleOpenDialog()}
                                    className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95 w-full sm:w-auto"
                                    style={{ background: 'var(--primary)' }}
                                >
                                    <UserPlus className="h-4 w-4" /> Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[750px] p-0 overflow-hidden border border-slate-200 rounded-xl shadow-xl bg-white font-sans">
                                <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                                            <Key className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-sm font-bold text-slate-800 leading-none">{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
                                            <DialogDescription className="text-xs text-slate-400 font-medium mt-1">Configure system access credentials</DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Employee ID / Code</Label>
                                            <Input
                                                value={employeeId}
                                                onChange={e => setEmployeeId(e.target.value)}
                                                placeholder="e.g. DEP-001"
                                                className="h-9 border-slate-200 bg-slate-50/50 rounded-lg font-medium text-sm focus:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Full Name <span className="text-rose-500">*</span></Label>
                                            <Input
                                                value={fullName}
                                                onChange={e => setFullName(e.target.value)}
                                                placeholder="e.g. Rahul Sharma"
                                                className="h-9 border-slate-200 bg-slate-50/50 rounded-lg font-medium text-sm focus:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Email Address <span className="text-rose-500">*</span></Label>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="user@digitallerp.com"
                                                className="h-9 border-slate-200 bg-slate-50/50 rounded-lg font-medium text-sm focus:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Phone</Label>
                                            <Input
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="h-9 border-slate-200 bg-slate-50/50 rounded-lg font-medium text-sm focus:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Role <span className="text-rose-500">*</span></Label>
                                            <SearchableSelect
                                                value={roleId}
                                                onValueChange={setRoleId}
                                                options={roles.map(r => ({ value: r.id.toString(), label: r.name }))}
                                                placeholder="Select Role"
                                                className="h-9 border-slate-200 bg-slate-50 rounded-lg font-medium text-xs shadow-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Department</Label>
                                            <SearchableSelect
                                                value={department}
                                                onValueChange={setDepartment}
                                                options={[
                                                    { value: "Management", label: "Management" },
                                                    { value: "Operations", label: "Operations" },
                                                    { value: "Inventory", label: "Inventory" },
                                                    { value: "Finance", label: "Finance" },
                                                    { value: "IT", label: "IT" }
                                                ]}
                                                placeholder="Select Department"
                                                className="h-9 border-slate-200 bg-slate-50 rounded-lg font-medium text-xs shadow-none"
                                            />
                                        </div>

                                        {!selectedUser ? (
                                            <div className="space-y-1.5 sm:col-span-2">
                                                <div className="flex items-center justify-between pr-0.5">
                                                    <Label className="text-xs font-medium text-slate-600 font-black flex items-center gap-2">
                                                        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Setup Access Password
                                                    </Label>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="text-slate-400 hover:text-primary p-1"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        placeholder="Enter initial password"
                                                        className="h-9 border-indigo-100 bg-indigo-50/30 rounded-lg font-medium text-sm focus:bg-white flex-1 font-mono"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 sm:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                        <RefreshCcw className="h-3 w-3" /> Security & Status
                                                    </Label>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5 text-left">
                                                        <div className="flex items-center justify-between pr-0.5">
                                                            <Label className="text-[10px] font-bold text-slate-400 pl-0.5 uppercase">Manage Credentials</Label>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="text-slate-400 hover:text-primary p-1"
                                                                title={showPassword ? "Hide Password" : "Show Password"}
                                                            >
                                                                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-1.5 flex-row-reverse">
                                                            <Button 
                                                                variant="default" size="sm" onClick={handlePasswordReset}
                                                                className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px]"
                                                            >
                                                                Update
                                                            </Button>
                                                            <Input 
                                                                type={showPassword ? "text" : "password"} 
                                                                value={password} 
                                                                onChange={e => setPassword(e.target.value)}
                                                                placeholder={selectedUser ? "Masked" : "New password"}
                                                                className="h-9 border-slate-200 bg-white rounded-lg text-xs font-mono"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5 text-left">
                                                        <Label className="text-[10px] font-bold text-slate-400 pl-0.5 uppercase">Account Status</Label>
                                                        <div className="flex gap-1.5">
                                                            {["Active", "Inactive", "Suspended"].map(s => (
                                                                <Button
                                                                    key={s}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setStatus(s)}
                                                                    className={`flex-1 h-9 text-[9px] font-black rounded-lg border transition-all ${status === s ? 'text-white border-transparent shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
                                                                    style={status === s ? { background: 'var(--primary)' } : {}}
                                                                >
                                                                    {s}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── User-Level Permissions ── */}
                                    <div className="space-y-3 border-t border-slate-100 pt-5">
                                        <button
                                            type="button"
                                            onClick={() => setShowPermissions(!showPermissions)}
                                            className="flex items-center gap-2 w-full text-left group"
                                        >
                                            {showPermissions ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                                            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                                            <span className="text-xs font-bold text-slate-600">User-Level Permissions</span>
                                            <div className="h-px bg-slate-100 flex-1" />
                                            {useCustomPermissions && (
                                                <Badge variant="outline" className="text-[9px] font-bold bg-indigo-50 text-indigo-600 border-indigo-100">CUSTOM</Badge>
                                            )}
                                        </button>

                                        {showPermissions && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                                                    <Checkbox
                                                        checked={useCustomPermissions}
                                                        onCheckedChange={(checked) => {
                                                            setUseCustomPermissions(!!checked)
                                                            if (!checked) setPermissionMap({})
                                                        }}
                                                        className="rounded border-amber-300 data-[state=checked]:border-transparent h-4 w-4"
                                                    />
                                                    <div className="flex-1">
                                                        <span className="text-[11px] font-bold text-amber-800">Enable custom permissions for this user</span>
                                                        <p className="text-[10px] text-amber-600 mt-0.5">When enabled, these permissions override the role&apos;s permissions. When disabled, the user inherits all permissions from their assigned role.</p>
                                                    </div>
                                                </div>

                                                {useCustomPermissions && (
                                                    <div className="rounded-lg border border-slate-100 overflow-hidden">
                                                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Module</span>
                                                            <div className="flex gap-4 pr-1">
                                                                {["View", "Create", "Edit", "Delete", "Print", "Approve"].map(l => (
                                                                    <span key={l} className="w-10 text-[9px] font-bold text-center text-slate-400 uppercase">{l}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {modules.map((m) => (
                                                            <React.Fragment key={m.id}>
                                                                <div className="flex items-center justify-between px-4 py-2 bg-slate-100/50 border-y border-slate-100/80">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-6 w-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                                                                            <m.icon className="h-3.5 w-3.5" />
                                                                        </div>
                                                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{m.name}</span>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-[9px] font-bold bg-white text-slate-400 border-slate-100">
                                                                        {m.submodules.length} PAGES
                                                                    </Badge>
                                                                </div>
                                                                {m.submodules.map((sm) => {
                                                                    const p = permissionMap[sm.id] || { view: false, create: false, edit: false, delete: false, approve: false, print: false }
                                                                    return (
                                                                        <div key={sm.id} className="flex items-center justify-between p-3 pl-8 border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                                                                            <div className="flex items-center gap-2.5">
                                                                                <div className="h-7 w-7 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                                                                    <sm.icon className="h-3.5 w-3.5" />
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-xs font-bold text-slate-700 leading-none">{sm.name}</span>
                                                                                    <span className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">User Override</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-4 pr-2">
                                                                                {(['view', 'create', 'edit', 'delete', 'print', 'approve'] as const).map(type => {
                                                                                    const isValid = sm.validActions.includes(type)
                                                                                    return (
                                                                                        <div key={type} className="w-10 flex justify-center">
                                                                                            {isValid ? (
                                                                                                <Checkbox
                                                                                                    checked={p[type]}
                                                                                                    onCheckedChange={() => togglePermission(sm.id, type)}
                                                                                                    className="rounded border-slate-200 data-[state=checked]:border-transparent h-4 w-4"
                                                                                                    style={{ ['--tw-ring-color' as any]: 'var(--primary)' }}
                                                                                                />
                                                                                            ) : (
                                                                                                <div className="h-4 w-4 rounded bg-slate-100/50 border border-slate-100/50 cursor-not-allowed" />
                                                                                            )}
                                                                                        </div>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-2">
                                    <Button variant="ghost" className="h-9 px-4 font-medium text-xs text-slate-500 rounded-lg" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={handleSave}
                                        className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-lg transition-all active:scale-95"
                                        style={{ background: 'var(--primary)' }}
                                    >
                                        {selectedUser ? "Update User" : "Add User"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </Can>
                </div>
            </div>

            <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                <DataGrid
                    data={users}
                    columns={columns}
                    isLoading={isLoading}
                    hideTitle={true}
                    searchPlaceholder="Search users by name, email or department..."
                />
            </div>
        </div>
    )
}
