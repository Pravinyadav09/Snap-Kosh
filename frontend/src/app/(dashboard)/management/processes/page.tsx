"use client"

export const dynamic = 'force-dynamic'

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import { Plus, Cog, Layers, CreditCard, FileText, RefreshCcw, Trash2, Edit2, ChevronsUpDown, Hash, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { DropdownRegistrySelect } from "@/components/shared/dropdown-registry-select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { toast } from "sonner"
import { MasterAutocomplete } from "@/components/shared/master-autocomplete"

const API = `${API_BASE}/api/processes`


export default function ProcessMastersPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [processes, setProcesses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedProcess, setSelectedProcess] = useState<any | null>(null)

    // Form state
    const [itemCode, setItemCode] = useState("")
    const [name, setName] = useState("")
    const [productName, setProductName] = useState("")
    const [category, setCategory] = useState("")
    const [gsm, setGsm] = useState("")
    const [size, setSize] = useState("")
    const [unitStr, setUnitStr] = useState("")
    const [notes, setNotes] = useState("")


    const [priceSlabs, setPriceSlabs] = useState<{ from: number; to: number; price: number }[]>([])
    const [isSaving, setIsSaving] = useState(false)




    const fetchProcesses = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(API)
            if (res.ok) setProcesses(await res.json())
            else toast.error("Failed to load process masters")
        } catch {
            toast.error("Network error while loading processes")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchProcesses() }, [])

    const openDialog = async (process?: any) => {
        if (process) {
            setSelectedProcess(process)
            setItemCode(process.itemCode || "")
            setName(process.name || "")
            setProductName(process.productName || "")
            setCategory(process.type || "")
            setGsm(process.gsm || "")
            setSize(process.size || "")

            setUnitStr(process.unit || "")
            setNotes(process.description || "")
            try {
                setPriceSlabs(typeof process.priceSlabsJson === 'string' ? JSON.parse(process.priceSlabsJson) : (Array.isArray(process.priceSlabsJson) ? process.priceSlabsJson : []))
            } catch {
                setPriceSlabs([])
            }
        } else {
            setSelectedProcess(null)
            setName(""); setProductName(""); setCategory(""); setGsm(""); setSize(""); setUnitStr(""); setNotes("")
            setPriceSlabs([])

            
            // Auto generation of Item Code
            try {
                const [prefRes, seqRes] = await Promise.all([
                    fetch(`${API_BASE}/api/settings/process_code_prefix`),
                    fetch(`${API_BASE}/api/settings/process_code_sequence`)
                ])
                const prefix = prefRes.ok ? (await prefRes.json()).value : "OP"
                const seq = seqRes.ok ? (await seqRes.json()).value : "1001"
                setItemCode(`${prefix}${seq}`)
            } catch { setItemCode("OP-NEW") }
        }
        setIsDialogOpen(true)
    }


    const handleSave = async () => {
        if (!name) { toast.error("Process name is required"); return }
        setIsSaving(true)
        const payload = {
            id: selectedProcess?.id || 0,
            Id: selectedProcess?.id || 0,
            itemCode: itemCode,
            ItemCode: itemCode,
            name: name,
            Name: name,
            productName: productName,
            ProductName: productName,
            type: category,
            Type: category,
            gsm: gsm,
            GSM: gsm,
            size: size,
            Size: size,
            unit: unitStr || "0.00",
            Unit: unitStr || "0.00",
            description: notes || "",
            Description: notes || "",
            priceSlabsJson: JSON.stringify(priceSlabs),
            PriceSlabsJson: JSON.stringify(priceSlabs),
            isActive: true,
            IsActive: true
        }
        try {
            const method = selectedProcess ? "PUT" : "POST"
            const url = selectedProcess ? `${API}/${selectedProcess.id}` : API
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                // Update sequence if it was a new record
                if (!selectedProcess) {
                    const nextSeq = parseInt(itemCode.replace(/^\D+/, '')) + 1
                    await fetch(`${API_BASE}/api/settings`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ key: "process_code_sequence", value: nextSeq.toString() })
                    })
                }
                toast.success(selectedProcess ? "Process updated" : "Process created")
                setIsDialogOpen(false)
                fetchProcesses()
            } else {

                const errData = await res.json()
                toast.error("Operation Denied", { description: errData.message || "Failed to save process master record." })
            }
        } catch {
            toast.error("Network communication failure")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this process master? This action is permanent.")) return
        try {
            const res = await fetch(`${API}/${id}`, { method: "DELETE" })
            if (res.ok) { toast.success("Process deleted"); fetchProcesses() }
            else toast.error("Failed to delete process")
        } catch { toast.error("Network error") }
    }

    const columns: ColumnDef<any>[] = React.useMemo(() => [
        {
            key: "itemCode",
            label: "Operation Code",
            render: (val, row: any) => <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-600 border-slate-200 px-1.5 h-5 rounded-md">{val || row.ItemCode || row.itemcode || "OP-NONE"}</Badge>
        },
        {
            key: "name",
            label: "Operation",
            render: (val, row: any) => <span className="text-sm font-bold tracking-tight text-slate-900 uppercase">{(val || row.Name || row.name || "—").toUpperCase()}</span>
        },
        {
            key: "type",
            label: "Paper Category",
            render: (val, row: any) => <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{val || row.Type || row.type || row.category || "—"}</span>
        },
        {
            key: "productName",
            label: "Product Name",
            render: (val, row: any) => <span className="text-xs font-medium text-slate-600 uppercase">{val || row.ProductName || row.productname || "—"}</span>
        },
        {
            key: "gsm",
            label: "GSM",
            render: (val, row: any) => {
                const gsmVal = val || row.GSM || row.gsm;
                return <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 font-bold text-[10px] px-1.5 h-5 rounded-md">{gsmVal ? `${gsmVal} GSM` : "—"}</Badge>
            }
        },
        {
            key: "size",
            label: "Size",
            render: (val, row: any) => <span className="text-[11px] font-bold text-slate-600 italic">{val || row.Size || row.size || "—"}</span>
        },
        {
            key: "priceSlabsJson",
            label: "Volume Pricing Matrix",
            initialWidth: 350,
            render: (val, row: any) => {
                const slabsJson = val || row.PriceSlabsJson;
                let slabs = [];
                try {
                    slabs = typeof slabsJson === 'string' ? JSON.parse(slabsJson) : (Array.isArray(slabsJson) ? slabsJson : []);
                } catch (e) {
                    slabs = [];
                }
                if (slabs.length === 0) return <span className="text-[10px] text-slate-400 italic font-medium">No tiers defined</span>
                return (
                    <div className="flex flex-wrap gap-x-2 gap-y-1.5 max-w-[450px] py-1">
                        {slabs.map((s: any, i: number) => (
                            <div key={i} className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs hover:border-amber-400 transition-colors group/slab">
                                <div className="bg-amber-50 px-2 py-0.5 border-r border-slate-200 text-[9px] font-black text-amber-500 uppercase tracking-tighter">
                                    {s.from}-{s.to === 99999 ? '∞' : s.to}
                                </div>
                                <div className="px-2 py-0.5 text-[10px] font-black text-amber-600 bg-amber-50/10 group-hover/slab:bg-amber-50/30 transition-colors">
                                    ₹{Number(s.price).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        },

        {
            key: "id",
            label: "Actions",
            className: "text-right w-[100px]",
            filterable: false,
            render: (_, row) => (
                <div className="flex justify-end gap-1.5 pr-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md bg-white shadow-none hover:scale-105"
                        style={{ color: 'var(--primary)', borderColor: 'color-mix(in srgb, var(--primary), white 70%)' }}
                        onClick={() => openDialog(row)}>
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 shadow-none hover:scale-105"
                        onClick={() => handleDelete(row.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ], [])

    return (
        <div className="space-y-1 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2 mb-2 px-4 sm:px-1 uppercase">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-100">
                        <Cog className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-slate-900 leading-none">Process Masters</h1>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="h-9 w-9 p-0 rounded-lg shadow-sm" onClick={fetchProcesses}>
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-6 text-white font-bold text-xs rounded-lg gap-2 shadow-sm" style={{ background: "var(--primary)" }}
                                onClick={() => openDialog()}>
                                <Plus className="h-4 w-4" /> Define Process
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden font-sans border border-slate-200 shadow-xl rounded-xl bg-white flex flex-col max-h-[92vh]">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 p-2 rounded-lg border bg-slate-50 flex items-center justify-center shadow-sm" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        <Cog className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold text-slate-800 leading-none">
                                            {selectedProcess ? "Edit Process Master" : "Define New Process"}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-slate-500 mt-1.5 font-sans leading-relaxed">
                                            Configure technical metrics and automated pricing for production operations.
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <Layers className="h-3 w-3" /> Technical Specifications
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none uppercase tracking-tighter italic">Operation Name <span className="text-rose-500">*</span></Label>
                                            <MasterAutocomplete 
                                                category="OperationName"
                                                value={name}
                                                onChange={setName}
                                                placeholder="e.g. Printing / UV"
                                            />
                                        </div>
                                        <div className="space-y-1.5 relative">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none uppercase tracking-tighter">Operation Code</Label>
                                            <div className="relative group">
                                                <Input 
                                                    className="h-9 rounded-md border-slate-200 shadow-none text-sm font-bold px-3 pl-9 bg-slate-50/50 focus:bg-white transition-all uppercase" 
                                                    value={itemCode}
                                                    onChange={(e) => setItemCode(e.target.value.toUpperCase())}
                                                />
                                                <Hash className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none uppercase tracking-tighter italic">Category <span className="text-rose-500">*</span></Label>
                                            <MasterAutocomplete 
                                                category="PaperCategory"
                                                value={category}
                                                onChange={setCategory}
                                                placeholder="e.g. Art Paper"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none uppercase tracking-tighter">Product Name <span className="text-rose-500">*</span></Label>
                                            <MasterAutocomplete 
                                                category="PaperProductName"
                                                value={productName}
                                                onChange={setProductName}
                                                placeholder="e.g. Singleside"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none uppercase tracking-tighter">GSM Weight</Label>
                                            <Input 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder="170"
                                                value={gsm}
                                                onChange={(e) => setGsm(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600 font-sans leading-none uppercase tracking-tighter">Standard Size</Label>
                                            <Input 
                                                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white" 
                                                placeholder='12 x 18"'
                                                value={size}
                                                onChange={(e) => setSize(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between font-sans font-bold text-[10px] tracking-widest text-slate-400 uppercase">
                                        <div className="flex items-center gap-2 tracking-widest"><CreditCard className="h-3 w-3" /> Custom Pricing Slabs</div>
                                        <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] font-bold border-dashed border-slate-300 hover:border-primary hover:text-primary transition-all rounded-md bg-white gap-2" 
                                            onClick={() => setPriceSlabs([...priceSlabs, { from: 1, to: 10, price: 0 }])}>
                                            <Plus className="h-3 w-3" /> Add New Slab
                                        </Button>
                                    </div>
                                    <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                        <table className="w-full text-xs font-sans">
                                            <thead>
                                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                                    <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-tighter">From Qty</th>
                                                    <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-tighter">To Qty</th>
                                                    <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-tighter">Rate (₹)</th>
                                                    <th className="w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {priceSlabs.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-medium italic"> No specific pricing slabs defined. Using default rate.</td>
                                                    </tr>
                                                ) : (
                                                    priceSlabs.map((slab, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-2 py-1.5"><Input type="number" value={slab.from === 0 ? "" : slab.from} onChange={e => { const newSlabs = [...priceSlabs]; newSlabs[idx].from = Number(e.target.value); setPriceSlabs(newSlabs); }} className="h-8 border-none bg-transparent shadow-none font-black text-slate-700" /></td>
                                                            <td className="px-2 py-1.5"><Input type="number" value={slab.to === 0 ? "" : slab.to} onChange={e => { const newSlabs = [...priceSlabs]; newSlabs[idx].to = Number(e.target.value); setPriceSlabs(newSlabs); }} className="h-8 border-none bg-transparent shadow-none font-black text-slate-700" /></td>
                                                            <td className="px-2 py-1.5"><Input type="number" value={slab.price === 0 ? "" : slab.price} onChange={e => { const newSlabs = [...priceSlabs]; newSlabs[idx].price = Number(e.target.value); setPriceSlabs(newSlabs); }} className="h-8 border-none bg-transparent shadow-none font-black text-primary text-sm" /></td>
                                                            <td className="pr-2 py-1.5 text-right"><Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md" onClick={() => setPriceSlabs(priceSlabs.filter((_, i) => i !== idx))}><Trash2 className="h-3 w-3" /></Button></td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}
                                    className="h-9 px-4 rounded-md text-xs font-bold text-slate-500 hover:bg-slate-100 font-sans uppercase tracking-wider">
                                    Discard
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}
                                    className="h-9 px-8 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 font-sans"
                                    style={{ background: "var(--primary)" }}>
                                    {isSaving ? "Saving..." : (selectedProcess ? "Update Process" : "Save Master Record")}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                <DataGrid data={processes} columns={columns} isLoading={isLoading} hideTitle={true} searchPlaceholder="Search processes by name or category..." />
            </div>
        </div>
    )
}
