"use client"

import React, { useState } from "react"
import {
    Plus, UserCog, Trash2, Edit,
    ShieldCheck, Lock, CheckCircle2,
    Check, X, Activity, Users, Info,
    FileText, Box, Wallet, Users2,
    BarChart3, Settings
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { cn } from "@/lib/utils"
import { usePermissions, Can } from "@/components/shared/permission-context"

// ─── Types ──────────────────────────────────────────────────────────────────
type Role = {
    id: string
    name: string
    assignedUser: string
    permissions: string[]
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialRoles: Role[] = [
    { id: "R-1", name: "Super Admin", assignedUser: "Rajesh Kumar", permissions: ["all"] },
    { id: "R-2", name: "Sales Head", assignedUser: "Sunil Verma", permissions: ["sales", "dashboard"] },
    { id: "R-3", name: "Inventory Head", assignedUser: "Anjali Singh", permissions: ["inventory", "production"] },
]

const modules = [
    { name: "Dashboard & Metrics", id: "dashboard", icon: Activity },
    { name: "Sales & Invoices", id: "sales", icon: FileText },
    { name: "Inventory & Stocks", id: "inventory", icon: Box },
    { name: "Production & Jobs", id: "production", icon: Activity },
    { name: "Finance & Accounts", id: "finance", icon: Wallet },
    { name: "Outsource & Vendors", id: "outsource", icon: Users2 },
    { name: "Reports & Analytics", id: "reports", icon: BarChart3 },
    { name: "User Management", id: "users", icon: UserCog },
    { name: "System Settings", id: "settings", icon: Settings },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RolesPage() {
    const [roles] = useState<Role[]>(initialRoles)
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
    const [selectedModulePermissions, setSelectedModulePermissions] = useState<Record<string, { view: boolean, create: boolean, edit: boolean, delete: boolean, approve: boolean }>>({
        dashboard: { view: true, create: false, edit: false, delete: false, approve: false },
        sales: { view: true, create: true, edit: true, delete: false, approve: false },
    })

    const togglePermission = (moduleId: string, type: 'view' | 'create' | 'edit' | 'delete' | 'approve') => {
        setSelectedModulePermissions(prev => ({
            ...prev,
            [moduleId]: {
                ...prev[moduleId] || { view: false, create: false, edit: false, delete: false, approve: false },
                [type]: !prev[moduleId]?.[type]
            }
        }))
    }

    const columns: ColumnDef<Role>[] = [
        {
            key: "name",
            label: "Role Identity",
            render: (val, row) => (
                <div className="py-1">
                    <p className="font-bold text-slate-800">{val as string}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.id}</p>
                </div>
            )
        },
        {
            key: "permissions",
            label: "Access Level",
            render: (val: string[]) => (
                <div className="flex flex-wrap gap-1">
                    {val.includes("all") ? (
                        <Badge variant="outline" className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 border-indigo-100">Full Access</Badge>
                    ) : (
                        val.slice(0, 3).map(p => (
                            <Badge key={p} variant="outline" className="text-[9px] font-black uppercase bg-slate-50 text-slate-600 border-slate-100">{p}</Badge>
                        ))
                    )}
                    {val.length > 3 && !val.includes("all") && <span className="text-[10px] text-slate-400 font-bold">+{val.length - 3}</span>}
                </div>
            )
        },
        {
            key: "assignedUser",
            label: "Identity",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center border transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 90%)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }}>
                        <Users className="h-3 w-3" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="font-bold text-xs text-slate-700">{val as string}</span>
                </div>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: () => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Can I="edit" a="users">
                        <Button size="icon" variant="outline" className="h-7 w-7 rounded-md bg-white transition-all shadow-none" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }}>
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                    </Can>
                    <Can I="delete" a="users">
                        <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none">
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </Can>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans italic">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">Authorization Control</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure system-wide access levels</p>
                </div>
                <Can I="create" a="users">
                    <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                                <Plus className="h-4 w-4" /> <span className="sm:inline">Define Authority</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[92vh] flex flex-col font-sans uppercase">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white italic">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">Access Level Protocol</DialogTitle>
                                        <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Configure access levels and permissions</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="px-6 py-6 space-y-6">
                                    {/* Section 1: Role Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Info className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role Identity</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Role Title <span className="text-rose-500">*</span></Label>
                                                <Input
                                                    placeholder="e.g. HR Manager"
                                                    className="h-9 border-slate-200 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all rounded-md"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Assign to Member</Label>
                                                <SearchableSelect
                                                    placeholder="Link with User"
                                                    searchPlaceholder="Search members..."
                                                    options={[
                                                        { value: "rajesh", label: "Rajesh Kumar" },
                                                        { value: "sunil", label: "Sunil Verma" },
                                                        { value: "anjali", label: "Anjali Singh" },
                                                        { value: "vikas", label: "Vikas Shah" }
                                                    ]}
                                                    onValueChange={() => {}}
                                                    className="h-9 border-slate-200 bg-slate-50/50 font-bold text-xs focus:bg-white transition-all rounded-md shadow-none"
                                                />
                                            </div>
                                         </div>
                                    </div>

                                    {/* Section 2: Module Permissions */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Module Access Scope</span>
                                            </div>
                                            <div className="flex gap-2 sm:gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider pr-2 sm:pr-4 font-sans overflow-x-auto no-scrollbar">
                                                <span className="w-6 text-center text-[7px]">View</span>
                                                <span className="w-6 text-center text-[7px]">Cre</span>
                                                <span className="w-6 text-center text-[7px]">Edit</span>
                                                <span className="w-6 text-center text-[7px]">Del</span>
                                                <span className="w-6 text-center text-[7px]">Auth</span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-md border border-slate-100">
                                            {modules.map((m) => (
                                                <div key={m.id} className={cn(
                                                    "flex items-center justify-between p-2 rounded-md transition-all mb-1",
                                                    m.id === 'hr' ? "bg-indigo-50/50 border border-indigo-100/50" : "bg-white border border-slate-100"
                                                )}>
                                                    <div className="flex items-center gap-2.5 min-w-[120px]">
                                                        <div className={cn(
                                                            "h-6 w-6 rounded flex items-center justify-center shrink-0",
                                                            m.id === 'hr' ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400"
                                                        )}>
                                                            <m.icon className="h-3 w-3" />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tight truncate">{m.name}</p>
                                                    </div>
                                                    <div className="flex gap-2 sm:gap-4 pr-1">
                                                        <div className="w-6 flex justify-center">
                                                            <Checkbox 
                                                                checked={selectedModulePermissions[m.id]?.view} 
                                                                onCheckedChange={() => togglePermission(m.id, 'view')}
                                                                className="rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3 w-3" 
                                                            />
                                                        </div>
                                                        <div className="w-6 flex justify-center">
                                                            <Checkbox 
                                                                checked={selectedModulePermissions[m.id]?.create} 
                                                                onCheckedChange={() => togglePermission(m.id, 'create')}
                                                                className="rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3 w-3" 
                                                            />
                                                        </div>
                                                        <div className="w-6 flex justify-center">
                                                            <Checkbox 
                                                                checked={selectedModulePermissions[m.id]?.edit} 
                                                                onCheckedChange={() => togglePermission(m.id, 'edit')}
                                                                className="rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3 w-3" 
                                                            />
                                                        </div>
                                                        <div className="w-6 flex justify-center">
                                                            <Checkbox 
                                                                checked={selectedModulePermissions[m.id]?.delete} 
                                                                onCheckedChange={() => togglePermission(m.id, 'delete')}
                                                                className="rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3 w-3" 
                                                            />
                                                        </div>
                                                        <div className="w-6 flex justify-center">
                                                            <Checkbox 
                                                                checked={selectedModulePermissions[m.id]?.approve} 
                                                                onCheckedChange={() => togglePermission(m.id, 'approve')}
                                                                className="rounded-sm border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3 w-3" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                                <Button
                                    variant="ghost"
                                    className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800"
                                    onClick={() => setIsAddRoleOpen(false)}
                                >
                                    Discard Entry
                                </Button>
                                <Button
                                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95 flex items-center gap-2"
                                    style={{ background: 'var(--primary)' }}
                                    onClick={() => setIsAddRoleOpen(false)}
                                >
                                    <CheckCircle2 className="h-4 w-4" /> Create Role
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </Can>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1">
                <DataGrid
                    data={roles}
                    columns={columns}
                    searchPlaceholder="Search roles or access scope..."
                />
            </div>
        </div>
    )
}
