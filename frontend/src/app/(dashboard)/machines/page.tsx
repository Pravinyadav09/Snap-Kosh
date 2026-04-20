"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import {
    Plus, Edit, Trash2, Info,
    Layers, BarChart2, QrCode, Gauge, RefreshCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
    Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter, DialogHeader
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { DropdownRegistrySelect } from "@/components/shared/dropdown-registry-select"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

// ─── Types ─────────────────────────────────────────────────────────────────────
type PricingTier = {
    id: string
    start: number | string
    end: number | string | null
    rateColor: number | string
    rateBW: number | string
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
    costingHourly: number | string
    colorConfig: ColorConfig
    status: string
    internalCode: string
    date: string
    currentMeter: number | string
}

// ─── Form Data Helper ────────────────────────────────────────────────────────
const getNewMachineTemplate = (): Machine => ({
    id: 0,
    name: "",
    type: "Digital",
    model: "N/A",
    costingHourly: "",
    colorConfig: { type: "click", colorRate: 0, bwRate: 0, colorMin: 0, bwMin: 0 },
    status: "Operational",
    internalCode: "",
    date: new Date().toISOString(),
    currentMeter: ""
})

// ─── Machine Form Dialog ────────────────────────────────────────────────────────
function MachineFormDialog({
    machine,
    onClose,
    onSave
}: {
    machine: Machine,
    onClose: () => void,
    onSave: (m: Machine) => Promise<void>
}) {
    const [localMachine, setLocalMachine] = useState<Machine>({ ...machine })
    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        await onSave(localMachine)
        setIsSaving(false)
    }

    return (
        <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden font-sans border border-slate-200 shadow-xl rounded-xl bg-white flex flex-col max-h-[92vh]">
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white relative">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 p-2 rounded-lg border bg-slate-50 flex items-center justify-center shadow-sm" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-800 leading-none">
                                {machine.id === 0 ? "Register New Machine" : "Modify Equipment Record"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 mt-1.5 font-sans">Configure production telemetry and costing metrics.</DialogDescription>
                        </div>
                    </div>
                    <div className="absolute top-6 right-12">
                        <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 bg-slate-50 uppercase tracking-widest px-2.5 h-6 rounded-sm">PRD-MAC-2026</Badge>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase border-l-2 border-indigo-500 pl-2">
                            Identification & Type
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Machine Name <span className="text-rose-500">*</span></Label>
                                <Input
                                    placeholder="e.g. Heidelberg SM 74"
                                    value={localMachine.name}
                                    onChange={e => setLocalMachine(prev => ({ ...prev, name: e.target.value }))}
                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <DropdownRegistrySelect
                                    category="MachineType"
                                    value={localMachine.type}
                                    onValueChange={val => setLocalMachine(prev => ({ ...prev, type: val }))}
                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm bg-white"
                                    fallbackOptions={[
                                        { value: "Digital", label: "Digital" },
                                        { value: "Offset", label: "Offset" },
                                        { value: "Wide-Format", label: "Wide Format" },
                                        { value: "Finishing", label: "Finishing" }
                                    ]}
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Make / Model</Label>
                                <Input
                                    placeholder="e.g. Konica Minolta C3070"
                                    value={localMachine.model}
                                    onChange={e => setLocalMachine(prev => ({ ...prev, model: e.target.value }))}
                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase border-l-2 border-emerald-500 pl-2">
                            Rates & Pricing Strategy
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Hourly Operating Cost</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm font-sans">₹</span>
                                    <Input
                                        type="number"
                                        value={localMachine.costingHourly}
                                        onChange={e => setLocalMachine(prev => ({ ...prev, costingHourly: e.target.value }))}
                                        className="h-9 rounded-md border-slate-200 bg-white shadow-none pl-7 text-sm font-bold font-sans"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Operational Status</Label>
                                <div className="flex items-center justify-between h-9 px-3 border border-slate-200 rounded-md bg-slate-50/30">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${localMachine.status === "Operational" ? 'text-emerald-600' : 'text-slate-400'}`}>{localMachine.status}</span>
                                    <Switch
                                        checked={localMachine.status === "Operational"}
                                        onCheckedChange={(checked) => setLocalMachine(prev => ({ ...prev, status: checked ? "Operational" : "Idle" }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs font-medium text-slate-600 font-sans leading-none">Pricing Strategy <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={[
                                        { value: "click", label: "Click Based (Meter)" },
                                        { value: "slab", label: "Quantity Slabs (Volume Discount)" }
                                    ]}
                                    value={localMachine.colorConfig.type}
                                    onValueChange={(val) => {
                                        if (val === "click") {
                                            setLocalMachine(prev => ({ ...prev, colorConfig: { type: "click", colorRate: 0, bwRate: 0, colorMin: 0, bwMin: 0 } }))
                                        } else {
                                            setLocalMachine(prev => ({
                                                ...prev,
                                                colorConfig: {
                                                    type: "slab",
                                                    tiers: [
                                                        { id: "1", start: 0, end: 500, rateColor: 5, rateBW: 2, label: "Low" },
                                                        { id: "2", start: 501, end: 1000, rateColor: 4.5, rateBW: 1.8, label: "Medium" }
                                                    ]
                                                }
                                            }))
                                        }
                                    }}
                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {localMachine.colorConfig.type === "slab" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase border-l-2 border-violet-500 pl-2">
                                    Pricing Tiers Configuration
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (localMachine.colorConfig.type === "slab") {
                                            const newTier: PricingTier = {
                                                id: Date.now().toString(),
                                                start: 0,
                                                end: 1000,
                                                rateColor: 0,
                                                rateBW: 0,
                                                label: "Standard"
                                            }
                                            setLocalMachine(prev => ({
                                                ...prev,
                                                colorConfig: {
                                                    type: "slab",
                                                    tiers: [...(prev.colorConfig as { type: "slab", tiers: PricingTier[] }).tiers, newTier]
                                                }
                                            }))
                                        }
                                    }}
                                    className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider text-violet-600 border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-md"
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Tier
                                </Button>
                            </div>

                            <div className="border border-slate-100 rounded-lg overflow-hidden bg-white shadow-sm">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Start</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">End</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Color (₹)</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">B/W (₹)</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Label</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans text-center">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {localMachine.colorConfig.tiers.map((tier) => (
                                            <TableRow key={tier.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                                                <TableCell className="py-2">
                                                    <Input type="number" value={tier.start} onChange={e => {
                                                        const updated = localMachine.colorConfig.type === 'slab' ? localMachine.colorConfig.tiers.map(t => t.id === tier.id ? { ...t, start: e.target.value } : t) : []
                                                        setLocalMachine(prev => ({ ...prev, colorConfig: { type: 'slab', tiers: updated } }))
                                                    }} className="h-8 w-16 px-2 text-center text-xs font-bold border-slate-100 rounded shadow-none bg-transparent focus:bg-white" />
                                                </TableCell>
                                                <TableCell className="py-2">
                                                    <Input type="number" value={tier.end || ''} onChange={e => {
                                                        const updated = localMachine.colorConfig.type === 'slab' ? localMachine.colorConfig.tiers.map(t => t.id === tier.id ? { ...t, end: e.target.value || null } : t) : []
                                                        setLocalMachine(prev => ({ ...prev, colorConfig: { type: 'slab', tiers: updated } }))
                                                    }} className="h-8 w-16 px-2 text-center text-xs font-bold border-slate-100 rounded shadow-none bg-transparent focus:bg-white" />
                                                </TableCell>
                                                <TableCell className="py-2">
                                                    <Input type="number" step="0.1" value={tier.rateColor} onChange={e => {
                                                        const updated = localMachine.colorConfig.type === 'slab' ? localMachine.colorConfig.tiers.map(t => t.id === tier.id ? { ...t, rateColor: e.target.value } : t) : []
                                                        setLocalMachine(prev => ({ ...prev, colorConfig: { type: 'slab', tiers: updated } }))
                                                    }} className="h-8 w-16 px-2 text-center text-xs font-bold border-emerald-100 text-emerald-600 rounded shadow-none bg-transparent focus:bg-white" />
                                                </TableCell>
                                                <TableCell className="py-2">
                                                    <Input type="number" step="0.1" value={tier.rateBW} onChange={e => {
                                                        const updated = localMachine.colorConfig.type === 'slab' ? localMachine.colorConfig.tiers.map(t => t.id === tier.id ? { ...t, rateBW: e.target.value } : t) : []
                                                        setLocalMachine(prev => ({ ...prev, colorConfig: { type: 'slab', tiers: updated } }))
                                                    }} className="h-8 w-16 px-2 text-center text-xs font-bold border-indigo-100 text-indigo-600 rounded shadow-none bg-transparent focus:bg-white" />
                                                </TableCell>
                                                <TableCell className="py-2">
                                                    <Input value={tier.label} onChange={e => {
                                                        const updated = localMachine.colorConfig.type === 'slab' ? localMachine.colorConfig.tiers.map(t => t.id === tier.id ? { ...t, label: e.target.value } : t) : []
                                                        setLocalMachine(prev => ({ ...prev, colorConfig: { type: 'slab', tiers: updated } }))
                                                    }} className="h-8 w-20 px-2 text-xs font-medium border-slate-100 rounded shadow-none bg-transparent focus:bg-white" />
                                                </TableCell>
                                                <TableCell className="py-2 text-center">
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => {
                                                        const updated = localMachine.colorConfig.type === 'slab' ? localMachine.colorConfig.tiers.filter(t => t.id !== tier.id) : []
                                                        setLocalMachine(prev => ({ ...prev, colorConfig: { type: 'slab', tiers: updated } }))
                                                    }} className="h-7 w-7 text-slate-300 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 font-sans">
                    <Button type="button" variant="ghost" className="h-9 px-4 rounded-md text-xs font-bold text-slate-500 hover:bg-slate-100 uppercase tracking-wider" onClick={onClose}>Discard</Button>
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-9 px-8 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 whitespace-nowrap"
                        style={{ background: 'var(--primary)' }}
                    >
                        {isSaving ? "Authorizing..." : "Register / Commit Machine"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MachinesPage() {
    const [machines, setMachines] = useState<Machine[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingMachine, setEditingMachine] = useState<Machine | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)

    const fetchMachines = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/machines`)
            if (res.ok) {
                const data = await res.json()
                const mapped: Machine[] = data.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    type: m.type,
                    status: m.status,
                    currentMeter: m.currentMeterReading,
                    date: new Date(m.lastServiceDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }),
                    model: "N/A",
                    internalCode: `M-${m.id.toString().padStart(2, '0')}`,
                    costingHourly: 0,
                    colorConfig: { type: "click", colorRate: 0, bwRate: 0, colorMin: 0, bwMin: 0 }
                }))
                setMachines(mapped)
            } else {
                toast.error("Failed to load machines")
            }
        } catch (err) {
            console.error("Backend unavailable", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMachines()
    }, [])

    const handleSave = async (machine: Machine) => {
        try {
            const isNew = machine.id === 0
            const url = isNew ? `${API_BASE}/api/machines` : `${API_BASE}/api/machines/${machine.id}`
            const method = isNew ? "POST" : "PUT"
            
            const backendData = {
                id: machine.id,
                name: machine.name,
                type: machine.type,
                status: machine.status,
                currentMeterReading: parseFloat(machine.currentMeter.toString()) || 0,
                lastServiceDate: new Date(machine.date).toISOString(),
                isActive: true,
                costingHourly: parseFloat(machine.costingHourly.toString()) || 0,
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(backendData)
            })

            if (res.ok) {
                toast.success(isNew ? "Machine registered" : "Machine updated")
                setIsFormOpen(false)
                fetchMachines()
            } else {
                const errData = await res.json()
                toast.error("Operation Denied", { description: errData.message || "Failed to save machine" })
            }
        } catch (error) {
            toast.error("Network synchronization error")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to decommission this unit and remove it from the master registry?")) return

        try {
            const res = await fetch(`${API_BASE}/api/machines/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Machine decommissioned", {
                    description: "The equipment record has been removed from active telemetry."
                })
                fetchMachines()
            } else {
                toast.error("Process denied", { description: "Could not remove machine from registry." })
            }
        } catch (error) {
            toast.error("Network synchronization error")
        }
    }

    const columns: ColumnDef<Machine>[] = useMemo(() => [
        {
            key: "internalCode",
            label: "ID CODE",
            headerClassName: "w-[120px] uppercase font-bold text-[10px] tracking-widest text-slate-400",
            className: "font-mono font-bold text-[#4C1F7A]",
        },
        {
            key: "name",
            label: "MACHINE IDENTITY",
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400 font-sans",
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 tracking-tight uppercase">{val}</span>
                    <Badge variant="outline" className="w-fit text-[9px] font-bold p-0 px-1.5 h-4 border-slate-200 text-slate-400 mt-1 uppercase rounded-sm">
                        {row.type}
                    </Badge>
                </div>
            )
        },
        {
            key: "currentMeter",
            label: "METERING",
            headerClassName: "uppercase font-bold text-[10px] tracking-widest text-slate-400",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <Gauge className="h-3 w-3 text-slate-300" />
                    <span className="font-bold text-xs tabular-nums text-slate-600">{val?.toLocaleString() || 0}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "STATUS",
            headerClassName: "w-[150px] uppercase font-bold text-[10px] tracking-widest text-slate-400 font-sans",
            render: (val) => {
                const isOp = val === "Operational" || val === "Active"
                return (
                    <Badge className={`font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm border-none shadow-sm ${isOp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        {val}
                    </Badge>
                )
            }
        },
        {
            key: "date",
            label: "HEALTH CHECK",
            headerClassName: "text-center uppercase font-bold text-[10px] tracking-widest text-slate-400 font-sans",
            className: "text-center",
            render: (val) => <span className="text-[10px] font-bold text-slate-400 font-sans">{val}</span>
        },
        {
            key: "actions",
            label: "Review",
            headerClassName: "text-right px-4 uppercase font-bold text-[10px] tracking-widest text-slate-400",
            className: "text-right px-4",
            filterable: false,
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-[#4C1F7A] hover:bg-[#F5F3FF]"
                        onClick={() => {
                            setEditingMachine(row)
                            setIsFormOpen(true)
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                        onClick={() => handleDelete(row.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ], [])

    return (
        <div className="space-y-6 font-sans mt-2">
            <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-2 mb-2 px-1 gap-2 font-sans uppercase">
                <div className="flex items-center gap-2">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">Machine Master</h1>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={fetchMachines}
                        className="h-9 w-9 p-0 rounded-lg border-slate-200 text-slate-500 hover:text-slate-800 transition-all shadow-sm"
                    >
                        <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>

                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                type="button"
                                onClick={() => {
                                    setEditingMachine(getNewMachineTemplate())
                                    setIsFormOpen(true)
                                }}
                                className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95 whitespace-nowrap"
                                style={{ background: 'var(--primary)' }}
                            >
                                <Plus className="h-4 w-4" /> Register Machine
                            </Button>
                        </DialogTrigger>
                        {isFormOpen && (
                            <MachineFormDialog 
                                machine={editingMachine || getNewMachineTemplate()} 
                                onClose={() => {
                                    setIsFormOpen(false)
                                    setEditingMachine(null)
                                }}
                                onSave={handleSave}
                            />
                        )}
                    </Dialog>
                </div>
            </div>

            <div className="bg-transparent rounded-md border-none px-0 w-full max-w-full">
                <DataGrid
                    data={machines}
                    columns={columns}
                    title="None"
                    hideTitle={true}
                    enableCardView={true}
                    isLoading={isLoading}
                    searchPlaceholder="Filter equipment by code, name or status..."
                />
            </div>
        </div>
    )
}
