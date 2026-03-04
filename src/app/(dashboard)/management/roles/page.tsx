"use client"

import React, { useState } from "react"
import {
    Plus, UserCog, Trash2, Edit,
    ShieldCheck, Lock, CheckCircle2,
    Check, X, Activity, Users, Info
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

// ─── Types ──────────────────────────────────────────────────────────────────
type Role = {
    id: string
    name: string
    description: string
    usersCount: number
    permissions: string[]
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialRoles: Role[] = [
    { id: "R-1", name: "Administrator", description: "Full system access with all management rights", usersCount: 2, permissions: ["all"] },
    { id: "R-2", name: "Accountant", description: "Read-write access to finance, invoices and reports", usersCount: 1, permissions: ["finance", "invoices", "reports"] },
    { id: "R-3", name: "Sales Head", description: "Manage quotations, customers and sales reports", usersCount: 3, permissions: ["sales", "customers", "quotations"] },
    { id: "R-4", name: "Inventory Manager", description: "Manage stocks, inwards and warehouse records", usersCount: 2, permissions: ["inventory", "purchases"] },
]

const permissionList = [
    "Sales & Quotations", "Inventory & Stocks", "Production Jobs", "Finance & Expenses",
    "Reports & Analytics", "Vendor Management", "System Settings", "User Management"
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RolesPage() {
    const [roles] = useState<Role[]>(initialRoles)
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)

    const columns: ColumnDef<Role>[] = [
        {
            key: "name",
            label: "Role Identity",
            render: (val, row) => (
                <div className="py-1">
                    <p className="font-bold text-slate-800">{val}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.id}</p>
                </div>
            )
        },
        {
            key: "description",
            label: "Access Scope",
            render: (val) => (
                <p className="text-xs text-slate-400 font-medium max-w-[250px] line-clamp-2 italic">
                    {val}
                </p>
            )
        },
        {
            key: "usersCount",
            label: "Subscribers",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center border transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 90%)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }}>
                        <Users className="h-3 w-3" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="font-black text-xs text-slate-700">{val} Users</span>
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
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md bg-white transition-all shadow-none" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }} title="Edit Role">
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Delete Role">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 font-heading">Access Control</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Define permissions and organizational roles</p>
                </div>
                <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-8 rounded-xl font-bold gap-2 shadow-lg transition-all text-white" style={{ background: 'var(--primary)' }}>
                            <Plus className="h-4 w-4" /> Define New Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl flex flex-col max-h-[92vh]">
                        <DialogHeader className="px-10 pt-10 pb-6 text-left">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 rounded-2xl shadow-sm border border-slate-100 transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 95%)', color: 'var(--primary)' }}>
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">Define New Role</DialogTitle>
                            </div>
                            <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-1">
                                Configure access levels and permissions
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-10 pb-4 space-y-6 flex-1 overflow-y-auto">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Role Title</Label>
                                <Input
                                    placeholder="e.g. Regional Manager"
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50 transition-all font-bold text-slate-700 px-4 focus-visible:ring-indigo-500/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Role Description</Label>
                                <Textarea
                                    placeholder="Describe the responsibilities of this role..."
                                    className="min-h-[100px] rounded-xl border-slate-100 bg-white text-xs font-medium text-slate-600 px-4 pt-4 resize-none focus-visible:ring-indigo-500/20"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full w-fit transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 90%)', color: 'var(--primary)' }}>
                                    Default Access Scope
                                </Label>
                                <div className="grid grid-cols-2 gap-3 pb-4">
                                    {permissionList.slice(0, 4).map((p, i) => (
                                        <div key={i} className="flex items-center gap-2 border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <Checkbox id={`p-${i}`} checked={i === 0} className="rounded-lg border-slate-300" />
                                            <label htmlFor={`p-${i}`} className="text-[10px] font-black uppercase text-slate-500 tracking-wider cursor-pointer group-hover:text-slate-800 transition-colors">{p}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-8 mt-2 flex flex-row items-center justify-end gap-3 px-10 border-t bg-slate-50/50">
                            <Button
                                variant="ghost"
                                className="h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                onClick={() => setIsAddRoleOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="h-11 px-8 rounded-xl font-bold text-[10px] font-black uppercase tracking-widest shadow-lg transition-all text-white"
                                style={{ background: 'var(--primary)' }}
                                onClick={() => setIsAddRoleOpen(false)}
                            >
                                Create Role
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <DataGrid
                data={roles}
                columns={columns}
                searchPlaceholder="Search roles or access scope..."
            />
        </div>
    )
}
