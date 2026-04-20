"use client"
import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import {
    Search, Download, ChevronDown,
    Landmark, Calendar, FileText,
    Filter, ArrowUpRight, BarChart3,
    FileSpreadsheet, PieChart, ShieldCheck,
    ArrowDownRight
} from "lucide-react"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Gstr1Entry = {
    id: string
    customer: string
    gstNo: string
    taxableValue: number
    gstRate: string
    igst: number
    cgst: number
    sgst: number
    total: number
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GstReportsPage() {
    const [summary, setSummary] = useState({
        outputGst: 0,
        inputTaxCredit: 0,
        payableGst: 0,
    })
    const [gstr1, setGstr1] = useState<Gstr1Entry[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchGstData = async () => {
            try {
                const now = new Date()
                const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
                const end = now.toISOString()

                const summaryRes = await fetch(`${API_BASE}/api/Reports/gst-summary?start=${start}&end=${end}`)
                if (summaryRes.ok) {
                    const data = await summaryRes.json()
                    setSummary({
                        outputGst: data.outputGst || 0,
                        inputTaxCredit: data.inputGst || 0,
                        payableGst: Math.max(0, (data.outputGst || 0) - (data.inputGst || 0))
                    })
                }

                const recordsRes = await fetch(`${API_BASE}/api/Reports/gst?start=${start}&end=${end}`)
                if (recordsRes.ok) {
                    const data = await recordsRes.json()
                    const mapped = data.map((r: any) => ({
                        id: r.invoiceNo,
                        customer: r.entityName,
                        gstNo: r.gstin,
                        taxableValue: r.taxableAmount,
                        gstRate: `${r.rate}%`,
                        igst: r.igst,
                        cgst: r.cgst,
                        sgst: r.sgst,
                        total: r.totalAmount
                    }))
                    setGstr1(mapped)
                }
            } catch (err) {
                console.error(err)
                setGstr1([])
            } finally {
                setIsLoading(false)
            }
        }
        fetchGstData()
    }, [])

    const columns: ColumnDef<Gstr1Entry>[] = [
        { key: "id", label: "Inv Number", className: "font-bold text-blue-600 whitespace-nowrap", initialWidth: 150 },
        { key: "customer", label: "Customer", className: "font-bold whitespace-nowrap", initialWidth: 200 },
        { key: "gstNo", label: "GST Number", className: "font-mono text-[10px] opacity-70 whitespace-nowrap", initialWidth: 180 },
        {
            key: "taxableValue",
            label: "Taxable Value",
            type: "number",
            headerClassName: "text-right",
            className: "text-right font-medium whitespace-nowrap",
            initialWidth: 130,
            render: (val: number) => `₹${val.toLocaleString()}`
        },
        { key: "gstRate", label: "Rate", className: "text-center font-bold text-slate-500 whitespace-nowrap", headerClassName: "text-center", initialWidth: 80 },
        {
            key: "igst",
            label: "IGST",
            type: "number",
            headerClassName: "text-right",
            className: "text-right font-bold text-slate-600 whitespace-nowrap",
            initialWidth: 100,
            render: (val: number) => val > 0 ? `₹${val.toLocaleString()}` : '-'
        },
        {
            key: "cgst",
            label: "CGST",
            type: "number",
            headerClassName: "text-right",
            className: "text-right font-bold text-slate-600 whitespace-nowrap",
            initialWidth: 100,
            render: (val: number) => val > 0 ? `₹${val.toLocaleString()}` : '-'
        },
        {
            key: "sgst",
            label: "SGST",
            type: "number",
            headerClassName: "text-right",
            className: "text-right font-bold text-slate-600 whitespace-nowrap",
            initialWidth: 100,
            render: (val: number) => val > 0 ? `₹${val.toLocaleString()}` : '-'
        },
        {
            key: "total",
            label: "Total",
            type: "number",
            headerClassName: "text-right",
            className: "text-right font-bold text-slate-800 whitespace-nowrap",
            initialWidth: 130,
            render: (val: number) => `₹${val.toLocaleString()}`
        },
    ]

    return (
        <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans uppercase">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Taxation Intelligence</h1>
                <Button className="h-11 px-6 text-white font-bold text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                    <Download className="h-4 w-4" /> Download GST JSON
                </Button>
            </div>

            {/* GST Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="relative overflow-hidden border-none shadow-xl bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Output GST (Liability)
                        </CardTitle>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-500 shadow-sm border border-blue-100">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter">₹{summary.outputGst.toLocaleString()}</div>
                        <div className="mt-2 flex items-center gap-2">
                             <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold text-[9px] uppercase">B2B + B2C Sales</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-none shadow-xl bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Input Tax (Credit)
                        </CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100">
                            <ArrowDownRight className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter">₹{summary.inputTaxCredit.toLocaleString()}</div>
                        <div className="mt-2 flex items-center gap-2">
                             <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] uppercase">Verified 2B Ledger</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-none shadow-xl bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Net Payable (Cash)
                        </CardTitle>
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-500 shadow-sm border border-rose-100">
                            <Landmark className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter text-rose-600">₹{summary.payableGst.toLocaleString()}</div>
                        <div className="mt-2 flex items-center gap-2">
                             <Badge className="bg-rose-500/10 text-rose-600 border-none font-bold text-[9px] uppercase tracking-tighter">Due by 20th</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="gstr1" className="bg-background rounded-xl shadow-sm border overflow-hidden">
                <style jsx global>{`
                    .gst-tabs-list [data-state="active"] {
                        background-color: var(--primary) !important;
                        color: white !important;
                        border-bottom-color: transparent !important;
                    }
                    .gst-tabs-list [data-state="active"] svg {
                        color: white !important;
                    }
                `}</style>
                <div className="px-4 sm:px-6 pt-4 border-b bg-muted/20 overflow-x-auto no-scrollbar">
                    <TabsList className="gst-tabs-list h-12 bg-transparent gap-4 sm:gap-6 w-max justify-start font-sans">
                        <TabsTrigger value="gstr1" className="data-[state=active]:shadow-none rounded-t-lg px-6 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap transition-all h-full">GSTR-1 Records</TabsTrigger>
                        <TabsTrigger value="gstr3b" className="data-[state=active]:shadow-none rounded-t-lg px-6 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap transition-all h-full">GSTR-3B Summary</TabsTrigger>
                        <TabsTrigger value="itc" className="data-[state=active]:shadow-none rounded-t-lg px-6 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap transition-all h-full">ITC Registry</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="gstr1" className="p-0 sm:p-2 outline-none mt-2 mb-2">
                    <DataGrid
                        data={gstr1}
                        columns={columns}
                        searchPlaceholder="Search by customer or GST..."
                        enableCardView={false}
                        enableSelection={true}
                    />
                </TabsContent>

                <TabsContent value="gstr3b" className="p-12 text-center text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    GSTR-3B Summary Report is under generation...
                </TabsContent>

                <TabsContent value="itc" className="p-12 text-center text-muted-foreground">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    ITC Ledger Verification with 2B mismatch report...
                </TabsContent>
            </Tabs>
        </div>
    )
}

