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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { SearchableSelect } from "@/components/shared/searchable-select"

// ─── Types ──────────────────────────────────────────────────────────────────
type UserType = {
    id: string
    name: string
    email: string
    role: string
    department: string
    lastActive: string
    status: "Active" | "Inactive" | "Suspended"
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const staffMembers: UserType[] = [
    { id: "U-001", name: "Rajesh Kumar", email: "rajesh@digitalerp.com", role: "Administrator", department: "Management", status: "Active", lastActive: "Now" },
    { id: "U-002", name: "Sunil Verma", email: "sunil@digitalerp.com", role: "Operator", department: "Operations", status: "Active", lastActive: "15m ago" },
    { id: "U-003", name: "Anjali Singh", email: "anjali@digitalerp.com", role: "Designer", department: "Operations", status: "Active", lastActive: "2h ago" },
    { id: "U-004", name: "Vikas Shah", email: "vikas@digitalerp.com", role: "Operator", department: "Operations", status: "Inactive", lastActive: "4d ago" },
    { id: "U-005", name: "Meera Iyer", email: "meera@digitalerp.com", role: "Accountant", department: "Finance", status: "Active", lastActive: "1h ago" },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManagementUsersPage() {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [isEditUserOpen, setIsEditUserOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

    const handleEditClick = (user: UserType) => {
        setSelectedUser(user)
        setIsEditUserOpen(true)
    }

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
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
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
                    {val as string}
                </Badge>
            )
        },
        {
            key: "department",
            label: "Unit",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{val as string}</span>
                </div>
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
            render: (_: any, row: UserType) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-7 w-7 rounded-md bg-white transition-all shadow-none" 
                        style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }} 
                        title="Edit Primary Profile"
                        onClick={() => handleEditClick(row)}
                    >
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
        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans italic">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">Personnel Registry</h1>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                                <UserPlus className="h-4 w-4" /> <span className="sm:inline">Provision Access</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[92vh] flex flex-col font-sans uppercase">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white italic">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        <UserPlus className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">Security Provisioning</DialogTitle>
                                        <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Set up identity and access credentials</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="px-6 py-6 space-y-6">
                                    {/* 01: Profile Information */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Identity Details</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Full Name <span className="text-rose-500">*</span></Label>
                                                <Input
                                                    placeholder="e.g. John Doe"
                                                    className="h-9 border-slate-200 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all rounded-md"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Primary Email <span className="text-rose-500">*</span></Label>
                                                <Input
                                                    placeholder="user@erp.com"
                                                    className="h-9 border-slate-200 bg-slate-50/50 font-medium text-sm focus:bg-white transition-all rounded-md"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 02: Access Configuration */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Key className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Control</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-md border border-slate-100">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Assign Role</Label>
                                                <SearchableSelect
                                                    placeholder="Select Privilege"
                                                    searchPlaceholder="Search roles..."
                                                    options={[
                                                        { value: "administrator", label: "Administrator" },
                                                        { value: "operator", label: "Operator" },
                                                        { value: "designer", label: "Designer" },
                                                        { value: "accountant", label: "Accountant" },
                                                        { value: "sales_head", label: "Sales Head" }
                                                    ]}
                                                    onValueChange={() => {}}
                                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Department</Label>
                                                <SearchableSelect
                                                    placeholder="Work Unit"
                                                    searchPlaceholder="Search departments..."
                                                    options={[
                                                        { value: "management", label: "Management" },
                                                        { value: "operations", label: "Operations" },
                                                        { value: "finance", label: "Finance" },
                                                        { value: "hr", label: "HR" },
                                                        { value: "it", label: "IT / Tech" }
                                                    ]}
                                                    onValueChange={() => {}}
                                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                                <Button
                                    variant="ghost"
                                    className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800"
                                    onClick={() => setIsAddUserOpen(false)}
                                >
                                    Discard Entry
                                </Button>
                                <Button
                                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                                    style={{ background: 'var(--primary)' }}
                                    onClick={() => setIsAddUserOpen(false)}
                                >
                                    Provision Account
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Member Dialog */}
                    <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[92vh] flex flex-col font-sans uppercase">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white italic">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        <Edit2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">Profile Modification</DialogTitle>
                                        <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Modify existing member identity and access</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="px-6 py-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Identity Details</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Full Name</Label>
                                                <Input
                                                    defaultValue={selectedUser?.name}
                                                    placeholder="e.g. John Doe"
                                                    className="h-9 border-slate-200 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all rounded-md"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Primary Email</Label>
                                                <Input
                                                    defaultValue={selectedUser?.email}
                                                    placeholder="user@erp.com"
                                                    className="h-9 border-slate-200 bg-slate-50/50 font-medium text-sm focus:bg-white transition-all rounded-md"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Key className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Control</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-md border border-slate-100">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Assign Role</Label>
                                                <SearchableSelect
                                                    value={selectedUser?.role.toLowerCase()}
                                                    placeholder="Select Privilege"
                                                    searchPlaceholder="Search roles..."
                                                    options={[
                                                        { value: "administrator", label: "Administrator" },
                                                        { value: "operator", label: "Operator" },
                                                        { value: "designer", label: "Designer" },
                                                        { value: "accountant", label: "Accountant" },
                                                        { value: "sales_head", label: "Sales Head" }
                                                    ]}
                                                    onValueChange={() => {}}
                                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Department</Label>
                                                <SearchableSelect
                                                    value={selectedUser?.department.toLowerCase()}
                                                    placeholder="Work Unit"
                                                    searchPlaceholder="Search departments..."
                                                    options={[
                                                        { value: "management", label: "Management" },
                                                        { value: "operations", label: "Operations" },
                                                        { value: "finance", label: "Finance" },
                                                        { value: "hr", label: "HR" },
                                                        { value: "it", label: "IT / Tech" }
                                                    ]}
                                                    onValueChange={() => {}}
                                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                                <Button
                                    variant="ghost"
                                    className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800"
                                    onClick={() => setIsEditUserOpen(false)}
                                >
                                    Cancel Changes
                                </Button>
                                <Button
                                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                                    style={{ background: 'var(--primary)' }}
                                    onClick={() => setIsEditUserOpen(false)}
                                >
                                    Update Member
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


