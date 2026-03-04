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
const initialCustomers: Customer[] = [
    { id: "CUST-101", name: "Crona Group", contactPerson: "Cristina Hermiston", email: "cristina@crona.com", phone: "1-585-837-5878", gstin: "GSTINMDTVA89SVE", balance: 12540.50, status: "Active" },
    { id: "CUST-102", name: "Farrell, Klocko and Oberbrunner", contactPerson: "Julian Klocko", email: "julian@fko.com", phone: "234-567-8901", gstin: "GSTINALFK99SVE", balance: 0.00, status: "Active" },
    { id: "CUST-103", name: "Schuster Ltd", contactPerson: "Marco Schuster", email: "marco@schuster.ltd", phone: "555-012-3456", gstin: "GSTINSHS92KOS", balance: 45000.00, status: "Inactive" },
    { id: "CUST-104", name: "Denesik-Keeling", contactPerson: "Sarah Denesik", email: "sarah@dkp.com", phone: "987-654-3210", gstin: "GSTINDKP44FDS", balance: 8900.25, status: "Active" },
    { id: "CUST-105", name: "Hegmann LLC", contactPerson: "Paul Hegmann", email: "paul@hegmann.io", phone: "444-555-6666", gstin: "GSTINHGM88VVZ", balance: -250.00, status: "Active" },
    { id: "CUST-106", name: "Bruen & Sons", contactPerson: "Lucas Bruen", email: "lucas@bruen.com", phone: "321-654-9870", gstin: "GSTINBRS77ABC", balance: 5600.00, status: "Active" },
]

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
        { name: "balance", label: "Opening Balance", type: "number", defaultValue: 0 },
        { name: "address", label: "Billing Address", type: "textarea", gridCols: 2 },
    ]

    const columns: ColumnDef<Customer>[] = [
        {
            key: "id",
            label: "Cust ID",
            className: "font-bold text-xs font-mono",
            headerClassName: "w-[120px]",
        },
        {
            key: "name",
            label: "Customer Name",
            render: (val, cust) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 capitalize">
                        {String(val).substring(0, 2)}
                    </div>
                    <p className="font-bold text-sm text-slate-800 leading-tight">{val}</p>
                </div>
            )
        },
        {
            key: "contactPerson",
            label: "Contact Person",
            className: "text-sm font-medium",
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
            className: "font-mono text-xs text-muted-foreground uppercase",
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
            headerClassName: "w-[100px]",
            render: (val) => (
                <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold px-2.5 h-5 ${val === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                >
                    {val}
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
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-blue-200 bg-white text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-none" title="View History">
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-emerald-200 bg-white text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-none" title="Edit Details">
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Archive Profile">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5 text-left">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customer Database</h1>
                    <p className="text-sm text-slate-400 font-medium tracking-normal">Manage your client registry and billing profiles</p>
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
                        <Button className="gap-2 font-bold h-10 shadow-lg px-6 transition-all active:scale-95 text-white" style={{ background: 'var(--primary)' }}>
                            <Plus className="h-4 w-4" /> New Customer
                        </Button>
                    }
                />
            </div>

            <Card className="shadow-2xl shadow-slate-200/50 border-none bg-background rounded-2xl overflow-hidden border border-slate-100">
                <CardContent className="p-6">
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
