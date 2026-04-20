"use client"

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect } from "react"
import { 
    TrendingUp, BarChart3, 
    ArrowUpRight, ArrowDownRight, 
    ShoppingCart, UserCheck,
    Download, PieChart,
    ChevronRight, Calendar,
    Trophy, Zap, Target, Search, Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

type Job = {
    id: number
    customerName: string
    quotedPrice: number
    status: string
    jobType: string
    createdAt: string
}

export default function SalesPerformancePage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_BASE}/api/JobCards?size=500`)
            .then(res => res.json())
            .then(data => {
                setJobs(data.items || [])
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const totalRevenue = jobs.reduce((sum, j) => sum + (j.quotedPrice || 0), 0)
    const avgOrderValue = jobs.length > 0 ? totalRevenue / jobs.length : 0

    const customerMap: Record<string, { rev: number; jobs: number }> = {}
    jobs.forEach(j => {
        const name = j.customerName || 'Direct Cash'
        if (!customerMap[name]) customerMap[name] = { rev: 0, jobs: 0 }
        customerMap[name].rev += (j.quotedPrice || 0)
        customerMap[name].jobs += 1
    })

    const topCustomers = Object.entries(customerMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.rev - a.rev)
        .slice(0, 5)

    const formatCurrency = (val: number = 0) => `₹${(val || 0).toLocaleString()}`

    const columns: ColumnDef<Job>[] = [
        { key: "id", label: "Job ID", render: (v) => <span className="font-black text-slate-900">#{v}</span> },
        { key: "customerName", label: "Customer", render: (v) => <span className="font-bold text-slate-800">{v as string}</span> },
        { key: "jobType", label: "Type", render: (v) => <Badge variant="outline" className="text-[9px] font-bold uppercase">{v as string || 'Standard'}</Badge> },
        { key: "quotedPrice", label: "Revenue", className: "text-right", render: (v) => <span className="font-black text-emerald-600">{formatCurrency(v as number)}</span> },
        { key: "createdAt", label: "Date", render: (v) => <span className="text-[10px] font-bold text-slate-400">{new Date(v as string).toLocaleDateString()}</span> },
        { key: "status", label: "Phase", className: "text-center", render: (v) => (
            <Badge className={v === 'Completed' ? "bg-emerald-500" : "bg-blue-500"}>{v as string}</Badge>
        )}
    ]

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 uppercase font-bold text-left">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl tracking-tight text-slate-900">Sales Intelligence</h1>
                    <p className="text-[10px] text-muted-foreground tracking-widest px-0.5">Revenue Growth & Market Share</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-10 px-4 text-[10px] uppercase tracking-widest gap-2 rounded-xl border-slate-200">
                        <Target className="h-4 w-4" /> CRM Funnel
                    </Button>
                    <Button className="h-10 px-6 text-white text-[10px] uppercase tracking-widest gap-2 shadow-xl rounded-xl" style={{ background: 'var(--primary)' }}>
                        <Trophy className="h-4 w-4" /> Leaderboard
                    </Button>
                </div>
            </div>

            {/* Sales Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <TrendingUp className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0 text-white">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                            Lifetime Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold truncate">
                            ₹{(totalRevenue / 100000).toFixed(2)} L
                        </div>
                        <p className="text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full">
                            Total Performance
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Zap className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0 text-white">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                            Avg Order Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold truncate">
                            {formatCurrency(avgOrderValue)}
                        </div>
                        <p className="text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full">
                            Deal Quality Index
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <ShoppingCart className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0 text-white">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                            Total Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold truncate">
                            {String(jobs.length).padStart(2, '0')}
                        </div>
                        <p className="text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full">
                            Cumulative Orders
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <UserCheck className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0 text-white">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                            Client Reach
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold truncate">
                            {String(Object.keys(customerMap).length).padStart(2, '0')}
                        </div>
                        <p className="text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full">
                            Active Partnerships
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            Detailed Sales Registry
                        </CardTitle>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" className="h-8 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-slate-200">
                                <Download className="h-3.5 w-3.5 mr-1.5" /> Export Data
                             </Button>
                        </div>
                    </div>
                    <CardContent className="p-0">
                        <DataGrid 
                            data={jobs} 
                            columns={columns} 
                            isLoading={loading}
                            hideTitle={true}
                            searchPlaceholder="Find orders, customers..." 
                        />
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <CardHeader className="py-4 bg-slate-50 border-b">
                        <CardTitle className="text-xs font-black uppercase tracking-widest">
                             Strategic Client Portfolio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         {topCustomers.map((c, i) => (
                             <div key={i} className="p-4 border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                                 <div className="flex justify-between items-center mb-1">
                                     <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                                     <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase h-5">Top Tier</Badge>
                                 </div>
                                 <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                     <span>{c.jobs} Full Projects</span>
                                     <span className="text-slate-900">{formatCurrency(c.rev)}</span>
                                 </div>
                             </div>
                         ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
