"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
    Plus,
    Trash2,
    Edit2,
    Phone,
    Mail,
    UserCircle,
    MoreHorizontal,
    Eye,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Import the new generic components
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { FormModal, FormField } from "@/components/shared/form-modal"

// ─── Types ───────────────────────────────────────────────────────────────────
type Customer = {
    id: string
    name: string
    contactPerson: string
    email: string
    phone: string
    gstin: string
    balance: number
    status: "Active" | "Inactive"
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialCustomers: Customer[] = []

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers)

    const handleAddCustomer = (data: any) => {
        const newCustomer: Customer = {
            id: `CUST-${Math.floor(Math.random() * 1000) + 200}`,
            name: data.name,
            contactPerson: data.contact,
            email: data.email,
            phone: data.phone,
            gstin: data.gstin,
            balance: parseFloat(data.balance) || 0,
            status: "Active"
        }
        setCustomers(prev => [newCustomer, ...prev])
        toast.success("Customer Profile Created", { description: `${data.name} has been added to your database.` })
    }

    // Modal Fields Configuration
    const customerFields: FormField[] = [
        { name: "name", label: "Company Name", type: "text", required: true, gridCols: 2 },
        { name: "contact", label: "Contact Person", type: "text", required: true },
        { name: "phone", label: "Phone Number", type: "text", required: true },
        { name: "email", label: "Email Address", type: "email" },
        { name: "gstin", label: "GST Number", type: "text", placeholder: "22AAAAA0000A1Z5" },
        { name: "balance", label: "Opening Balance", type: "number", defaultValue: "" },
        { name: "address", label: "Billing Address", type: "textarea", gridCols: 2 },
    ]

    const columns: ColumnDef<Customer>[] = [
        {
            key: "id",
            label: "Cust ID",
        },
        {
            key: "name",
            label: "Name / Client",
            render: (val, cust) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-[10px] shrink-0 capitalize">
                        {String(val).substring(0, 2)}
                    </div>
                    <p className="font-bold text-sm text-slate-800 leading-tight uppercase italic">{val}</p>
                </div>
            )
        },
        {
            key: "contactPerson",
            label: "Key Contact",
        },
        {
            key: "email",
            label: "Contact Info",
            render: (_, cust) => (
                <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {cust.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {cust.phone}</span>
                </div>
            )
        },
        {
            key: "gstin",
            label: "GSTIN",
        },
        {
            key: "balance",
            label: "Outstanding",
            render: (val) => (
                <p className={`font-black text-sm ${val > 0 ? "text-rose-600" : val < 0 ? "text-emerald-600" : "text-slate-400"}`}>
                    ₹{Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold px-2.5 h-5 ${val === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                >
                    {val as string}
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Actions",
            filterable: false,
            headerClassName: "text-right w-[80px]",
            className: "text-right",
            render: (_, cust) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-sm border-slate-200 bg-white text-slate-400 hover:text-blue-600 transition-all shadow-none" title="View History">
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-sm border-slate-200 bg-white text-slate-400 hover:text-emerald-600 transition-all shadow-none" title="Edit Details">
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-sm border-slate-200 bg-white text-slate-400 hover:text-rose-600 transition-all shadow-none" title="Archive Profile">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-4 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
            {/* Header */}
            <div className="flex flex-row items-center justify-between px-4 sm:px-1 gap-2 font-heading uppercase mb-2">
                <div className="space-y-0.5 text-left">
                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">User Management</h1>
                </div>

                <FormModal
                    title="Add New Customer"
                    description="Create master profile for billing and jobs"
                    icon={UserCircle}
                    fields={customerFields}
                    onSave={handleAddCustomer}
                    submitLabel="Register Customer"
                    variant="primary"
                    trigger={
                        <Button className="gap-2 font-black h-11 shadow-xl px-6 transition-all active:scale-95 text-white w-full sm:w-auto text-[10px] uppercase tracking-widest rounded-xl" style={{ background: 'var(--primary)' }}>
                            <Plus className="h-4 w-4" /> <span className="sm:inline">Register Client</span>
                        </Button>
                    }
                />
            </div>

            <Card className="shadow-2xl shadow-slate-200/50 border-none bg-background rounded-2xl overflow-hidden border border-slate-100">
                <CardContent className="p-4 sm:p-6">
                    <DataGrid
                        data={customers}
                        columns={columns}
                        title="Customers"
                        searchPlaceholder="Search anything (name, phone, GST)..."
                        enableSelection={true}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
