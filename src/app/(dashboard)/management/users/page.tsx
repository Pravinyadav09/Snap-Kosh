"use client"

import React, { useState } from "react"
import {
    UserPlus, Trash2, Edit2,
    Mail, Key
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

// ─── Types ──────────────────────────────────────────────────────────────────
type UserType = {
    id: string
    name: string
    email: string
    role: string
    lastActive: string
    status: "Active" | "Inactive" | "Suspended"
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const staffMembers: UserType[] = [
    { id: "U-001", name: "Rajesh Kumar", email: "rajesh@digitalerp.com", role: "Administrator", status: "Active", lastActive: "Now" },
    { id: "U-002", name: "Sunil Verma", email: "sunil@digitalerp.com", role: "Operator", status: "Active", lastActive: "15m ago" },
    { id: "U-003", name: "Anjali Singh", email: "anjali@digitalerp.com", role: "Designer", status: "Active", lastActive: "2h ago" },
    { id: "U-004", name: "Vikas Shah", email: "vikas@digitalerp.com", role: "Operator", status: "Inactive", lastActive: "4d ago" },
    { id: "U-005", name: "Meera Iyer", email: "meera@digitalerp.com", role: "Accountant", status: "Active", lastActive: "1h ago" },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManagementUsersPage() {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)

    const columns: ColumnDef<UserType>[] = [
        {
            key: "name",
            label: "Member Identity",
            render: (val, row) => (
                <div className="flex items-center gap-3 py-1">
                    <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarFallback className="font-black text-xs" style={{ background: 'color-mix(in srgb, var(--primary), white 90%)', color: 'var(--primary)' }}>
                            {val.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 leading-none mb-1">{val}</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.id}</span>
                    </div>
                </div>
            )
        },
        {
            key: "email",
            label: "Communication",
            render: (val) => (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium italic">
                    <Mail className="h-3 w-3 text-slate-400" /> {val}
                </div>
            )
        },
        {
            key: "role",
            label: "Privileges",
            render: (val) => (
                <Badge variant="outline" className="font-black uppercase text-[10px] tracking-widest px-3 transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 95%)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)', color: 'var(--primary)' }}>
                    {val}
                </Badge>
            )
        },

        {
            key: "status",
            label: "Status",
            render: (val) => {
                const colors = {
                    Active: "bg-emerald-50 text-emerald-600",
                    Inactive: "bg-slate-50 text-slate-500",
                    Suspended: "bg-rose-50 text-rose-600"
                }
                return (
                    <Badge className={`${colors[val as keyof typeof colors]} border-none text-[10px] font-black uppercase tracking-widest px-2`}>
                        {val}
                    </Badge>
                )
            }
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: () => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md bg-white transition-all shadow-none" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }} title="Edit Primary Profile">
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-amber-200 bg-white text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors shadow-none" title="Reset Security Credentials">
                        <Key className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Remove Access Rights">
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
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 font-heading">Team Access</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-8 rounded-xl font-bold gap-2 shadow-lg transition-all text-white" style={{ background: 'var(--primary)' }}>
                                <UserPlus className="h-4 w-4" /> Create Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl flex flex-col max-h-[92vh]">
                            <DialogHeader className="px-10 pt-10 pb-6 text-left border-b">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 rounded-2xl shadow-sm border border-slate-100 transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 95%)', color: 'var(--primary)' }}>
                                        <UserPlus className="h-5 w-5" />
                                    </div>
                                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">Account Provisioning</DialogTitle>
                                </div>
                                <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-1">
                                    Set up identity and access credentials
                                </DialogDescription>
                            </DialogHeader>

                            <div className="px-10 py-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                {/* 01: Profile Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white" style={{ background: 'var(--primary)' }}>01</span>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Identity Details</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Full Name</Label>
                                            <Input
                                                placeholder="e.g. John Doe"
                                                className="h-12 rounded-xl border-slate-200 bg-slate-50 transition-all font-bold text-slate-700 px-4 focus-visible:ring-indigo-500/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Primary Email</Label>
                                            <Input
                                                placeholder="user@erp.com"
                                                className="h-12 rounded-xl border-slate-200 bg-slate-50 transition-all font-bold text-slate-700 px-4 focus-visible:ring-indigo-500/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 02: Access Configuration */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white" style={{ background: 'var(--primary)' }}>02</span>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Control</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Assign Role</Label>
                                            <Select>
                                                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-white font-medium text-slate-600 px-4">
                                                    <SelectValue placeholder="Select Privilege" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="admin">Administrator</SelectItem>
                                                    <SelectItem value="sales">Sales Head</SelectItem>
                                                    <SelectItem value="accounts">Accountant</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Department</Label>
                                            <Select>
                                                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-white font-medium text-slate-600 px-4">
                                                    <SelectValue placeholder="Work Unit" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="management">Management</SelectItem>
                                                    <SelectItem value="operations">Operations</SelectItem>
                                                    <SelectItem value="finance">Finance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="p-8 mt-2 flex flex-row items-center justify-end gap-3 px-10 border-t bg-slate-50/50">
                                <Button
                                    variant="ghost"
                                    className="h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                    onClick={() => setIsAddUserOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="h-11 px-8 rounded-xl font-bold text-[10px] font-black uppercase tracking-widest shadow-lg transition-all text-white"
                                    style={{ background: 'var(--primary)' }}
                                    onClick={() => setIsAddUserOpen(false)}
                                >
                                    Provision Account
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <DataGrid
                data={staffMembers}
                columns={columns}
                searchPlaceholder="Search members, roles or emails..."
            />
        </div>
    )
}


