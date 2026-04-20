"use client"

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect, useCallback } from "react"
import {
    Save, ArrowLeft, PackageMinus, Search, Hash, FileText
} from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export default function ItemConsumptionPage() {
    const router = useRouter()
    
    const [jobs, setJobs] = useState<any[]>([])
    const [inventory, setInventory] = useState<any[]>([])
    
    const [selectedJob, setSelectedJob] = useState("")
    const [selectedItem, setSelectedItem] = useState("")
    const [quantity, setQuantity] = useState("")
    const [remarks, setRemarks] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            // Fetch Jobs
            const resJobs = await fetch(`${API_BASE}/api/JobCards?page=1&size=1000`)
            if (resJobs.ok) {
                const data = await resJobs.json()
                setJobs(data.data || data.items || (Array.isArray(data) ? data : []))
            }
            
            // Fetch Inventory
            const resInv = await fetch(`${API_BASE}/api/inventory`)
            if (resInv.ok) {
                const data = await resInv.json()
                setInventory(data)
            }

            // Fetch History
            const resHist = await fetch(`${API_BASE}/api/inventory/history`)
            if (resHist.ok) {
                const data = await resHist.json()
                const consumptions = data.filter((h: any) => h.type === 'OUT' || h.type === 'Outward')
                setHistory(consumptions.map((h: any) => ({
                    id: h.id.toString(),
                    material: h.inventoryItemName || `Item #${h.inventoryItemId}`, 
                    quantity: h.quantity,
                    ref: h.referenceType === 'JobCard' ? `JB-${h.referenceId}` : (h.referenceType || 'Manual'),
                    date: new Date(h.transactionDate).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    remarks: h.remarks
                })))
            }
        } catch (error) {
            toast.error("Failed to load data for consumption form.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const jobOptions = jobs.map(j => ({
        value: j.id.toString(),
        label: `${j.jobNumber} - ${j.customerName}`
    }))

    const inventoryOptions = inventory.map(i => ({
        value: i.id.toString(),
        label: `${i.name} (Stock: ${i.currentStock} ${i.unit})`
    }))

    const columns: ColumnDef<any>[] = [
        { key: "material", label: "Material Used", render: (val) => <span className="font-bold text-slate-800 text-sm">{val}</span> },
        { key: "quantity", label: "Qty Consumed", render: (val) => <span className="font-black text-rose-600 text-sm">-{val}</span> },
        { key: "ref", label: "Job Reference", render: (val) => <span className="font-bold text-indigo-600 uppercase tracking-widest text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{val}</span> },
        { key: "date", label: "Date & Time", render: (val) => <span className="text-xs font-medium text-slate-500">{val}</span> },
        { key: "remarks", label: "Remarks", render: (val) => <span className="text-[11px] text-slate-400 italic line-clamp-1">{val || "-"}</span> }
    ]

    const handleSubmit = async () => {
        if (!selectedJob) return toast.error("Please select a Job Card")
        if (!selectedItem) return toast.error("Please select an Inventory Item")
        if (!quantity || parseFloat(quantity) <= 0) return toast.error("Please enter a valid quantity")

        setIsSubmitting(true)
        try {
            // API call: POST /api/Inventory/{itemId}/stock?quantity={qty}&type=OUT&refType=JobCard&refId={jobId}
            const url = new URL(`${API_BASE}/api/Inventory/${selectedItem}/stock`)
            url.searchParams.append("quantity", quantity)
            url.searchParams.append("type", "OUT")
            url.searchParams.append("refType", "JobCard")
            url.searchParams.append("refId", selectedJob)
            // Can pass remarks if API allows, but default API uses it for manual entries or just doesn't take remarks easily via query unless modified. 
            // We'll just pass the standard query params.

            const res = await fetch(url.toString(), {
                method: "POST"
            })

            if (res.ok || res.status === 204) {
                toast.success("Consumption Recorded Successfully", {
                    description: "Stock has been deducted and linked to the job card."
                })
                // Reset form
                setSelectedJob("")
                setSelectedItem("")
                setQuantity("")
                setRemarks("")
                // Refresh inventory stocks
                fetchData()
            } else {
                const err = await res.text()
                toast.error(err || "Failed to record consumption.")
            }
        } catch (error) {
            toast.error("Network error while recording consumption.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">Item Consumption</h1>
                </div>
            </div>

            <Tabs defaultValue="consumption" className="w-full">
                <TabsList className="mb-4 bg-slate-100/50 p-1 rounded-xl">
                    <TabsTrigger value="consumption" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Log Consumption</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
                </TabsList>

                <TabsContent value="consumption" className="mt-0 outline-none">
                    <Card className="max-w-2xl border-none shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-100 bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600">
                            <PackageMinus className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-slate-800">Log Consumption</CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-500 mt-0.5">Deduct inventory stock against a specific job card</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Target Job Card</Label>
                            <SearchableSelect
                                options={jobOptions}
                                value={selectedJob}
                                onValueChange={setSelectedJob}
                                placeholder="Search & Select Job Card..."
                                className="h-10 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Material Used</Label>
                                <SearchableSelect
                                    options={inventoryOptions}
                                    value={selectedItem}
                                    onValueChange={setSelectedItem}
                                    placeholder="Select Paper / Material..."
                                    className="h-10 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Quantity Consumed</Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input 
                                        type="number"
                                        placeholder="e.g. 500"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="h-10 pl-9 rounded-xl border-slate-200 font-bold"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                        Sheets/Units
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Additional Notes (Optional)</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <textarea 
                                    className="w-full min-h-[80px] pl-9 p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                                    placeholder="Enter any remarks, cutting details, or wastage info..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <Button variant="ghost" onClick={() => router.back()} className="rounded-lg font-bold text-slate-500">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-white rounded-lg font-bold px-6 h-10 gap-2 shadow-sm"
                        >
                            {isSubmitting ? (
                                "Recording..."
                            ) : (
                                <>
                                    <Save className="h-4 w-4" /> Record Consumption
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-0 outline-none">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-sm font-bold text-slate-800">Consumption History</h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Track recent material deductions across all jobs</p>
                </div>
                <DataGrid
                    columns={columns}
                    data={history}
                    isLoading={isLoading}
                    searchPlaceholder="Search materials or job references..."
                />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
