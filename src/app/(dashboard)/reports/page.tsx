"use client"

import React from "react"
import {
    BarChart3, TrendingUp, TrendingDown,
    FileSpreadsheet, Landmark, CreditCard,
    ArrowUpRight, PieChart, Calendar,
    Download, Activity, ShoppingCart
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const reportModules = [
    { title: "Paper Usage Ledger", desc: "Track stock consumption per job", icon: FileSpreadsheet, url: "/reports/ledger", color: "blue" },
    { title: "GST Reports", desc: "Download GSTR-1, GSTR-3B filings", icon: Landmark, url: "/reports/gst", color: "emerald" },
    { title: "Financial Statements", desc: "Profit & Loss, Balance Sheet view", icon: CreditCard, url: "#", color: "rose" },
    { title: "Production Efficiency", desc: "Machine downtime & output logs", icon: Activity, url: "#", color: "amber" },
    { title: "Purchase Analysis", desc: "Vendor wise spending reports", icon: ShoppingCart, url: "#", color: "violet" },
    { title: "Sales Performance", desc: "Job-wise revenue tracking", icon: TrendingUp, url: "#", color: "indigo" },
]

export default function ReportsMainPage() {
    return (
        <div className="space-y-6 font-sans bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans italic uppercase">
                <div className="space-y-0.5 text-left">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Strategic Intelligence</h1>
                </div>
                <Button className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl rounded-xl transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                    <Download className="h-4 w-4" /> Download Yearly Report
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-xl text-white rounded-2xl overflow-hidden" style={{ background: 'var(--primary)' }}>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Net Sales (MTD)</p>
                            <ArrowUpRight className="h-4 w-4 opacity-50" />
                        </div>
                        <p className="text-3xl font-black mt-2 italic tracking-tighter">₹8.45 L</p>
                        <div className="mt-3 flex items-center gap-2">
                             <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md text-white uppercase tracking-tighter">+12.5% Growth</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl text-white rounded-2xl overflow-hidden" style={{ background: 'var(--primary)', filter: 'brightness(0.85)' }}>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Expenses (MTD)</p>
                            <TrendingDown className="h-4 w-4 opacity-50" />
                        </div>
                        <p className="text-3xl font-black mt-2 italic tracking-tighter">₹3.12 L</p>
                        <div className="mt-3 flex items-center gap-2">
                             <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-md text-white uppercase tracking-tighter">Budget Aligned</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl text-white rounded-2xl overflow-hidden" style={{ background: 'var(--primary)' }}>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Active Jobs</p>
                            <Activity className="h-4 w-4 opacity-50" />
                        </div>
                        <p className="text-3xl font-black mt-2 italic tracking-tighter">42</p>
                        <div className="mt-3 flex items-center gap-2">
                             <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md text-white uppercase tracking-tighter">Optimal Flow</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl text-white rounded-2xl overflow-hidden" style={{ background: 'var(--primary)', filter: 'brightness(0.7)' }}>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Critical Warnings</p>
                            <Calendar className="h-4 w-4 opacity-50" />
                        </div>
                        <p className="text-3xl font-black mt-2 italic tracking-tighter">03</p>
                        <div className="mt-3 flex items-center gap-2">
                             <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md text-white uppercase tracking-tighter underline">Action Required</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {reportModules.map((m, i) => (
                    <Card key={i} className="group hover:scale-[1.02] transition-all cursor-pointer border-none shadow-sm bg-background">
                        <CardHeader className="pb-2">
                            <div className={`h-10 w-10 rounded-xl bg-${m.color}-100 text-${m.color}-600 flex items-center justify-center mb-1`}>
                                <m.icon className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-black tracking-tight group-hover:text-blue-600 transition-colors uppercase">{m.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{m.desc}</p>
                            <div className="mt-6 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                <span>Updated 2m ago</span>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] p-0 hover:bg-transparent hover:text-blue-600 group-hover:translate-x-1 transition-transform">
                                    View Report <ArrowUpRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-0 bg-muted/20">
                    <div className="flex items-center justify-between py-4 px-6 border-b">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-blue-500" /> Revenue Breakdown by Machine
                        </CardTitle>
                        <Badge variant="outline" className="font-bold">FEB 2026</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-48 bg-slate-50 flex items-center justify-center text-muted-foreground font-medium italic text-xs">
                        Graphical Charts (Pie/Bar) would be rendered here using Recharts or similar.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
