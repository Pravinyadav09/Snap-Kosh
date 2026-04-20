"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useCallback } from "react"
import {
    Plus, Search, Package, Layers, History,
    ArrowDownToLine, CheckCircle2, RefreshCcw,
    Boxes, Info, Filter, Calendar, Activity,
    ShieldCheck, TrendingUp, Truck, User
} from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
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
import { cn } from "@/lib/utils"
import { Can } from "@/components/shared/permission-context"

// ─── Types ──────────────────────────────────────────────────────────────────
type InventoryItem = {
    id: string
    name: string
    category: string
    currentStock: number
    unit: string
    minStockLevel: number
    lastActivity: string
    status: string
}

type TransactionLog = {
    id: string
    material: string
    quantity: number
    unit: string
    type: string
    ref: string
    date: string
    status: string
}

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState("status")
    const [items, setItems] = useState<InventoryItem[]>([])
    const [logs, setLogs] = useState<TransactionLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGRNOpen, setIsGRNOpen] = useState(false)
    const [inventoryLookup, setInventoryLookup] = useState<{value: string, label: string}[]>([])
    const [grnItemId, setGrnItemId] = useState("")
    const [selectedPO, setSelectedPO] = useState<any>(null)
    const [grnQty, setGrnQty] = useState<number>(0)
    const [grnVendor, setGrnVendor] = useState("")
    const [challanNo, setChallanNo] = useState("")
    const [challanDate, setChallanDate] = useState(new Date().toISOString().split('T')[0])
    const [vehicleNo, setVehicleNo] = useState("")
    const [receivedBy, setReceivedBy] = useState("admin")
    const [commonRemarks, setCommonRemarks] = useState("")
    const [pendings, setPendings] = useState<any[]>([])

    // ─── Data Fetching ───────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const invRes = await fetch(`${API_BASE}/api/inventory`)
            if (invRes.ok) {
                const data = await invRes.json()
                setItems(data.map((t: any) => ({
                    id: t.id.toString(),
                    name: t.name,
                    category: t.category,
                    currentStock: t.currentStock,
                    unit: t.unit,
                    minStockLevel: t.minStockLevel,
                    lastActivity: new Date(t.lastUpdated).toLocaleDateString(),
                    status: t.currentStock <= t.minStockLevel ? "Low Stock" : "Normal"
                })))
            }

            const histRes = await fetch(`${API_BASE}/api/inventory/history`)
            if (histRes.ok) {
                const histData = await histRes.json()
                setLogs(histData.map((h: any) => ({
                    id: h.id.toString(),
                    material: h.inventoryItemName || `Item #${h.inventoryItemId}`, 
                    quantity: h.quantity,
                    unit: "Units",
                    type: h.type,
                    ref: h.referenceType === 'JobCard' ? `JB-${h.referenceId}` : (h.referenceType || 'Manual'),
                    date: new Date(h.transactionDate).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    remarks: h.remarks,
                    status: "Completed"
                })))
            }

            const pRes = await fetch(`${API_BASE}/api/purchases`)
            if (pRes.ok) {
                const pData = await pRes.json()
                setPendings(pData.filter((p: any) => {
                    const s = (p.status || "").trim().toLowerCase();
                    return s === 'pending' || s === 'partial';
                }))
            }
        } catch (err) {
            toast.error("Cloud Sync Failed")
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleOpenPODialog = (po: any) => {
        setSelectedPO(po)
        setGrnItemId(po.inventoryItemId.toString())
        const remaining = po.quantity - (po.receivedQuantity || 0);
        setGrnQty(remaining >= 0 ? remaining : 0)
        setGrnVendor(po.supplierName || "")
        setChallanNo("")
        setChallanDate(new Date().toISOString().split('T')[0])
        setCommonRemarks("")
        setIsGRNOpen(true)
    }

    const handleAuthenticateGRN = async (id: number) => {
        try {
            const payload = {
                id: id,
                quantity: grnQty,
                challanNo,
                challanDate,
                vehicleNo,
                receivedBy,
                commonRemarks
            }
            const res = await fetch(`${API_BASE}/api/purchases/${id}/grn`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                toast.success("GRN Authenticated. Material inwarded to inventory.")
                setIsGRNOpen(false)
                setSelectedPO(null)
                fetchData()
            } else {
                toast.error("GRN Authorization Failed.")
            }
        } catch {
            toast.error("Network instability detected.")
        }
    }

    const handleManualCommit = async () => {
        if (!grnItemId || grnQty <= 0 || !challanNo) {
            toast.error("Incomplete Entry", { description: "Please select material, quantity and enter challan number." })
            return
        }

        try {
            // Since we unified lookup, grnItemId might have prefix. For now assuming simple ID or handling prefix.
            const idToUse = grnItemId.includes(':') ? grnItemId.split(':')[1] : grnItemId;
            
            const res = await fetch(`${API_BASE}/api/Inventory/${idToUse}/stock?quantity=${grnQty}&type=Inward&refType=ManualGRN&refId=0`, { 
                method: 'POST'
            })
            
            if (res.ok) {
                toast.success("Manual GRN Success", { description: "Stock inwarded to master register." })
                setIsGRNOpen(false)
                fetchData()
            } else {
                toast.error("Failed to commit stock transaction.")
            }
        } catch {
            toast.error("Sync error encountered.")
        }
    }

    const resetGRN = () => {
        setSelectedPO(null)
        setGrnItemId("")
        setGrnQty(0)
        setGrnVendor("")
        setChallanNo("")
        setVehicleNo("")
        setCommonRemarks("")
    }

    const pendingColumns: ColumnDef<any>[] = [
        { key: "purchaseNumber", label: "PO Number", render: (v: string) => <span className="font-black text-slate-800 tracking-tight">{v}</span> },
        { 
            key: "status", 
            label: "Status", 
            render: (v: string) => {
                const s = (v || "").trim();
                return (
                    <Badge className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md border-none",
                        s === "Partial" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                    )}>
                        {s}
                    </Badge>
                )
            }
        },
        { key: "supplierName", label: "Supplier", render: (v: string) => <span className="text-slate-600 font-medium">{v}</span> },
        { key: "itemName", label: "Material", render: (v: string) => <span className="text-slate-600 font-medium">{v}</span> },
        { 
            key: "quantity", 
            label: "Qid Progress", 
            render: (v: number, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 font-sans tracking-tight text-xs">{(row.receivedQuantity || 0).toLocaleString()} / {v.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Remaining: {(v - (row.receivedQuantity || 0)).toLocaleString()}</span>
                </div>
            )
        },
        { key: "totalAmount", label: "Total Bill", render: (v: number) => <span className="font-black text-slate-900 font-sans tracking-tighter">₹{v?.toLocaleString()}</span> },
        { key: "purchaseDate", label: "Date", render: (v: string) => <span className="text-slate-400 font-medium">{new Date(v).toLocaleDateString()}</span> },
        {
            key: "action",
            label: "Action",
            render: (_: any, row: any) => (
                <Can I="create" a="inventory">
                    <Button 
                        onClick={() => handleOpenPODialog(row)}
                        className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-md gap-1.5 shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" /> {row.status === "Partial" ? "RECEIVE MORE" : "PROCESS GRN"}
                    </Button>
                </Can>
            )
        }
    ]

    useEffect(() => { fetchData() }, [fetchData])

    useEffect(() => {
        fetch(`${API_BASE}/api/Inventory/lookup`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setInventoryLookup(data.map((i: any) => ({ value: (i.value || i.id)?.toString() || "", label: i.label || i.name }))))
            .catch(() => {})
    }, [])

    // ─── Columns ─────────────────────────────────────────────────────────────
    const itemColumns: ColumnDef<InventoryItem>[] = [
        {
            key: "name",
            label: "Material Description",
            render: (val, item) => (
                <div className="flex flex-col gap-0.5 font-sans">
                    <span className="font-bold text-slate-800 text-sm">{val as string}</span>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <History className="h-3 w-3" /> Updated {item.lastActivity}
                    </span>
                </div>
            )
        },
        {
            key: "category",
            label: "Class",
            render: (val) => <Badge variant="outline" className="text-[10px] font-bold border-slate-100 bg-slate-50 text-slate-500 rounded-lg px-2 font-sans">{val as string}</Badge>
        },
        {
            key: "currentStock",
            label: "On Hand",
            className: "text-right font-sans",
            render: (val, item) => (
                <div className="flex flex-col items-end">
                    <span className="font-bold text-sm text-slate-900">{(val as number).toLocaleString()}</span>
                    <span className="text-[10px] font-medium text-slate-400">{item.unit}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Inventory Status",
            className: "text-center font-sans",
            render: (val) => (
                <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold",
                    val === 'Normal' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                    {val === 'Normal' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {val as string}
                </span>
            )
        }
    ]

    const logColumns: ColumnDef<TransactionLog>[] = [
        {
            key: "date",
            label: "Timestamp",
            render: (val) => <span className="text-xs font-bold text-slate-500 font-sans">{val as string}</span>
        },
        {
            key: "material",
            label: "Allocation Info",
            render: (val, item: any) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800 text-sm font-sans uppercase">{val as string}</span>
                    {item.remarks && <span className="text-[10px] font-medium text-slate-400 font-sans italic">Note: {item.remarks}</span>}
                </div>
            )
        },
        {
            key: "quantity",
            label: "Volume",
            className: "text-right font-sans",
            render: (val, item) => (
                <span className={cn(
                    "font-bold text-sm tabular-nums",
                    item.type === 'Inward' ? "text-emerald-600" : "text-rose-600"
                )}>
                    {item.type === 'Inward' ? "+" : "-"}{(val as number).toLocaleString()}
                </span>
            )
        },
        {
            key: "ref",
            label: "Source Reference",
            render: (val) => <Badge variant="outline" className="font-bold text-[10px] bg-slate-50 border-slate-100 font-sans">{val as string}</Badge>
        }
    ]

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">GRN & Inventory Master</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchData} className="h-9 w-9 p-0 rounded-lg border-slate-200">
                        <RefreshCcw className={cn("h-4 w-4 text-slate-500", isLoading && "animate-spin")} />
                    </Button>
                    <Can I="create" a="inventory">
                        <Dialog open={isGRNOpen} onOpenChange={setIsGRNOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-9 px-6 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95 font-sans" style={{ background: 'var(--primary)' }} onClick={resetGRN}>
                                    <ArrowDownToLine className="h-4 w-4" /> New GRN Entry
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[1000px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white flex flex-col max-h-[92vh] font-sans">
                                <DialogHeader className="px-4 sm:px-6 py-4 text-left border-b border-slate-100 bg-white">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                                <ArrowDownToLine className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <DialogTitle className="text-sm font-bold text-slate-800 leading-none">{selectedPO ? "Reconcile Shipment against PO" : "Inward Manual Shipment (GRN)"}</DialogTitle>
                                                <DialogDescription className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{selectedPO ? `PO Ref: ${selectedPO.purchaseNumber}` : "Official entry for incoming inventory batches."}</DialogDescription>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {selectedPO && <Badge variant="outline" className="text-[10px] uppercase font-medium text-indigo-600 bg-indigo-50 border-indigo-100 rounded-sm">ERP LINKED</Badge>}
                                            <Badge variant="outline" className="text-[10px] uppercase font-medium text-slate-500 bg-slate-50 border-slate-200 rounded-sm">GRN SECURE</Badge>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <div className="px-4 sm:px-6 py-6 space-y-8">
                                        {/* Header Summary */}
                                        {selectedPO && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-md">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Global Supplier</span>
                                                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">V</div>
                                                        {selectedPO.supplierName}
                                                    </div>
                                                </div>
                                                <div className="space-y-1 md:text-right">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Expected Material Batch</span>
                                                    <div className="text-sm font-bold text-emerald-600 tracking-tight">
                                                        {selectedPO.quantity} Units of {selectedPO.itemName}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* User's Requested Grid/Form: Receipt Details */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Info className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Receipt Documentation</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-medium text-slate-600">Supplier Challan No <span className="text-rose-500">*</span></Label>
                                                    <Input value={challanNo} onChange={(e) => setChallanNo(e.target.value)} placeholder="Unique Challan No" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-medium text-slate-600">Challan Date</Label>
                                                    <Input type="date" value={challanDate} onChange={(e) => setChallanDate(e.target.value)} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-medium text-slate-600">Vehicle No</Label>
                                                    <Input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="GJ-01-XX-0000" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-medium text-slate-600">Received By</Label>
                                                    <SearchableSelect options={[{value: 'admin', label: 'admin'}, {value: 'manager', label: 'manager'}]} value={receivedBy} onValueChange={setReceivedBy} className="h-9 border-slate-200 bg-white rounded-md" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-medium text-slate-600">Common Remark</Label>
                                                    <Input value={commonRemarks} onChange={(e) => setCommonRemarks(e.target.value)} placeholder="Remarks..." className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Material Details Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Item Reconciliation</span>
                                            </div>

                                            <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50 border-b border-slate-100">
                                                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Material Item</th>
                                                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-48 text-right">Actual Received Qty</th>
                                                            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32 text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                                                            <td className="px-4 py-4">
                                                                <SearchableSelect
                                                                    options={inventoryLookup}
                                                                    placeholder="Select material..."
                                                                    value={grnItemId}
                                                                    onValueChange={setGrnItemId}
                                                                    disabled={!!selectedPO}
                                                                    className="h-9 rounded-md border-slate-200 bg-white text-sm"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <Input type="number" value={grnQty} onChange={(e) => setGrnQty(parseFloat(e.target.value) || 0)} className="h-9 rounded-md border-slate-200 bg-white text-sm font-bold text-indigo-600 text-right" />
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <Badge className="bg-emerald-50 text-emerald-600 font-bold text-[10px] border-emerald-100 px-2 h-5 rounded-sm uppercase">VALIDATED</Badge>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                                    <Button variant="ghost" onClick={() => setIsGRNOpen(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800 uppercase tracking-widest">Discard Entry</Button>
                                    <Button 
                                        className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95 whitespace-nowrap" 
                                        style={{ background: 'var(--primary)' }} 
                                        onClick={() => selectedPO ? handleAuthenticateGRN(selectedPO.id) : handleManualCommit()}
                                    >
                                        {selectedPO ? "Save & Finalize Receipt" : "Commit Stock Inward"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </Can>
                </div>
            </div>



            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between font-sans">
                        <TabsList className="bg-slate-50 p-1 rounded-lg h-9">
                            <TabsTrigger value="status" className="px-5 text-xs font-bold rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Stock Status</TabsTrigger>
                            <TabsTrigger value="history" className="px-5 text-xs font-bold rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Audit History</TabsTrigger>
                            <TabsTrigger value="pendings" className="px-5 text-xs font-bold rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
                                Pending Receipts
                                {pendings.length > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-black animate-pulse shadow-sm shadow-rose-200">
                                        {pendings.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                    </div>

                    <TabsContent value="status" className="m-0 p-0 outline-none">
                        <DataGrid
                            data={items}
                            columns={itemColumns}
                            isLoading={isLoading}
                            hideTitle={true}
                            searchPlaceholder="Search material by name, category..."
                        />
                    </TabsContent>

                    <TabsContent value="history" className="m-0 p-0 outline-none">
                        <DataGrid
                            data={logs}
                            columns={logColumns}
                            isLoading={isLoading}
                            hideTitle={true}
                            searchPlaceholder="Search transactions..."
                        />
                    </TabsContent>

                    <TabsContent value="pendings" className="m-0 p-0 outline-none">
                        <div className="p-0">
                            <DataGrid
                                data={pendings}
                                columns={pendingColumns}
                                isLoading={isLoading}
                                hideTitle={true}
                                searchPlaceholder="Search pending deliveries..."
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function BoxIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    )
}

function AlertCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}
