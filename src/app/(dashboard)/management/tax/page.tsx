"use client"

import React, { useState } from "react"
import {
    Plus, Percent, Trash2, Edit,
    ShieldCheck, Scale, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

// ─── Types ──────────────────────────────────────────────────────────────────
type TaxSlab = {
    id: string
    name: string
    rate: number
    cgst: number
    sgst: number
    igst: number
    status: "Active" | "Inactive"
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialTaxSlabs: TaxSlab[] = [
    { id: "TAX-18", name: "Standard GST (18%)", rate: 18, cgst: 9, sgst: 9, igst: 18, status: "Active" },
    { id: "TAX-12", name: "Reduced GST (12%)", rate: 12, cgst: 6, sgst: 6, igst: 12, status: "Active" },
    { id: "TAX-05", name: "Essential GST (5%)", rate: 5, cgst: 2.5, sgst: 2.5, igst: 5, status: "Active" },
    { id: "TAX-28", name: "Luxury GST (28%)", rate: 28, cgst: 14, sgst: 14, igst: 28, status: "Active" },
    { id: "TAX-00", name: "Exempted (0%)", rate: 0, cgst: 0, sgst: 0, igst: 0, status: "Active" },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TaxSlabsPage() {
    const [slabs] = useState<TaxSlab[]>(initialTaxSlabs)
    const [isAddSlabOpen, setIsAddSlabOpen] = useState(false)

    const columns: ColumnDef<TaxSlab>[] = [
        {
            key: "name",
            label: "Tax Definition",
            render: (val, row) => (
                <div className="py-1">
                    <p className="font-bold text-slate-800">{val}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.id}</p>
                </div>
            )
        },
        {
            key: "rate",
            label: "Total Rate",
            render: (val) => (
                <Badge className="font-black px-3 h-7 text-sm shadow-sm transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 90%)', color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 80%)' }}>
                    {val}%
                </Badge>
            )
        },
        { key: "cgst", label: "CGST", render: (val) => <span className="text-xs font-black text-slate-500">{val}%</span> },
        { key: "sgst", label: "SGST", render: (val) => <span className="text-xs font-black text-slate-500">{val}%</span> },
        { key: "igst", label: "IGST", render: (val) => <span className="text-xs font-black text-slate-800">{val}%</span> },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 w-fit">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{val}</span>
                </div>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: () => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md bg-white transition-all shadow-none" style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }} title="Modify Tax Definition">
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Retire Tax Slab">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 font-heading">Tax Slabs</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure global GST compliance and tax structures</p>
                </div>
                <Dialog open={isAddSlabOpen} onOpenChange={setIsAddSlabOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-8 rounded-xl font-bold gap-2 shadow-lg transition-all text-white" style={{ background: 'var(--primary)' }}>
                            <Plus className="h-4 w-4" /> Add Tax Slab
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl flex flex-col max-h-[92vh]">
                        <DialogHeader className="px-10 pt-10 pb-6 text-left border-b">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 rounded-2xl shadow-sm border border-slate-100 transition-all" style={{ background: 'color-mix(in srgb, var(--primary), white 95%)', color: 'var(--primary)' }}>
                                    <Percent className="h-5 w-5" />
                                </div>
                                <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">Create Tax Definition</DialogTitle>
                            </div>
                            <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-1">
                                Configure GST structure for transactions
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-10 py-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                            {/* 01: Identification */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white" style={{ background: 'var(--primary)' }}>01</span>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tax Identity</h3>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Tax Name</Label>
                                    <Input
                                        placeholder="e.g. Standard GST (18%)"
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50 transition-all font-bold text-slate-700 px-4 focus-visible:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            {/* 02: Rate Configuration */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white" style={{ background: 'var(--primary)' }}>02</span>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rate Configuration</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Total Rate (%)</Label>
                                        <Input
                                            type="number"
                                            placeholder="18"
                                            className="h-12 rounded-xl border-none font-black text-slate-800 px-4 focus-visible:ring-indigo-500/20"
                                            style={{ background: 'color-mix(in srgb, var(--primary), white 95%)' }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">HSN Default</Label>
                                        <Input
                                            placeholder="4819"
                                            className="h-12 rounded-xl border-slate-100 bg-white font-medium text-slate-600 px-4 focus-visible:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 shadow-inner">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Auto-Calculation Preview</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">CGST</span>
                                            <span className="text-xs font-black text-slate-800">9%</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">SGST</span>
                                            <span className="text-xs font-black text-slate-800">9%</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl shadow-lg transition-all text-white" style={{ background: 'var(--primary)' }}>
                                            <span className="text-[9px] font-black text-indigo-200 uppercase">IGST</span>
                                            <span className="text-xs font-black text-white">18%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-8 mt-2 flex flex-row items-center justify-end gap-3 px-10 border-t bg-slate-50/50">
                            <Button
                                variant="ghost"
                                className="h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                onClick={() => setIsAddSlabOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="h-11 px-8 rounded-xl font-bold text-[10px] font-black uppercase tracking-widest shadow-lg transition-all text-white"
                                style={{ background: 'var(--primary)' }}
                                onClick={() => setIsAddSlabOpen(false)}
                            >
                                Save Tax Definition
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <DataGrid
                data={slabs}
                columns={columns}
                searchPlaceholder="Search tax slabs, HSN codes..."
            />

            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex items-start gap-4 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Scale className="h-24 w-24 text-white" />
                </div>
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/20">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="relative z-10">
                    <h4 className="font-black text-white text-sm uppercase tracking-widest">Compliance Notice</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium max-w-2xl">
                        These tax slabs are applied globally across all quotations, invoices, and purchase orders.
                        Changes made here will reflect in future transactions. Historical records will maintain the
                        rates at the time of creation for audit compliance.
                    </p>
                </div>
            </div>
        </div>
    )
}
