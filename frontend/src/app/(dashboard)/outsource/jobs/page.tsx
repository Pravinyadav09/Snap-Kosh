"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import {
    Plus, ArrowLeft, Box, Maximize,
    History, Layers, Activity, Clock, RefreshCcw
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type OutsourceOrder = {
    id: number
    vendorId: number
    vendorName: string
    description: string
    cost: number
    status: string
    dueDate: string
    createdAt: string
}

function NewOrderView({ onBack, onRefresh }: { onBack: () => void, onRefresh: () => void }) {
    const [vendors, setVendors] = useState<{value: string, label: string}[]>([])
    const [isLoading, setIsLoading] = useState(false)
    
    // Form state
    const [formData, setFormData] = useState({
        vendorId: "",
        description: "",
        cost: 0,
        status: "Pending",
        dueDate: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        const fetchLookups = async () => {
            try {
                const vRes = await fetch(`${API_BASE}/api/Outsource/vendors/lookup`)
                if (vRes.ok) setVendors(await vRes.json().then(data => data.map((v: any) => ({ value: v.id.toString(), label: v.name }))))
            } catch { toast.error("Collaboration channels offline.") }
        }
        fetchLookups()
    }, [])

    const handleSubmit = async () => {
        if (!formData.vendorId || !formData.description || formData.cost <= 0) {
            toast.error("Complete mandatory manifest specifications.")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/Outsource/jobs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    vendorId: parseInt(formData.vendorId),
                    cost: parseFloat(formData.cost.toString())
                })
            })

            if (res.ok) {
                toast.success("Production manifest dispatched.")
                onRefresh()
                onBack()
            } else {
                toast.error("Collaborator rejected the manifest.")
            }
        } catch {
            toast.error("System communication flatlined.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto font-sans">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={onBack} className="h-10 w-10 rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 capitalize">Draft External Request</h2>
                        <p className="text-xs font-medium text-slate-400 mt-1">Register a new outsourced production order for external fulfillment.</p>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 bg-slate-50 uppercase tracking-widest px-2.5 h-6 rounded-sm">NEW ORDER</Badge>
                </div>
            </div>

            <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <div className="h-10 w-10 p-2 rounded-lg border bg-white flex items-center justify-center shadow-sm" style={{ color: 'var(--primary)', borderColor: 'var(--border)' }}>
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 leading-none uppercase tracking-wider">Production Manifest</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest leading-none">Complete detailed job & vendor specifications</p>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    {/* Section 01: Vendor & Status */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase border-l-2 border-indigo-500 pl-2">
                            Vendor & Core Parameters
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Select Printer/Vendor <span className="text-rose-500">*</span></Label>
                                <SearchableSelect
                                    options={vendors}
                                    placeholder="Select collaborator..."
                                    onValueChange={(v: string) => setFormData({...formData, vendorId: v})}
                                    className="h-9 rounded-md border-slate-200 shadow-none text-xs font-medium bg-white"
                                />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Job Identifier <span className="text-rose-500">*</span></Label>
                                <Input 
                                    placeholder="e.g. 1000 Premium Cards" 
                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                    value={formData.description}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Operational Status</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'Pending', label: 'Pending' },
                                        { value: 'In-Progress', label: 'In-Progress' },
                                        { value: 'Completed', label: 'Completed' }
                                    ]}
                                    value={formData.status}
                                    onValueChange={(v: string) => setFormData({...formData, status: v})}
                                    className="h-9 rounded-md border-slate-200 shadow-none text-xs font-medium bg-white"
                                />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Budget Amount (₹) <span className="text-rose-500">*</span></Label>
                                <Input 
                                    type="number"
                                    placeholder="0.00" 
                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm font-black px-3 bg-white" 
                                    value={formData.cost}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 02: Deadlines */}
                    <div className="space-y-5">
                         <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase border-l-2 border-amber-500 pl-2">
                             Temporal Constraints
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Due Date</Label>
                                <Input 
                                    type="date"
                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                    value={formData.dueDate}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, dueDate: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Manifest Date <span className="text-rose-500">*</span></Label>
                                <Input type="datetime-local" className="h-9 rounded-md border-slate-200 shadow-none text-xs font-bold font-sans px-3 bg-white" defaultValue={new Date().toISOString().slice(0,16)} />
                            </div>
                        </div>
                    </div>

                    {/* Section 02: Specs & PO Type */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase border-l-2 border-emerald-500 pl-2">
                            Job Specifications
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase border-l-2 border-indigo-300 pl-2">
                                Job Classification
                            </div>
                            <RadioGroup defaultValue="Offset" className="grid grid-cols-3 gap-4">
                                {["Flex", "Offset", "Digital"].map((type) => (
                                    <div key={type} className="relative">
                                        <RadioGroupItem value={type} id={type} className="peer sr-only" />
                                        <Label htmlFor={type} className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 hover:text-slate-600 peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:text-indigo-600 cursor-pointer transition-all">
                                            <span className="text-xs font-bold uppercase tracking-widest">{type}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Dimension (Inches)</Label>
                                <div className="relative">
                                    <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                                    <Input className="h-9 pl-9 rounded-md border-slate-200 shadow-none text-sm font-medium bg-white" placeholder="e.g. 10 × 12" />
                                </div>
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Order Quantity</Label>
                                <div className="relative">
                                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                                    <Input className="h-9 pl-9 rounded-md border-slate-200 shadow-none text-sm font-medium bg-white" placeholder="Total Units" />
                                </div>
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Production Side</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'single', label: 'Single Sided' },
                                        { value: 'double', label: 'Double Sided' }
                                    ]}
                                    placeholder="Select mapping..."
                                    onValueChange={() => {}}
                                    className="h-9 rounded-md border-slate-200 shadow-none text-xs font-medium bg-white"
                                />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Target Equipment</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'sm74', label: 'Heidelberg SM 74' },
                                        { value: 'km', label: 'Konica Minolta' }
                                    ]}
                                    placeholder="Select machine..."
                                    onValueChange={() => {}}
                                    className="h-9 rounded-md border-slate-200 shadow-none text-xs font-medium bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 03: Paper Details */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase border-l-2 border-indigo-300 pl-2">
                            Substrate & Media Specs
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Sheet Size (In)</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="18 × 23" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Media Quantity</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="Sheets / Rolls" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Material Grade</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="e.g. Art Card" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Media Weight (GSM)</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="e.g. 300" />
                            </div>
                        </div>
                    </div>

                    {/* Section 04: CTP Details */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase border-l-2 border-violet-500 pl-2">
                            CTP / Plate Telemetry
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Plate Methodology</Label>
                                <SearchableSelect
                                    options={[
                                        { value: 'ctp', label: 'CTP' },
                                        { value: 'ctcp', label: 'CTCP' }
                                    ]}
                                    value="ctp"
                                    onValueChange={() => {}}
                                    className="h-9 rounded-md border-slate-200 shadow-none text-xs font-medium bg-white"
                                />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Platemaking Vendor</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="Select Vendor..." />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Plate Dimension (In)</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="e.g. 19 × 25" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Total Forms / Sets</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-black px-3 bg-white" placeholder="0" />
                            </div>
                        </div>
                    </div>

                    {/* Section 05: Extra Production Details */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase border-l-2 border-rose-500 pl-2">
                            Finishing & Post-Production
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Gripper Allowance</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="Margin Info..." />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">LPI / Screen Frequency</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="e.g. 175" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Expected Impression Run</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-black px-3 bg-white" placeholder="Total Impressions" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Digital Proofing Request</Label>
                                <div className="h-9 flex items-center gap-6 px-1">
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox id="proof-yes" className="h-4 w-4 border-slate-200 data-[state=checked]:bg-indigo-500" />
                                        <Label htmlFor="proof-yes" className="text-xs font-bold text-slate-600 cursor-pointer">YES</Label>
                                    </div>
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox id="proof-no" defaultChecked className="h-4 w-4 border-slate-200 data-[state=checked]:bg-slate-500" />
                                        <Label htmlFor="proof-no" className="text-xs font-bold text-slate-600 cursor-pointer">NO</Label>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Color Signature</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-black px-3 bg-white" placeholder="e.g. 4+0 CMYK" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Sequence Numbering</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="Serial range..." />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Varnish / Coating</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="Matte/Gloss/UV..." />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <Label className="text-xs font-medium text-slate-600 leading-none">Post-Print Binding</Label>
                                <Input className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" placeholder="Specify Method..." />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2 font-sans">
                            <Label className="text-xs font-medium text-slate-600 leading-none">Strategic Production Notes</Label>
                            <Textarea className="min-h-[80px] rounded-xl border-slate-200 bg-slate-50/10 p-3 resize-none text-sm font-medium shadow-none focus:bg-white transition-all" placeholder="Any additional sequences or quality benchmarks..." />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                    <Button variant="ghost" onClick={onBack} className="h-9 px-6 rounded-md text-xs font-bold text-slate-500 hover:bg-slate-100 uppercase tracking-wider font-sans">Discard Draft</Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="h-9 px-10 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 font-sans" 
                        style={{ background: 'var(--primary)' }}
                    >
                        {isLoading ? "Dispatching..." : "Save Manifest & Dispatch"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function OutsourceJobsPage() {
    const [view, setView] = useState<"list" | "new">("list")
    const [orders, setOrders] = useState<OutsourceOrder[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/Outsource/jobs`)
            if (res.ok) setOrders(await res.json())
            else toast.error("Operational ledger sync failed.")
        } catch { toast.error("System communication failure.") }
        finally { setIsLoading(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const orderColumns: ColumnDef<OutsourceOrder>[] = React.useMemo(() => [
        {
            key: "jobName",
            label: "Production Order",
            render: (val: string, row: OutsourceOrder) => (
                <div className="flex flex-col font-sans">
                    <span className="text-sm font-bold tracking-tight text-slate-900">{val}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">#{row.id} • {new Date(row.createdAt).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            key: "vendorName",
            label: "Collaborator",
            render: (val: string) => <span className="text-sm font-bold text-slate-700 font-sans tracking-tight">{val}</span>
        },
        {
            key: "poType",
            label: "Class",
            render: (val: string) => (
                <Badge variant="outline" className="bg-slate-50 border-slate-200 font-bold text-[10px] uppercase tracking-wider px-2 h-5 rounded-sm font-sans">
                    {val} Request
                </Badge>
            )
        },
        {
            key: "status",
            label: "Lifecycle",
            render: (val: string) => (
                <Badge variant="outline" className={`font-bold uppercase tracking-widest px-2.5 h-6 rounded-sm font-sans ${
                    val === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        val === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`} style={{ fontSize: '10px' }}>
                    {val}
                </Badge>
            )
        },
        {
            key: "amount",
            label: "Exposure (₹)",
            render: (val: number) => <span className="font-sans font-black text-sm text-slate-900">₹{val?.toLocaleString()}</span>
        },
        {
            key: "actions",
            label: "Health",
            className: "text-right",
            filterable: false,
            render: () => (
                <div className="flex justify-end pr-2 font-sans">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-indigo-600 hover:bg-slate-50">
                        <History className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ], [])

    if (view === "new") {
        return <NewOrderView onBack={() => setView("list")} onRefresh={fetchData} />
    }

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 capitalize">External Operations</h1>
                    <p className="text-xs font-medium text-slate-400 mt-1">Monitor and manifest outsourced production jobs.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchData} className={cn("h-9 w-9 p-0 rounded-lg border-slate-200", isLoading && "animate-spin")}>
                        <RefreshCcw className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button
                        className="h-9 px-6 text-white font-bold text-xs rounded-lg gap-2 shadow-sm transition-all active:scale-95"
                        style={{ background: 'var(--primary)' }}
                        onClick={() => setView("new")}
                    >
                        <Plus className="h-4 w-4" /> New Outsource Order
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                <DataGrid
                    data={orders}
                    columns={orderColumns}
                    isLoading={isLoading}
                    enableDateRange={true}
                    dateFilterKey="createdAt"
                    searchPlaceholder="Search jobs, vendors or orders..."
                    hideTitle={true}
                    toolbarClassName="px-5 py-3 border-b"
                />
            </div>
        </div>
    )
}
