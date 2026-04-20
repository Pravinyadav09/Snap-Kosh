"use client"

import { API_BASE } from '@/lib/api'

import React from "react"
import {
    BarChart3, TrendingUp, TrendingDown,
    FileSpreadsheet, Landmark, CreditCard,
    ArrowUpRight, PieChart, Calendar,
    Download, Activity, ShoppingCart
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Can } from "@/components/shared/permission-context"
import { DatePickerWithRange } from "@/components/shared/date-range-picker"
import { DateRange } from "react-day-picker"
import { addDays, format, subMonths } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line
} from 'recharts'

const reportModules = [
    { title: "Paper Usage Ledger", desc: "Track stock consumption per job", icon: FileSpreadsheet, url: "/reports/ledger", color: "blue" },
    { title: "GST Reports", desc: "Download GSTR-1, GSTR-3B filings", icon: Landmark, url: "/reports/gst", color: "emerald" },
    { title: "Financial Statements", desc: "Profit & Loss, Balance Sheet view", icon: CreditCard, url: "/reports/finance", color: "rose" },
    { title: "Production Efficiency", desc: "Machine downtime & output logs", icon: Activity, url: "/reports/production", color: "amber" },
    { title: "Purchase Analysis", desc: "Vendor wise spending reports", icon: ShoppingCart, url: "/reports/purchases", color: "violet" },
    { title: "Sales Performance", desc: "Job-wise revenue tracking", icon: TrendingUp, url: "/reports/sales", color: "indigo" },
]

export default function ReportsMainPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: subMonths(new Date(), 1),
        to: new Date(),
    });

    const [stats, setStats] = React.useState({
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        activeJobs: 0,
        warnings: 0,
        trends: [] as any[],
        machineUsage: [] as any[]
    });

    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let url = `${API_BASE}/api/Dashboard/admin-summary`;
        if (date?.from && date?.to) {
            url += `?start=${date.from.toISOString()}&end=${date.to.toISOString()}`;
        }
        
        setLoading(true);
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setStats({
                    monthlyRevenue: data.monthlyRevenue || 0,
                    monthlyExpenses: data.monthlyExpenses || 0,
                    activeJobs: data.activeJobs || 0,
                    warnings: (data.maintenanceAlerts || 0) + (data.stockAlerts?.length || 0),
                    trends: data.trends || [],
                    machineUsage: data.machineUsage || []
                });
            })
            .catch(err => console.error("Failed to fetch dashboard stats", err))
            .finally(() => setLoading(false));
    }, [date]);

    const formatCurrency = (val: number) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(2)} K`;
        return `₹${val.toFixed(2)}`;
    }

    return (
        <Can I="view" a="reports">
            <div className={cn("space-y-6 font-sans bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-opacity", loading ? "opacity-60" : "opacity-100")}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans uppercase">
                    <div className="space-y-0.5 text-left">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Strategic Intelligence</h1>
                        <p className="text-[10px] text-slate-400 font-bold lowercase tracking-widest flex items-center gap-2">
                           <Activity className="size-3 text-emerald-500" /> Real-time Analytics active
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <DatePickerWithRange date={date} setDate={setDate} />
                        <Can I="print" a="reports">
                            <Button className="h-11 px-6 text-white font-bold text-[10px] uppercase tracking-widest gap-2 shadow-xl rounded-xl transition-all active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }}>
                                <Download className="h-4 w-4" /> Export Report
                            </Button>
                        </Can>
                    </div>
                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportModules.map((m, i) => (
                        <Link key={i} href={m.url} className="block group">
                            <Card className="h-full border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                                <CardContent className="p-7 flex flex-col h-full">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300",
                                        m.color === 'blue' && "bg-blue-50 text-blue-600",
                                        m.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                                        m.color === 'rose' && "bg-rose-50 text-rose-600",
                                        m.color === 'amber' && "bg-amber-50 text-amber-600",
                                        m.color === 'violet' && "bg-violet-50 text-violet-600",
                                        m.color === 'indigo' && "bg-indigo-50 text-indigo-600",
                                    )}>
                                        <m.icon className="h-6 w-6" />
                                    </div>
                                    
                                    <div className="space-y-2 flex-1">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                            {m.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[200px]">
                                            {m.desc}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center group/btn">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            Updated 2m ago
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                                            View Report 
                                            <ArrowUpRight className="h-3 w-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </Can>
    )
}
