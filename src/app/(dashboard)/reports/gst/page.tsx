"use client"

import React, { useState } from "react"
import {
    Search, Download, ChevronDown,
    Landmark, Calendar, FileText,
    Filter, ArrowUpRight, BarChart3,
    FileSpreadsheet, PieChart, ShieldCheck
} from "lucide-react"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GstReportsPage() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <h1 className="text-2xl font-bold tracking-tight">GST Reports</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Select defaultValue="feb-2026">
                        <SelectTrigger className="w-full sm:w-[180px] h-9">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="feb-2026">February 2026</SelectItem>
                            <SelectItem value="jan-2026">January 2026</SelectItem>
                            <SelectItem value="dec-2025">December 2025</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold whitespace-nowrap">
                        <Download className="h-4 w-4" /> Download JSON
                    </Button>
                </div>
            </div>

            {/* GST Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Output GST (Sales)</p>
                        <div className="flex items-end justify-between mt-1">
                            <p className="text-2xl font-black italic">₹{summaryData.outputGst.toLocaleString()}</p>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">+12% vs last month</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-emerald-500">
                    <CardContent className="pt-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Input Tax Credit (Purchases)</p>
                        <div className="flex items-end justify-between mt-1">
                            <p className="text-2xl font-black italic">₹{summaryData.inputTaxCredit.toLocaleString()}</p>
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200">Verified ITC</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-rose-500 bg-rose-50/30">
                    <CardContent className="pt-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Net GST Payable</p>
                        <div className="flex items-end justify-between mt-1">
                            <p className="text-2xl font-black italic text-rose-600">₹{summaryData.payableGst.toLocaleString()}</p>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase bg-white">Pay Now</Button>
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
                <div className="px-4 sm:px-6 pt-4 border-b bg-muted/20 overflow-x-auto scrollbar-hide">
                    <TabsList className="gst-tabs-list h-10 bg-transparent gap-4 sm:gap-6 w-full justify-start sm:justify-start">
                        <TabsTrigger value="gstr1" className="data-[state=active]:shadow-none rounded-t-lg px-4 font-bold uppercase text-[10px] sm:text-xs tracking-widest whitespace-nowrap transition-all">GSTR-1 (Sales)</TabsTrigger>
                        <TabsTrigger value="gstr3b" className="data-[state=active]:shadow-none rounded-t-lg px-4 font-bold uppercase text-[10px] sm:text-xs tracking-widest whitespace-nowrap transition-all">GSTR-3B (Summary)</TabsTrigger>
                        <TabsTrigger value="itc" className="data-[state=active]:shadow-none rounded-t-lg px-4 font-bold uppercase text-[10px] sm:text-xs tracking-widest whitespace-nowrap transition-all">ITC Ledger</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="gstr1" className="p-4 sm:p-6 outline-none">
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 gap-2">
                                <FileSpreadsheet className="h-4 w-4" /> Export Excel
                            </Button>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by customer or GST..."
                                className="pl-8 h-9 border-none bg-muted/50"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border overflow-x-auto scrollbar-thin">
                        <Table className="min-w-[800px]">
                            <TableHeader>
                                <TableRow className="bg-muted/50 uppercase text-[10px] font-black">
                                    <TableHead className="whitespace-nowrap">Inv Number</TableHead>
                                    <TableHead className="whitespace-nowrap">Customer</TableHead>
                                    <TableHead className="whitespace-nowrap">GST Number</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Taxable Value</TableHead>
                                    <TableHead className="text-center whitespace-nowrap">Rate</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">IGST</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">CGST</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">SGST</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gstr1Data.map((row, i) => (
                                    <TableRow key={i} className="text-xs group hover:bg-muted/5">
                                        <TableCell className="font-bold text-blue-600 whitespace-nowrap">{row.id}</TableCell>
                                        <TableCell className="font-bold whitespace-nowrap">{row.customer}</TableCell>
                                        <TableCell className="font-mono text-[10px] opacity-70 whitespace-nowrap">{row.gstNo}</TableCell>
                                        <TableCell className="text-right font-medium whitespace-nowrap">₹{row.taxableValue.toLocaleString()}</TableCell>
                                        <TableCell className="text-center font-bold text-slate-500 whitespace-nowrap">{row.gstRate}</TableCell>
                                        <TableCell className="text-right font-bold text-slate-600 whitespace-nowrap">{row.igst > 0 ? `₹${row.igst.toLocaleString()}` : '-'}</TableCell>
                                        <TableCell className="text-right font-bold text-slate-600 whitespace-nowrap">{row.cgst > 0 ? `₹${row.cgst.toLocaleString()}` : '-'}</TableCell>
                                        <TableCell className="text-right font-bold text-slate-600 whitespace-nowrap">{row.sgst > 0 ? `₹${row.sgst.toLocaleString()}` : '-'}</TableCell>
                                        <TableCell className="text-right font-black text-slate-800 whitespace-nowrap">₹{row.total.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-slate-50 font-black text-xs">
                                    <TableCell colSpan={3} className="text-right uppercase tracking-widest text-muted-foreground whitespace-nowrap">Monthly Totals</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">₹40,000</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className="text-right whitespace-nowrap">₹1,800</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">₹2,550</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">₹2,550</TableCell>
                                    <TableCell className="text-right text-sm whitespace-nowrap">₹46,900</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
