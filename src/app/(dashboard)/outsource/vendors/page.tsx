"use client"

import React, { useState } from "react"
import {
    Plus, Edit, ExternalLink as ExtLink,
    Users2, Phone, Mail, MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

type Vendor = {
    id: string
    name: string
    contact: string
    email: string
    specialization: string
    balance: number
}

const initialVendors: Vendor[] = [
    { id: "V-101", name: "City Plates & CTP", contact: "9876543210", email: "info@cityplates.in", specialization: "CTP Plates", balance: 12500 },
    { id: "V-102", name: "Galaxy Flex Printing", contact: "8888877777", email: "orders@galaxyflex.com", specialization: "Large Format", balance: 4500 },
    { id: "V-103", name: "Modern Binding Works", contact: "7776665555", email: "modern.binding@gmail.com", specialization: "Finishing", balance: 0 },
]

export default function VendorsPage() {
    const [vendorsList] = useState<Vendor[]>(initialVendors)
    const [isAddVendorOpen, setIsAddVendorOpen] = useState(false)

    const vendorColumns: ColumnDef<Vendor>[] = [
        {
            key: "name",
            label: "Vendor Name",
            render: (val, item) => (
                <div>
                    <p className="font-bold text-sm text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{item.specialization}</p>
                </div>
            )
        },
        {
            key: "contact",
            label: "Contact",
            render: (val, item) => (
                <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-300" />{val}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-300" />{item.email}
                    </p>
                </div>
            )
        },
        {
            key: "balance",
            label: "Outstanding Balance",
            render: (val) => (
                <span className={`font-bold text-sm ${val > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    ₹{val.toLocaleString()}
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            className: "hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: () => (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px] uppercase tracking-wider">
                    Active
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: () => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-indigo-200 bg-white text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-none" title="Edit Vendor Profile">
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-500 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-none" title="View Vendor Portal">
                        <ExtLink className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6 font-sans bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans italic uppercase">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Vendor Directory</h1>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                                <Plus className="h-4 w-4" /> <span className="sm:inline">Onboard Vendor</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[500px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white flex flex-col max-h-[92vh] font-sans uppercase">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white italic">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        <Users2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">Vendor Profile</DialogTitle>
                                        <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Onboard a new outsourcing partner</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="px-6 py-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white" style={{ background: 'var(--primary)' }}>01</span>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Identification</h3>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Vendor Name <span className="text-rose-500">*</span></Label>
                                        <Input className="h-9 rounded-md border-slate-200 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all uppercase" placeholder="e.g. Galaxy Flex Printing" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Contact Number <span className="text-rose-500">*</span></Label>
                                        <Input className="h-9 rounded-md border-slate-200 bg-white font-medium text-sm" placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Email</Label>
                                        <Input type="email" className="h-9 rounded-md border-slate-200 bg-white font-medium text-sm" placeholder="vendor@company.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Type <span className="text-rose-500">*</span></Label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'offset', label: 'Offset Printer' },
                                                { value: 'digital', label: 'Digital Press' },
                                                { value: 'flex', label: 'Flex / Banner' },
                                                { value: 'finishing', label: 'Finishing Unit' }
                                            ]}
                                            value="offset"
                                            onValueChange={(val) => console.log(val)}
                                            placeholder="Select Type"
                                            className="h-9 border-slate-200 text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-end gap-2">
                                <Button variant="ghost" className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800" onClick={() => setIsAddVendorOpen(false)}>
                                    Cancel
                                </Button>
                                <Button className="h-9 px-6 md:px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95" style={{ background: 'var(--primary)' }} onClick={() => setIsAddVendorOpen(false)}>
                                    Save Profile
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <DataGrid
                    data={vendorsList}
                    columns={vendorColumns}
                    searchPlaceholder="Search vendors by name or contact..."
                    hideTitle={true}
                    toolbarClassName="border-b px-4 py-1.5 bg-white"
                />
            </div>
        </div>
    )
}
