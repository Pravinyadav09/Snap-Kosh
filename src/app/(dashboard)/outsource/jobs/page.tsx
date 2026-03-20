"use client"

import React, { useState } from "react"
import {
    Plus, ArrowLeft, Box, Maximize,
    History, Layers, Activity, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

type OutsourceOrder = {
    id: string
    orderDate: string
    jobName: string
    vendor: string
    poType: "Flex" | "Offset" | "Digital"
    status: "Pending" | "In Progress" | "Completed" | "Cancelled"
    amount: number
}

const initialOrders: OutsourceOrder[] = [
    { id: "OS-001", orderDate: "24 Feb 2026", jobName: "Magazine Cover", vendor: "City Plates & CTP", poType: "Offset", status: "In Progress", amount: 1500 },
    { id: "OS-002", orderDate: "25 Feb 2026", jobName: "Event Banner", vendor: "Galaxy Flex", poType: "Flex", status: "Pending", amount: 4500 },
]

const vendors = ["City Plates & CTP", "Modern Binding Works", "Galaxy Flex Printing", "Sharp CTP Services"]

function NewOrderView({ onBack }: { onBack: () => void }) {
    const [poType, setPoType] = useState<"Flex" | "Offset" | "Digital">("Offset")

    return (
        <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-1 italic uppercase">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={onBack} className="h-10 w-10 rounded-xl border-slate-200 shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">Draft External Request</h2>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Register a new outsourced production order</p>
                    </div>
                </div>
            </div>

            <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="text-white px-6 py-3.5" style={{ background: 'var(--primary)' }}>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">Register Outsource Job</CardTitle>
                    <p className="opacity-70 text-[10px] font-medium tracking-wide">Enter exhaustive production and vendor details</p>
                </CardHeader>
                <CardContent className="p-6 space-y-8 bg-transparent">
                    {/* Section 01: Vendor & Status */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black text-white" style={{ background: 'var(--primary)' }}>01</span>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vendor & Basic Info</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Select Printer/Vendor <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={vendors.map(v => ({ value: v, label: v }))}
                                    placeholder="Please Select"
                                    onValueChange={(val) => console.log(val)}
                                    className="h-9 rounded-lg border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Job Name <span className="text-rose-500">*</span></Label>
                                <Input placeholder="Enter Job Name" className="h-9 rounded-lg border-slate-100" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Order Status</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'pending', label: 'Pending' },
                                        { value: 'processing', label: 'Processing' },
                                        { value: 'completed', label: 'Completed' }
                                    ]}
                                    value="pending"
                                    onValueChange={(val) => console.log(val)}
                                    placeholder="Status"
                                    className="h-9 rounded-lg border-slate-100 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Job Date <span className="text-rose-500">*</span></Label>
                                <Input type="datetime-local" className="h-9 rounded-lg border-slate-100 text-xs" defaultValue="2026-02-11T04:54" />
                            </div>
                        </div>
                    </div>

                    {/* Section 02: Specs & PO Type */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black text-white" style={{ background: 'var(--primary)' }}>02</span>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Job Specifications</h3>
                        </div>
                        <div className="flex flex-col items-center gap-2 py-4 bg-slate-50/30 rounded-xl border border-slate-100/50 mb-4">
                            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">PO Type Selection</Label>
                            <RadioGroup value={poType} onValueChange={(v: "Flex" | "Offset" | "Digital") => setPoType(v)} className="flex flex-wrap justify-center gap-4">
                                {["Flex", "Offset", "Digital"].map((type) => (
                                    <div key={type} className="flex items-center space-x-2.5 bg-white px-4 py-2 rounded-lg border shadow-sm transition-all" style={{ borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }}>
                                        <RadioGroupItem value={type} id={type.toLowerCase()} style={{ color: 'var(--primary)' } as React.CSSProperties} />
                                        <Label htmlFor={type.toLowerCase()} className="font-bold cursor-pointer text-xs">{type}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Job Size</Label>
                                <div className="relative">
                                    <Maximize className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-300" />
                                    <Input className="h-9 pl-9 rounded-lg" placeholder="e.g. 10x12" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Job Quantity</Label>
                                <div className="relative">
                                    <Box className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-300" />
                                    <Input className="h-9 pl-9 rounded-lg" placeholder="Quantity" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Printing Side</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'single', label: 'Single Sided' },
                                        { value: 'double', label: 'Double Sided' }
                                    ]}
                                    placeholder="Select Side"
                                    onValueChange={(val) => console.log(val)}
                                    className="h-9 rounded-lg border-slate-100 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Select Machine</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'sm74', label: 'Heidelberg SM 74' },
                                        { value: 'km', label: 'Konica Minolta' }
                                    ]}
                                    placeholder="Select Machine"
                                    onValueChange={(val) => console.log(val)}
                                    className="h-9 rounded-lg border-slate-100 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 03: Paper Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black text-white" style={{ background: 'var(--primary)' }}>03</span>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paper Details</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Sheet Size</Label>
                                <Input className="h-9 rounded-lg" placeholder="Sheet Size" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Paper Quantity</Label>
                                <Input className="h-9 rounded-lg" placeholder="Sheet Qty" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Paper Name</Label>
                                <Input className="h-9 rounded-lg" placeholder="Paper Name" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Paper GSM</Label>
                                <Input className="h-9 rounded-lg" placeholder="GSM" />
                            </div>
                        </div>
                    </div>

                    {/* Section 04: CTP Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black text-white" style={{ background: 'var(--primary)' }}>04</span>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">CTP / Plate Details</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">CTP Type</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'ctp', label: 'CTP' },
                                        { value: 'ctcp', label: 'CTCP' }
                                    ]}
                                    value="ctp"
                                    onValueChange={(val) => console.log(val)}
                                    placeholder="Type"
                                    className="h-9 rounded-lg border-slate-100 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">CTP Vendor</Label>
                                <Input className="h-9 rounded-lg" placeholder="Plate Vendor" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Plate Size</Label>
                                <Input className="h-9 rounded-lg" placeholder="e.g. 19x25" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Sets / Forms</Label>
                                <Input className="h-9 rounded-lg" placeholder="No. of Sets" />
                            </div>
                        </div>
                    </div>

                    {/* Section 05: Extra Production Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black text-white" style={{ background: 'var(--primary)' }}>05</span>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Finishing & Extra</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Gripper Details</Label>
                                <Input className="h-9 rounded-lg text-xs" placeholder="Gripper Size/Info" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Dot / Screen</Label>
                                <Input className="h-9 rounded-lg text-xs" placeholder="Screen Details" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Printing Run</Label>
                                <Input className="h-9 rounded-lg text-xs" placeholder="Total Run" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Digital Proofing</Label>
                                <div className="h-9 flex items-center gap-4 px-1">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="proof-yes" className="h-3.5 w-3.5" /> <Label htmlFor="proof-yes" className="text-[11px] font-medium">Yes</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="proof-no" defaultChecked className="h-3.5 w-3.5" /> <Label htmlFor="proof-no" className="text-[11px] font-medium">No</Label>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Color Info</Label>
                                <Input className="h-9 rounded-lg text-xs" placeholder="e.g. 4+0" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Numbering</Label>
                                <Input className="h-9 rounded-lg text-xs" placeholder="Serial No. range" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Lamination</Label>
                                <Input className="h-9 rounded-lg text-xs" placeholder="Matte/Gloss/N/A" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Binding Type</Label>
                                <Input className="h-9 rounded-lg text-xs" placeholder="e.g. Center Pin" />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Other Instructions</Label>
                            <Textarea className="min-h-[60px] rounded-xl border-slate-100 bg-white p-3 resize-none text-xs" placeholder="Any additional notes or production sequences..." />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t mt-2">
                        <Button variant="ghost" className="h-9 px-6 text-xs font-bold text-slate-400 hover:text-slate-600 rounded-md" onClick={onBack}>Cancel</Button>
                        <Button className="h-9 px-8 text-xs font-bold rounded-md shadow-sm transition-all text-white active:scale-95" style={{ background: 'var(--primary)' }}>Save Outsource Order</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function OutsourceJobsPage() {
    const [view, setView] = useState<"list" | "new">("list")
    const [orders] = useState<OutsourceOrder[]>(initialOrders)

    const orderColumns: ColumnDef<OutsourceOrder>[] = [
        {
            key: "orderDate",
            label: "Order Date",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => <span className="text-xs font-medium text-slate-500">{val}</span>
        },
        {
            key: "jobName",
            label: "Job Name",
            render: (val) => <span className="font-bold text-sm text-slate-900">{val}</span>
        },
        {
            key: "vendor",
            label: "Vendor",
            render: (val) => <span className="text-sm font-medium text-slate-700">{val}</span>
        },
        {
            key: "poType",
            label: "Category",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            render: (val) => (
                <Badge variant="outline" className="bg-slate-50 border-slate-200 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                    {val}
                </Badge>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <Badge className={
                    val === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        val === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border-emerald-100'
                } variant="outline">
                    {val}
                </Badge>
            )
        },
        {
            key: "amount",
            label: "Amount",
            render: (val) => <span className="font-bold text-sm text-slate-900">₹{val.toLocaleString()}</span>
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: () => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-indigo-200 bg-white text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-none" title="View Order History">
                        <History className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    if (view === "new") {
        return <NewOrderView onBack={() => setView("list")} />
    }

    return (
        <div className="space-y-6 font-sans bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans italic uppercase">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">External Operations</h1>
                </div>
                <Button
                    className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto"
                    style={{ background: 'var(--primary)' }}
                    onClick={() => setView("new")}
                >
                    <Plus className="h-4 w-4" /> New Outsource Order
                </Button>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <DataGrid
                    data={orders}
                    columns={orderColumns}
                    enableDateRange={true}
                    dateFilterKey="orderDate"
                    searchPlaceholder="Search jobs, vendors or orders..."
                    hideTitle={true}
                    toolbarClassName="border-b px-4 py-1.5 bg-white"
                />
            </div>
        </div>
    )
}
