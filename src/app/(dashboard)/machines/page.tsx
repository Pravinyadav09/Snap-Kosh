"use client"

import React, { useState, useMemo } from "react"
import { toast } from "sonner"
import {
    Plus, Edit, Trash2, Info,
    Layers, BarChart2, QrCode, Gauge
} from "lucide-react"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
    Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

// ─── Types ─────────────────────────────────────────────────────────────────────
type PricingTier = {
    id: string
    start: number
    end: number | null
    rateColor: number
    rateBW: number
    label: string
}

type ColorConfig =
    | { type: "click"; colorRate: number; bwRate: number; colorMin: number; bwMin: number }
    | { type: "slab"; tiers: PricingTier[] }
    | { type: "coverage" }

type Machine = {
    id: number
    name: string
    type: string
    model: string
    costingHourly: number
    colorConfig: ColorConfig
    status: string
    internalCode: string
    date: string
    currentMeter: number
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const initialMachines: Machine[] = [
    {
        id: 1, name: "Epson SureColor S80670", type: "Wide Format", model: "N/A",
        costingHourly: 1258, internalCode: "M-01", status: "Operational",
        date: "11 Feb, 2026", currentMeter: 7142,
        colorConfig: { type: "click", colorRate: 5.0, bwRate: 3.0, colorMin: 0, bwMin: 0 }
    },
    {
        id: 2, name: "Heidelberg Speedmaster", type: "Offset", model: "N/A",
        costingHourly: 1643, internalCode: "M-02", status: "Operational",
        date: "10 Feb, 2026", currentMeter: 6050,
        colorConfig: {
            type: "slab",
            tiers: [
                { id: "1", start: 0, end: 500, rateColor: 5.0, rateBW: 2.0, label: "Low" },
                { id: "2", start: 501, end: 1000, rateColor: 4.5, rateBW: 1.8, label: "Medium" },
                { id: "3", start: 1001, end: null, rateColor: 4.0, rateBW: 1.7, label: "High" }
            ]
        }
    },
    {
        id: 3, name: "Konica Minolta C6085", type: "Digital", model: "N/A",
        costingHourly: 1771, internalCode: "M-03", status: "Operational",
        date: "09 Feb, 2026", currentMeter: 8700,
        colorConfig: { type: "coverage" }
    },
]

// ─── Machine Form Dialog ────────────────────────────────────────────────────────
function MachineFormDialog({
    machine,
    onClose
}: {
    machine?: Machine,
    onClose: () => void
}) {
    const [pricingLogic, setPricingLogic] = useState<ColorConfig["type"]>(machine?.colorConfig.type || "slab")
    const [tiers, setTiers] = useState<PricingTier[]>(
        machine?.colorConfig.type === "slab" ? machine.colorConfig.tiers : [
            { id: "1", start: 0, end: 500, rateColor: 5.0, rateBW: 2.0, label: "Low" },
            { id: "2", start: 501, end: 1000, rateColor: 4.5, rateBW: 1.8, label: "Medium" },
            { id: "3", start: 1001, end: null, rateColor: 4.0, rateBW: 1.7, label: "High" }
        ]
    )

    const addTier = () => {
        const lastTier = tiers[tiers.length - 1]
        const newStart = lastTier ? (lastTier.end || lastTier.start) + 1 : 0
        setTiers([...tiers, {
            id: Math.random().toString(36).substr(2, 9),
            start: newStart,
            end: null,
            rateColor: 0,
            rateBW: 0,
            label: ""
        }])
    }

    const removeTier = (id: string) => {
        setTiers(tiers.filter(t => t.id !== id))
    }

    const updateTier = (id: string, field: keyof PricingTier, value: string | number | null) => {
        setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t))
    }

    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[1000px] w-full p-0 border-none shadow-xl rounded-md bg-white font-sans overflow-hidden italic uppercase">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white italic font-sans uppercase">
                <DialogTitle className="text-lg font-black text-slate-900 tracking-tight leading-none italic">
                    {machine ? "Revise Machine Logic" : "Register New Machine"}
                </DialogTitle>
                <DialogDescription className="sr-only">Machine Configuration Form</DialogDescription>
            </div>

            <div className="p-4 sm:p-8 space-y-8 flex-1 overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Identification */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Identification</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Machine Name <span className="text-rose-500">*</span></Label>
                                <Input className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm" defaultValue={machine?.name} placeholder="e.g. Heidelberg SM 74" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Internal Code</Label>
                                <Input className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm" defaultValue={machine?.internalCode} placeholder="M-01" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Machine Type <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'digital', label: 'Digital' },
                                        { value: 'offset', label: 'Offset' },
                                        { value: 'wide-format', label: 'Wide Format' },
                                        { value: 'finishing', label: 'Finishing' }
                                    ]}
                                    value={machine?.type?.toLowerCase() || "offset"}
                                    onValueChange={(val) => console.log(val)}
                                    placeholder="Select Type"
                                    className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Make / Model</Label>
                                <Input className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm" defaultValue={machine?.model} placeholder="e.g. Konica Minolta C3070" />
                            </div>
                        </div>
                    </div>

                    {/* Costing Highlight */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rates & Status</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 sm:p-5 rounded-md bg-cyan-50/50 border border-cyan-100/50">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-teal-700 tracking-tight">Hourly Operating Cost:</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-bold text-teal-800">₹</span>
                                        <Input
                                            type="number"
                                            className="h-8 w-full sm:w-32 border-none bg-transparent p-0 text-xl font-bold text-teal-800 focus-visible:ring-0"
                                            defaultValue={machine?.costingHourly || 1643.00}
                                        />
                                    </div>
                                </div>
                                <BarChart2 className="h-5 w-5 text-teal-600/50 hidden sm:block" />
                            </div>

                            <div className="p-4 sm:p-5 rounded-md border border-slate-100 flex items-center justify-between">
                                <div className="space-y-0.5 pr-2">
                                    <Label className="text-xs font-medium text-slate-600">Machine Status</Label>
                                    <p className="text-[10px] text-slate-400 font-medium">Currently operational on floor</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-emerald-500 shrink-0" defaultChecked={machine?.status === "Operational"} />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Pricing Strategy <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'simple', label: 'Simple (Fixed Rate)' },
                                        { value: 'click', label: 'Click Based (Meter)' },
                                        { value: 'slab', label: 'Quantity Slabs (Volume Discount)' }
                                    ]}
                                    value={pricingLogic}
                                    onValueChange={(val) => setPricingLogic(val as ColorConfig["type"])}
                                    placeholder="Select Strategy"
                                    className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tiers Configuration - Full Width Section */}
                {pricingLogic === "slab" && (
                    <div className="space-y-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pricing Tiers Configuration</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addTier}
                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest border-dashed border-slate-200 text-slate-500 transition-all"
                                style={{ hover: { color: 'var(--primary)', borderColor: 'var(--primary)' } } as any}
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add Tier
                            </Button>
                        </div>

                        <div className="border border-slate-100 rounded-lg overflow-x-auto bg-white shadow-sm scrollbar-thin">
                            <Table className="min-w-[800px]">
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest text-slate-400 py-3 px-4">Start Qty</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest text-slate-400 py-3 px-4">End Qty</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest text-slate-400 py-3 px-4">Color Rate (₹)</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest text-slate-400 py-3 px-4">B/W Rate (₹)</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest text-slate-400 py-3 px-4">Label</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest text-slate-400 py-3 px-4 text-center">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tiers.map((tier) => (
                                        <TableRow key={tier.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                                            <TableCell className="p-2 px-4">
                                                <Input
                                                    className="h-8 w-20 rounded-md border-slate-100 bg-transparent text-xs font-semibold text-center mx-auto"
                                                    value={tier.start}
                                                    onChange={(e) => updateTier(tier.id, "start", parseInt(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell className="p-2 px-4">
                                                <Input
                                                    className="h-8 w-20 rounded-md border-slate-100 bg-transparent text-xs font-semibold text-center mx-auto"
                                                    value={tier.end || ""}
                                                    placeholder="∞"
                                                    onChange={(e) => updateTier(tier.id, "end", e.target.value ? parseInt(e.target.value) : null)}
                                                />
                                            </TableCell>
                                            <TableCell className="p-2 px-4">
                                                <Input
                                                    className="h-8 w-24 rounded-md border-slate-100 bg-transparent text-xs font-bold text-center mx-auto"
                                                    style={{ color: 'var(--primary)' }}
                                                    value={tier.rateColor}
                                                    onChange={(e) => updateTier(tier.id, "rateColor", parseFloat(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell className="p-2 px-4">
                                                <Input
                                                    className="h-8 w-24 rounded-md border-slate-100 bg-transparent text-xs font-bold text-center text-slate-700 mx-auto"
                                                    value={tier.rateBW}
                                                    onChange={(e) => updateTier(tier.id, "rateBW", parseFloat(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell className="p-2 px-4">
                                                <Input
                                                    className="h-8 rounded-md border-slate-100 bg-transparent text-xs font-medium text-center"
                                                    value={tier.label}
                                                    placeholder="e.g. Bulk"
                                                    onChange={(e) => updateTier(tier.id, "label", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="p-2 px-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-rose-500 hover:bg-rose-50 rounded-md"
                                                    onClick={() => removeTier(tier.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>

            <DialogFooter className="p-4 flex flex-row items-center justify-end gap-3 border-t bg-slate-50/30">
                <Button
                    variant="ghost"
                    className="h-9 px-4 text-sm font-medium text-slate-600 hover:text-slate-800"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    className="h-9 px-6 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                    style={{ background: 'var(--primary)' }}
                    onClick={onClose}
                >
                    {machine ? "Update Machine" : "Save Machine Details"}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MachinesPage() {
    const [machines] = useState<Machine[]>(initialMachines)
    const [showForm, setShowForm] = useState(false)
    const [editingMachine, setEditingMachine] = useState<Machine | undefined>(undefined)

    const handleEdit = (machine: Machine) => {
        setEditingMachine(machine)
        setShowForm(true)
    }

    const handleAdd = () => {
        setEditingMachine(undefined)
        setShowForm(true)
    }

    const columns: ColumnDef<Machine>[] = useMemo(() => [
        {
            key: "name",
            label: "Machine Name",
            render: (val, item) => (
                <div>
                    <p className="font-bold text-sm text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{item.type} | {item.model}</p>
                </div>
            )
        },
        {
            key: "costingHourly",
            label: "Costing (Hourly)",
            className: "hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: (val) => (
                <span className="font-bold text-sm text-slate-700">
                    ₹{(val as number).toLocaleString("en-IN", { minimumFractionDigits: 2 })} <span className="text-slate-400 font-normal text-xs">/hr</span>
                </span>
            )
        },
        {
            key: "colorConfig",
            label: "Color Config",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val: ColorConfig) => {
                if (val.type === "click") {
                    return (
                        <div className="text-xs space-y-0.5">
                            <div className="font-medium uppercase">Click: <span className="font-bold text-blue-600">₹{val.colorRate.toFixed(4)}</span></div>
                            <div className="text-slate-400 text-[10px]">Min: ₹{val.colorMin.toFixed(2)}</div>
                        </div>
                    )
                }
                if (val.type === "slab") {
                    return (
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: 'var(--primary)' }}>
                            <BarChart2 className="h-3 w-3" /> Slab Based
                        </span>
                    )
                }
                return (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase">
                        <Layers className="h-3 w-3" /> Coverage Based
                    </span>
                )
            }
        },
        {
            key: "bwConfig",
            label: "B/W Config",
            className: "hidden lg:table-cell",
            headerClassName: "hidden lg:table-cell",
            render: (_, item) => {
                const val = (item as Machine).colorConfig
                if (val.type === "click") {
                    return (
                        <div className="text-xs space-y-0.5">
                            <div className="font-medium uppercase">Click: <span className="font-bold text-slate-700">₹{val.bwRate.toFixed(4)}</span></div>
                            <div className="text-slate-400 text-[10px]">Min: ₹{val.bwMin.toFixed(2)}</div>
                        </div>
                    )
                }
                return (
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase">
                        <Info className="h-3 w-3" /> Tier Config
                    </span>
                )
            }
        },
        {
            key: "currentMeter",
            label: "Running Meter",
            className: "hidden xl:table-cell",
            headerClassName: "hidden xl:table-cell",
            render: (val) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-900">{(val as number).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Total Impressions</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px] uppercase tracking-wider">
                    {val as string}
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: (_, item) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md bg-white transition-all shadow-none border-indigo-100 text-indigo-500 hover:bg-indigo-50" title="Generate Machine QR" onClick={() => {
                        toast.success(`QR Generated for ${item.name}`, {
                            description: "Ready for printing and labeling machine",
                            icon: <QrCode className="size-4" />
                        })
                    }}>
                        <QrCode className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md bg-white transition-all shadow-none" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }} title="Edit Machine" onClick={() => handleEdit(item as Machine)}>
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Delete Machine">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ], [])

    return (
        <div className="space-y-4 font-sans text-left bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100 uppercase italic">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-1 gap-4 italic uppercase font-sans">
                <div className="space-y-0.5">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Machine Management</h1>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Dialog open={showForm} onOpenChange={setShowForm}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }} onClick={handleAdd}>
                                <Plus className="h-4 w-4" /> <span className="sm:inline">Register Instance</span>
                            </Button>
                        </DialogTrigger>
                        <MachineFormDialog
                            machine={editingMachine}
                            onClose={() => setShowForm(false)}
                        />
                    </Dialog>
                </div>
            </div>

            <DataGrid
                data={machines}
                columns={columns}
                enableDateRange={true}
                dateFilterKey="date"
                searchPlaceholder="Search machines by name or type..."
            />
        </div>
    )
}
