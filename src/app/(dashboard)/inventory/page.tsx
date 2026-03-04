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
    ShieldCheck
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

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
        lastActivity: "2h ago"
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
        lastActivity: "5h ago"
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
        lastActivity: "1d ago"
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
        lastActivity: "3h ago"
    }
]

// ─── GRN (Goods Received Note) Dialog ─────────────────────────────────────────
function GRNEntryDialog({ onClose }: { onClose: () => void }) {
    return (
        <DialogContent className="max-w-2xl p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white font-sans flex flex-col">
            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <ArrowDownToLine className="h-4 w-4" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-semibold tracking-tight text-slate-800">Goods Received Entry</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400">
                            Register inward stock and update warehouse inventory
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div className="px-6 py-6 space-y-6 flex-1 bg-white">
                {/* 01: Metadata */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">General Information</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Receipt Date</Label>
                            <Input type="date" className="h-9 rounded-md border-slate-200 bg-white font-medium text-slate-800 text-sm" defaultValue="2026-03-02" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Supplier</Label>
                            <Select>
                                <SelectTrigger className="h-9 rounded-md border-slate-200 bg-white font-medium text-slate-800 text-sm">
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent className="rounded-md">
                                    <SelectItem value="gh" className="text-sm">Gallia-Hegmann</SelectItem>
                                    <SelectItem value="be" className="text-sm">Bergstrom Paper</SelectItem>
                                </SelectContent>
                            </Select>
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
                            <Select>
                                <SelectTrigger className="h-9 rounded-md border-slate-200 bg-white font-medium text-slate-800 text-sm">
                                    <SelectValue placeholder="Select existing paper/media..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-md">
                                    {stockItems.map(item => (
                                        <SelectItem key={item.id} value={item.id} className="text-sm">
                                            {item.name} ({item.unit})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Quantity Received</Label>
                                <Input type="number" className="h-9 rounded-md border-slate-200 bg-white font-bold text-slate-900 text-sm" placeholder="0" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Unit</Label>
                                <Input className="h-9 rounded-md border-slate-200 bg-slate-100/50 font-medium text-slate-500 text-sm" readOnly defaultValue="Sheets" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="p-4 flex flex-row items-center justify-end gap-2 px-6 border-t bg-slate-50/50">
                <Button
                    variant="ghost"
                    className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    className="h-9 px-6 rounded-md text-xs font-semibold text-white shadow-sm"
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
            render: (val) => <span className="font-mono text-[10px] font-bold text-slate-400 lowercase">{val as string}</span>
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
            render: (val) => (
                <Badge variant="outline" className="border-slate-100 bg-white font-medium text-[10px] px-2 h-5 shadow-none text-slate-500">{val as string}</Badge>
            )
        },
        {
            key: "opening",
            label: "Opening",
            className: "text-right",
            render: (val) => <span className="font-medium text-xs tabular-nums text-slate-400">{(val as number).toLocaleString()}</span>
        },
        {
            key: "received",
            label: "Received (+)",
            className: "text-right font-semibold text-xs tabular-nums text-emerald-600",
            render: (val) => `+${(val as number).toLocaleString()}`
        },
        {
            key: "deducted",
            label: "Issued (-)",
            className: "text-right font-semibold text-xs tabular-nums text-rose-500",
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

    return (
        <div className="space-y-4 font-sans">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold tracking-tight text-slate-800">Inventory Master</h1>
                        <p className="text-[11px] text-slate-400">GRN Entry & Real-time Stock Status</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isGRNOpen} onOpenChange={setIsGRNOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-5 text-white font-medium text-xs rounded-md shadow-sm gap-2" style={{ background: 'var(--primary)' }}>
                                <Plus className="h-4 w-4" /> New GRN Entry
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
                            searchPlaceholder="Search inventory by name, category..."
                            title="None"
                            hideTitle={true}
                            toolbarClassName="border-b px-4 py-3 bg-white"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="h-[400px] flex flex-col items-center justify-center rounded-md border border-slate-200 bg-white/50 backdrop-blur-sm">
                        <div className="text-center space-y-3">
                            <div className="p-3 rounded-full bg-slate-50 text-slate-300 inline-block border border-slate-100">
                                <History className="h-6 w-6" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No deduction logs recorded for this period</p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
