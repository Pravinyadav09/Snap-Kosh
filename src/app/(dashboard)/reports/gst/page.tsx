"use client"

import React, { useState } from "react"
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

// ─── Mock Data ───────────────────────────────────────────────────────────────
const summaryData = {
    outputGst: 145000,
    inputTaxCredit: 82000,
    payableGst: 63000,
}

const gstr1Data = [
    { id: "INV-2026-001", customer: "ABC Corp", gstNo: "27AAACR1234A1Z1", taxableValue: 10000, gstRate: "18%", igst: 1800, cgst: 0, sgst: 0, total: 11800 },
    { id: "INV-2026-002", customer: "Local Printer", gstNo: "27BBBCS5678B1Z2", taxableValue: 5000, gstRate: "12%", igst: 0, cgst: 300, sgst: 300, total: 5600 },
    { id: "INV-2026-003", customer: "Galaxy Media", gstNo: "27CCCC T9012C1Z3", taxableValue: 25000, gstRate: "18%", igst: 0, cgst: 2250, sgst: 2250, total: 29500 },
]

type Gstr1Entry = typeof gstr1Data[0]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GstReportsPage() {
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
            className: "text-right font-black text-slate-800 whitespace-nowrap",
            initialWidth: 130,
            render: (val: number) => `₹${val.toLocaleString()}`
        },
    ]

    return (
        <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans italic uppercase">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Taxation Intelligence</h1>
                <Button className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest shadow-xl rounded-xl gap-2 transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                    <Download className="h-4 w-4" /> Download GST JSON
                </Button>
            </div>

            {/* GST Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="relative overflow-hidden border-none shadow-xl bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Output GST (Liability)
                        </CardTitle>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-500 shadow-sm border border-blue-100">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter">₹{summaryData.outputGst.toLocaleString()}</div>
                        <div className="mt-2 flex items-center gap-2">
                             <Badge className="bg-blue-500/10 text-blue-600 border-none font-black text-[9px] uppercase">B2B + B2C Sales</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-none shadow-xl bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Input Tax (Credit)
                        </CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100">
                            <ArrowDownRight className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter">₹{summaryData.inputTaxCredit.toLocaleString()}</div>
                        <div className="mt-2 flex items-center gap-2">
                             <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase">Verified 2B Ledger</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-none shadow-xl bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Net Payable (Cash)
                        </CardTitle>
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-500 shadow-sm border border-rose-100">
                            <Landmark className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter text-rose-600">₹{summaryData.payableGst.toLocaleString()}</div>
                        <div className="mt-2 flex items-center gap-2">
                             <Badge className="bg-rose-500/10 text-rose-600 border-none font-black text-[9px] uppercase tracking-tighter italic">Due by 20th</Badge>
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
                    <TabsList className="gst-tabs-list h-12 bg-transparent gap-4 sm:gap-6 w-max justify-start">
                        <TabsTrigger value="gstr1" className="data-[state=active]:shadow-none rounded-t-lg px-6 font-black uppercase text-[10px] tracking-widest whitespace-nowrap transition-all h-full">GSTR-1 Records</TabsTrigger>
                        <TabsTrigger value="gstr3b" className="data-[state=active]:shadow-none rounded-t-lg px-6 font-black uppercase text-[10px] tracking-widest whitespace-nowrap transition-all h-full">GSTR-3B Summary</TabsTrigger>
                        <TabsTrigger value="itc" className="data-[state=active]:shadow-none rounded-t-lg px-6 font-black uppercase text-[10px] tracking-widest whitespace-nowrap transition-all h-full">ITC Registry</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="gstr1" className="p-0 sm:p-2 outline-none mt-2 mb-2">
                    <DataGrid
                        data={gstr1Data}
                        columns={columns}
                        searchPlaceholder="Search by customer or GST..."
                        enableCardView={false}
                        enableSelection={true}
                    />
                </TabsContent>

                <TabsContent value="gstr3b" className="p-12 text-center text-muted-foreground italic">
                    <PieChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    GSTR-3B Summary Report is under generation...
                </TabsContent>

                <TabsContent value="itc" className="p-12 text-center text-muted-foreground italic">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    ITC Ledger Verification with 2B mismatch report...
                </TabsContent>
            </Tabs>
        </div>
    )
}

