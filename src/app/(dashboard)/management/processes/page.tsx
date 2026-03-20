"use client"

import React, { useState, useMemo } from "react"
import {
    Plus, Trash2, Edit,
    Download, Cog, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/shared/searchable-select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

// ─── Types ──────────────────────────────────────────────────────────────────
type ProcessMaster = {
    id: string
    name: string
    type: string
    rateConfig: string
    rate: number
    setupFee: number
    minPrice: number
    status: "Active" | "Inactive"
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialProcesses: ProcessMaster[] = [
    { id: "P-001", name: "Center Stitching", type: "Binding", rateConfig: "₹2.00 / Per Book", rate: 2, setupFee: 0, minPrice: 0, status: "Active" },
    { id: "P-002", name: "Creasing", type: "Finishing", rateConfig: "₹0.50 / Per Sheet", rate: 0.5, setupFee: 0, minPrice: 0, status: "Active" },
    { id: "P-003", name: "Gloss Lamination", type: "Lamination", rateConfig: "₹2.50 / Per Sq Ft", rate: 2.5, setupFee: 0, minPrice: 0, status: "Active" },
    { id: "P-004", name: "Matt Lamination", type: "Lamination", rateConfig: "₹3.00 / Per Sq Ft", rate: 3, setupFee: 0, minPrice: 0, status: "Active" },
    { id: "P-005", name: "Perfect Binding", type: "Binding", rateConfig: "₹10.00 / Per Book", rate: 10, setupFee: 0, minPrice: 0, status: "Active" },
]

// ─── Process Form Dialog ────────────────────────────────────────────────────
function ProcessFormDialog({
    process,
    onClose
}: {
    process?: ProcessMaster,
    onClose: () => void
}) {
    return (
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 border-none shadow-xl rounded-md bg-white font-sans overflow-hidden uppercase">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white italic font-sans uppercase">
                <DialogTitle className="text-lg font-black text-slate-800 tracking-tight leading-none italic">
                    {process ? "Revise Process" : "Register Process"}
                </DialogTitle>
                <DialogDescription className="sr-only">Process Configuration Form</DialogDescription>
            </div>

            <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[75vh]">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Process Name <span className="text-rose-500">*</span></Label>
                        <Input
                            className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                            defaultValue={process?.name}
                            placeholder="e.g. Thermal Gloss Lamination"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Process Type <span className="text-rose-500">*</span></Label>
                        <SearchableSelect
                            options={[
                                { value: 'binding', label: 'Binding' },
                                { value: 'finishing', label: 'Finishing' },
                                { value: 'lamination', label: 'Lamination' },
                                { value: 'printing', label: 'Printing' },
                                { value: 'others', label: 'Others' }
                            ]}
                            value={process?.type || "lamination"}
                            onValueChange={(val) => console.log(val)}
                            placeholder="Select Type"
                            className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Calculation Type <span className="text-rose-500">*</span></Label>
                            <SearchableSelect
                                options={[
                                    { value: 'per_sheet', label: 'Per Sheet' },
                                    { value: 'per_sqft', label: 'Per Sq Ft' },
                                    { value: 'per_book', label: 'Per Book' },
                                    { value: 'fixed', label: 'Fixed Price' }
                                ]}
                                value="per_sheet"
                                onValueChange={(val) => console.log(val)}
                                placeholder="Select Logic"
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Setup Fee (₹)</Label>
                            <Input
                                type="number"
                                className="h-10 border-slate-200 bg-white font-medium text-slate-800 text-sm"
                                defaultValue={process?.setupFee || 0}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-md bg-cyan-50/50 border border-cyan-100/50 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-teal-700 tracking-tight">Rate (₹) <span className="text-rose-500">*</span></span>
                                <Info className="h-3 w-3 text-teal-600/30" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-teal-800">₹</span>
                                <Input
                                    type="number"
                                    className="h-8 border-none bg-transparent p-0 text-xl font-bold text-teal-800 focus-visible:ring-0"
                                    defaultValue={process?.rate || 0.00}
                                />
                            </div>
                            <p className="text-[10px] text-teal-600/70 font-medium">Base rate or default rate per unit</p>
                        </div>

                        <div className="p-5 rounded-md bg-slate-50 border border-slate-100 space-y-2">
                            <span className="text-xs font-semibold text-slate-600 tracking-tight">Min. Price (₹)</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-slate-700">₹</span>
                                <Input
                                    type="number"
                                    className="h-8 border-none bg-transparent p-0 text-xl font-bold text-slate-700 focus-visible:ring-0"
                                    defaultValue={process?.minPrice || 0.00}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Minimum amount to charge for job</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Internal Notes (Optional)</Label>
                        <Textarea
                            className="min-h-[80px] text-sm border-slate-200 resize-none font-medium text-slate-600"
                            placeholder="Add any specific instructions for production teams..."
                        />
                    </div>
                </div>
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
                    {process ? "Update Definition" : "Save process"}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProcessMastersPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProcess, setEditingProcess] = useState<ProcessMaster | undefined>(undefined)
    const [processes] = useState<ProcessMaster[]>(initialProcesses)

    const handleAdd = () => {
        setEditingProcess(undefined)
        setIsDialogOpen(true)
    }

    const handleEdit = (p: ProcessMaster) => {
        setEditingProcess(p)
        setIsDialogOpen(true)
    }

    const columns: ColumnDef<ProcessMaster>[] = useMemo(() => [
        {
            key: "name",
            label: "Process Name",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center border transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 90%)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }}>
                        <Cog className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="font-bold text-slate-800">{val as string}</span>
                </div>
            )
        },
        {
            key: "type",
            label: "Category",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => (
                <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-none text-[10px] font-black uppercase tracking-widest px-2">
                    {val as string}
                </Badge>
            )
        },
        {
            key: "rateConfig",
            label: "Rate Configuration",
            className: "hidden md:table-cell",
            headerClassName: "hidden md:table-cell",
            render: (val) => <span className="font-black text-sm text-slate-900 tracking-tight">{val as string}</span>
        },
        {
            key: "status",
            label: "Status",
            className: "hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: (val) => (
                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none text-[10px] font-black uppercase tracking-widest px-2">
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
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md bg-white transition-all shadow-none" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }} title="Edit Process" onClick={() => handleEdit(item as ProcessMaster)}>
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Delete Process">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ], [])

    return (
        <div className="space-y-6 text-left bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100 italic uppercase">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 font-sans italic uppercase">
                <div className="space-y-0.5">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Process Library</h1>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }} onClick={handleAdd}>
                                <Plus className="h-4 w-4" /> <span className="sm:inline">New Process</span>
                            </Button>
                        </DialogTrigger>
                        <ProcessFormDialog
                            process={editingProcess}
                            onClose={() => setIsDialogOpen(false)}
                        />
                    </Dialog>
                </div>
            </div>

            <DataGrid
                data={processes}
                columns={columns}
                searchPlaceholder="Search processes or categories..."
            />
        </div>
    )
}
