"use client"

import React, { useState } from "react"
import {
    Plus,
    Search,
    Package,
    Layers,
    History,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Weight,
    Boxes,
    Download,
    Filter,
    Activity,
    AlertCircle,
    Calendar,
    Truck,
    ClipboardList,
    TrendingUp,
    LayoutGrid,
    ChevronRight,
    FileText,
    ArrowDownToLine,
    ShieldCheck,
    Info
} from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { SearchableSelect } from "@/components/shared/searchable-select"

// ─── Mock Data for Real-time Status ──────────────────────────────────────────
const stockItems = [
    {
        id: "STK-001",
        name: "170 GSM Art Paper",
        category: "Paper",
        opening: 5000,
        received: 2000,
        deducted: 1200,
        remaining: 5800,
        unit: "Sheets",
        threshold: 1000,
        status: "Normal",
        lastActivity: "2h ago",
        date: "02 Mar, 2026"
    },
    {
        id: "STK-002",
        name: "300 GSM Art Card",
        category: "Paper",
        opening: 1200,
        received: 0,
        deducted: 850,
        remaining: 350,
        unit: "Sheets",
        threshold: 500,
        status: "Low Stock",
        lastActivity: "5h ago",
        date: "01 Mar, 2026"
    },
    {
        id: "STK-003",
        name: "Standard Bond (70 GSM)",
        category: "Paper",
        opening: 15000,
        received: 5000,
        deducted: 2000,
        remaining: 18000,
        unit: "Sheets",
        threshold: 3000,
        status: "Normal",
        lastActivity: "1d ago",
        date: "28 Feb, 2026"
    },
    {
        id: "STK-004",
        name: "Flexible Vinyl (White)",
        category: "Media",
        opening: 200,
        received: 100,
        deducted: 50,
        remaining: 250,
        unit: "Meters",
        threshold: 50,
        status: "Normal",
        lastActivity: "3h ago",
        date: "27 Feb, 2026"
    }
]

// ─── Mock Data for Deduction History ─────────────────────────────────────────
const deductionLogs = [
    {
        id: "DED-8821",
        jobId: "JB-2026-0045",
        material: "170 GSM Art Paper",
        quantity: 1200,
        unit: "Sheets",
        operator: "Shubham Soni",
        date: "11 Mar, 2026",
        status: "Completed",
        category: "Paper"
    },
    {
        id: "DED-8819",
        jobId: "JB-2026-0042",
        material: "300 GSM Art Card",
        quantity: 450,
        unit: "Sheets",
        operator: "Vikas Shah",
        date: "10 Mar, 2026",
        status: "Completed",
        category: "Paper"
    },
    {
        id: "DED-8815",
        jobId: "JB-2026-0038",
        material: "Flexible Vinyl (White)",
        quantity: 25,
        unit: "Meters",
        operator: "Rahul Verma",
        date: "09 Mar, 2026",
        status: "Completed",
        category: "Media"
    },
    {
        id: "DED-8810",
        jobId: "JB-2026-0035",
        material: "Standard Bond (70 GSM)",
        quantity: 2000,
        unit: "Sheets",
        operator: "Shubham Soni",
        date: "08 Mar, 2026",
        status: "Completed",
        category: "Paper"
    },
    {
        id: "DED-8804",
        jobId: "JB-2026-0031",
        material: "300 GSM Art Card",
        quantity: 400,
        unit: "Sheets",
        operator: "Vikas Shah",
        date: "07 Mar, 2026",
        status: "Completed",
        category: "Paper"
    }
]

// ─── GRN (Goods Received Note) Dialog ─────────────────────────────────────────
function GRNEntryDialog({ onClose }: { onClose: () => void }) {
    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[90vh] flex flex-col uppercase font-sans">
            <DialogHeader className="px-4 sm:px-6 py-4 text-left border-b border-slate-100 bg-white italic font-sans uppercase">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                        <ArrowDownToLine className="h-4 w-4" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-black tracking-tight text-slate-800 leading-none">Purchase Inward (GRN)</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400 font-medium mt-1">Register inward stock and synchronize warehouse inventory levels.</DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="px-6 py-6 space-y-6">
                    {/* 01: Metadata */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">General Information</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Receipt Date</Label>
                                <Input type="date" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" defaultValue="2026-03-02" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Supplier</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'gh', label: 'Gallia-Hegmann' },
                                        { value: 'be', label: 'Bergstrom Paper' }
                                    ]}
                                    placeholder="Select Supplier"
                                    onValueChange={(val) => console.log(val)}
                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 02: Stock Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Boxes className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Material Details</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 bg-slate-50/50 p-4 rounded-md border border-slate-100">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Item Name <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={stockItems.map(item => ({
                                        value: item.id,
                                        label: `${item.name} (${item.unit})`
                                    }))}
                                    placeholder="Select existing paper/media..."
                                    onValueChange={(val) => console.log(val)}
                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Quantity Received</Label>
                                    <Input type="number" className="h-9 border-slate-200 bg-white font-bold text-sm rounded-md" placeholder="0" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Unit</Label>
                                    <Input className="h-9 border-slate-200 bg-slate-50/50 font-medium text-slate-500 text-sm rounded-md" readOnly defaultValue="Sheets" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <Button
                    variant="ghost"
                    className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800"
                    onClick={onClose}
                >
                    Discard Entry
                </Button>
                <Button
                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                    style={{ background: 'var(--primary)' }}
                    onClick={() => {
                        toast.success("Stock Updated", {
                            description: "Inventory levels synchronized with GRN."
                        })
                        onClose()
                    }}
                >
                    Finalize Receipt
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default function InventoryPage() {
    const [isGRNOpen, setIsGRNOpen] = useState(false)

    const columns: ColumnDef<typeof stockItems[0]>[] = [
        {
            key: "id",
            label: "Inward ID",
            className: "hidden xl:table-cell",
            headerClassName: "hidden xl:table-cell",
            render: (val) => <span className="font-mono text-[10px] font-bold text-slate-400 lowercase italic">#{val as string}</span>
        },
        {
            key: "name",
            label: "Material Name",
            render: (val, item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-sm tracking-tight">{val as string}</span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                        <History className="h-3 w-3" /> {item.lastActivity}
                    </span>
                </div>
            )
        },
        {
            key: "category",
            label: "Category",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            render: (val) => (
                <Badge variant="outline" className="border-slate-100 bg-white font-medium text-[10px] px-2 h-5 shadow-none text-slate-500">{val as string}</Badge>
            )
        },
        {
            key: "opening",
            label: "Opening",
            className: "text-right hidden sm:table-cell",
            headerClassName: "text-right hidden sm:table-cell",
            render: (val) => <span className="font-medium text-xs tabular-nums text-slate-400">{(val as number).toLocaleString()}</span>
        },
        {
            key: "received",
            label: "Rev (+)",
            className: "text-right font-semibold text-xs tabular-nums text-emerald-600 hidden md:table-cell",
            headerClassName: "text-right hidden md:table-cell",
            render: (val) => `+${(val as number).toLocaleString()}`
        },
        {
            key: "deducted",
            label: "Iss (-)",
            className: "text-right font-semibold text-xs tabular-nums text-rose-500 hidden md:table-cell",
            headerClassName: "text-right hidden md:table-cell",
            render: (val) => `-${(val as number).toLocaleString()}`
        },
        {
            key: "remaining",
            label: "Remaining",
            className: "text-right",
            render: (val, item) => (
                <span className="font-bold text-sm tabular-nums text-slate-900">
                    {(val as number).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            className: "text-center",
            render: (val) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium ${val === 'Normal'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                    }`}>
                    {val as string}
                </span>
            )
        }
    ]

    const historyColumns: ColumnDef<typeof deductionLogs[0]>[] = [
        {
            key: "id",
            label: "Log ID",
            className: "hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: (val) => <span className="font-mono text-[10px] font-bold text-slate-400 lowercase">#{val as string}</span>
        },
        {
            key: "date",
            label: "Timestamp",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => (
                <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                    <Calendar className="h-3 w-3" /> {val as string}
                </div>
            )
        },
        {
            key: "jobId",
            label: "Job Ref",
            className: "hidden xl:table-cell",
            headerClassName: "hidden xl:table-cell",
            render: (val) => (
                <Badge variant="outline" className="font-bold text-[10px] border-slate-100 bg-slate-50 text-slate-500 h-5">
                    {val as string}
                </Badge>
            )
        },
        {
            key: "material",
            label: "Material Information",
            render: (val, item) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800 text-sm tracking-tight leading-tight">{val as string}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.category}</span>
                </div>
            )
        },
        {
            key: "quantity",
            label: "Qty Deducted",
            className: "text-right",
            render: (val, item) => (
                <span className="font-bold text-sm tabular-nums text-rose-600">
                    -{(val as number).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                </span>
            )
        },
        {
            key: "operator",
            label: "Issued By",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 border border-slate-200 uppercase">
                        {(val as string).charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{val as string}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            className: "text-center",
            render: (val) => (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="h-3 w-3" /> {val as string}
                </span>
            )
        }
    ]

    return (
        <div className="space-y-4 font-sans bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 pb-2 font-sans italic uppercase">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">Inventory Master</h1>
                </div>
                <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                    <Dialog open={isGRNOpen} onOpenChange={setIsGRNOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-md gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                                <Plus className="h-4 w-4" /> <span className="sm:inline">New GRN Piece</span>
                            </Button>
                        </DialogTrigger>
                        <GRNEntryDialog onClose={() => setIsGRNOpen(false)} />
                    </Dialog>
                </div>
            </div>


            {/* Main Stock Status Section */}
            <Tabs defaultValue="status" className="w-full">
                <div className="flex items-center justify-between mb-4 px-1">
                    <TabsList className="inventory-tabs-list bg-white border border-slate-200 p-1 h-9 rounded-md shadow-sm">
                        <style jsx global>{`
                            .inventory-tabs-list [data-state="active"] {
                                background-color: var(--primary) !important;
                                color: white !important;
                            }
                        `}</style>
                        <TabsTrigger
                            value="status"
                            className="rounded px-4 text-xs font-bold text-slate-500 transition-all h-7"
                        >
                            Live Stock Status
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="rounded px-4 text-xs font-bold text-slate-500 transition-all h-7"
                        >
                            Deduction History
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="status" className="mt-0 outline-none">
                    <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                        <DataGrid
                            data={stockItems}
                            columns={columns}
                            enableDateRange={true}
                            dateFilterKey="date"
                            searchPlaceholder="Search inventory by name, category..."
                            title="None"
                            hideTitle={true}
                            toolbarClassName="border-b px-4 py-3 bg-white"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0 outline-none">
                    <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                        <DataGrid
                            data={deductionLogs}
                            columns={historyColumns}
                            enableDateRange={true}
                            dateFilterKey="date"
                            searchPlaceholder="Search logs by material, job ID, operator..."
                            title="None"
                            hideTitle={true}
                            toolbarClassName="border-b px-4 py-3 bg-white"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
