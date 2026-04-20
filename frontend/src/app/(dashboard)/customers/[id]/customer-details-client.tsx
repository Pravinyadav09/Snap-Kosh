"use client"
import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import {
    ArrowLeft,
    Phone,
    MapPin,
    CreditCard,
    TrendingUp,
    FileText,
    ExternalLink,
    Calendar,
    UserCircle,
    Activity,
    ShieldCheck,
    PieChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataGrid } from "@/components/shared/data-grid"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

// ─── Types ──────────────────────────────────────────────────────────────────
type JobBreakdown = {
    jobId: string
    date: string
    service: string
    total: number
    paid: number
    pending: number
    status: "Completed" | "In-Progress" | "Cancelled"
}



export function CustomerDetailsClient({ customerId }: { customerId: string }) {
    const router = useRouter()
    const [customerInfo, setCustomerInfo] = useState<any>({ name: "Loading...", netBalance: 0, isActive: true })
    const [jobHistory, setJobHistory] = useState<JobBreakdown[]>([])

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const numericId = parseInt(customerId.replace(/\D/g, '')) || 1
                
                // Fetch customer details
                const custRes = await fetch(`${API_BASE}/api/customers/${numericId}`)
                if (custRes.ok) {
                    const custData = await custRes.json()
                    setCustomerInfo(custData)
                }

                // Fetch jobs (work log / payments base)
                const jobsRes = await fetch(`${API_BASE}/api/portal/my-jobs/${numericId}`)
                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json()
                    const mappedJobs = jobsData.map((job: any) => ({
                        id: job.id,
                        jobId: job.jobNumber,
                        date: new Date(job.bookingDate || job.createdAt).toLocaleDateString('en-GB'),
                        service: job.jobName || "Standard Service",
                        total: job.totalCost || 0,
                        paid: job.paidAmount || 0,
                        pending: (job.totalCost || 0) - (job.paidAmount || 0),
                        status: job.status
                    }))
                    setJobHistory(mappedJobs)
                }
            } catch (err) {
                console.error(err)
            }
        }
        fetchDetails()
    }, [customerId])

    const totalPending = jobHistory.reduce((acc, job) => acc + job.pending, 0)
    const netBalance = customerInfo.netBalance || 0

    const [showPreview, setShowPreview] = useState(false)

    if (showPreview) {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-md text-white shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-1 rounded bg-indigo-500/20 text-indigo-300">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Portal Preview Mode (Admin)</span>
                    </div>
                    <Button variant="ghost" onClick={() => setShowPreview(false)} className="text-white hover:bg-white/10 font-bold h-7 px-3 text-[9px] uppercase tracking-wider">
                        Exit Preview
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-md">
                            <CardHeader className="border-b bg-slate-50/50 py-3 px-4">
                                <CardTitle className="text-xs font-bold tracking-tight flex items-center gap-2 uppercase text-slate-800">
                                    <Activity className="h-3.5 w-3.5 text-primary" /> Current Work Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="h-9 font-bold text-[9px] uppercase pl-4 text-slate-500">Job Details</TableHead>
                                            <TableHead className="h-9 font-bold text-[9px] uppercase text-center text-slate-500">Status</TableHead>
                                            <TableHead className="h-9 font-bold text-[9px] uppercase text-right pr-4 text-slate-500">Agreed Rate</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="py-2.5 font-bold text-xs pl-4 text-slate-700">Brochure Printing (500 Nos)</TableCell>
                                            <TableCell className="py-2.5 text-center">
                                                <Badge className="bg-orange-100 text-orange-600 border-none font-bold text-[8px] uppercase px-1.5 h-4">Printing</Badge>
                                            </TableCell>
                                            <TableCell className="py-2.5 text-right font-bold text-primary text-xs pr-4">₹9.00 / pc</TableCell>
                                        </TableRow>
                                        <TableRow className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="py-2.5 font-bold text-xs pl-4 text-slate-700">Poster Vinyl (Large)</TableCell>
                                            <TableCell className="py-2.5 text-center">
                                                <Badge className="bg-blue-100 text-blue-600 border-none font-bold text-[8px] uppercase px-1.5 h-4">Pre-Press</Badge>
                                            </TableCell>
                                            <TableCell className="py-2.5 text-right font-bold text-primary text-xs pr-4">₹45 / sqft</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-md">
                            <CardHeader className="bg-primary text-white py-3 px-4">
                                <CardTitle className="text-[9px] font-bold uppercase tracking-widest opacity-80">Total Expenditure</CardTitle>
                                <div className="text-2xl font-bold tracking-tight mt-0.5">₹1,25,000</div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-center text-[10px] p-2.5 rounded-md bg-rose-50 border border-rose-100">
                                    <span className="font-bold text-rose-500 uppercase">PENDING BALANCE</span>
                                    <span className="font-bold text-rose-700 text-base tracking-tight">₹{Math.abs(netBalance)}</span>
                                </div>
                                <Button className="w-full bg-slate-900 hover:bg-black font-bold text-[9px] uppercase tracking-widest h-8 rounded-md shadow-sm">
                                    Request Invoice Copy
                                </Button>
                                <p className="text-[8px] text-center text-slate-400 font-bold uppercase italic mt-2">Powered by Digital ERP Portal</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300 font-sans">
            {/* ── Header Row ────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-0.5">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-8 w-8 rounded-md bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-500" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-sans font-bold tracking-tight text-slate-900">{customerInfo.companyName || customerInfo.name || "Unknown Customer"}</h1>
                            <Badge className={`${customerInfo.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} border-none font-bold text-[8px] tracking-widest uppercase px-1.5 h-4`}>{customerInfo.isActive ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                            <UserCircle className="h-3 w-3" /> ID: {customerId} • {customerInfo.email || "No Email"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <Tabs defaultValue="payments" className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <TabsList className="bg-slate-100 p-1 rounded-xl h-11 border border-slate-200/60 shadow-inner w-fit">
                            <TabsTrigger value="payments" className="h-9 rounded-lg font-black text-[10px] uppercase tracking-[0.1em] px-6 data-[state=active]:bg-[var(--primary)] data-[state=active]:!text-white data-[state=active]:shadow-lg transition-all text-slate-500">Payments</TabsTrigger>
                            <TabsTrigger value="history" className="h-9 rounded-lg font-black text-[10px] uppercase tracking-[0.1em] px-6 data-[state=active]:bg-[var(--primary)] data-[state=active]:!text-white data-[state=active]:shadow-lg transition-all text-slate-500">Work Log</TabsTrigger>
                            <TabsTrigger value="analysis" className="h-9 rounded-lg font-black text-[10px] uppercase tracking-[0.1em] px-6 data-[state=active]:bg-[var(--primary)] data-[state=active]:!text-white data-[state=active]:shadow-lg transition-all text-slate-500">Insights</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Payment Breakdown Content (Job-wise) */}
                    <TabsContent value="payments" className="mt-0">
                        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
                            <DataGrid
                                data={jobHistory}
                                hideTitle
                                enableSelection={true}
                                enableCardView={true}
                                enableDateRange={true}
                                dateFilterKey="date"
                                initialPageSize={10}
                                searchPlaceholder="Search payments..."
                                columns={[
                                    { key: "jobId", label: "Job ID", filterable: true, sortable: true, render: (val) => <span className="font-bold text-primary text-[10px]">{val}</span> },
                                    { 
                                        key: "service", 
                                        label: "Order Details", 
                                        filterable: true, 
                                        sortable: true, 
                                        render: (val) => {
                                            let summary = val;
                                            try {
                                                const parsed = JSON.parse(val);
                                                if (Array.isArray(parsed) && parsed.length > 0) {
                                                    summary = parsed.map(i => i.description).join(", ");
                                                }
                                            } catch (e) {}
                                            
                                            return (
                                                <div className="flex flex-col gap-0.5 py-1 min-w-[300px] max-w-[450px]">
                                                    <span className="font-sans text-[13px] font-bold text-slate-800 tracking-tight leading-snug line-clamp-2 italic">{summary}</span>
                                                </div>
                                            )
                                        }
                                    },
                                    { key: "total", label: "Value", filterable: true, sortable: true, className: "text-right font-bold text-slate-400 text-xs", render: (val) => `₹${val}` },
                                    { key: "paid", label: "Paid", filterable: true, sortable: true, className: "text-right font-bold text-emerald-600 text-xs", render: (val) => `₹${val}` },
                                    {
                                        key: "pending",
                                        label: "Balance",
                                        filterable: true,
                                        sortable: true,
                                        headerClassName: "text-rose-500",
                                        className: "text-right",
                                        render: (val) => (
                                            <span className={`font-bold text-xs tracking-tight ${val > 0 ? 'text-rose-600' : 'text-slate-200'}`}>
                                                ₹{val}
                                            </span>
                                        )
                                    },
                                ]}
                            />
                        </div>
                    </TabsContent>

                    {/* Work History Content */}
                    <TabsContent value="history" className="mt-0">
                        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
                            <DataGrid
                                data={jobHistory}
                                hideTitle
                                enableSelection={true}
                                enableCardView={true}
                                enableDateRange={true}
                                dateFilterKey="date"
                                initialPageSize={10}
                                searchPlaceholder="Search work log..."
                                columns={[
                                    { key: "jobId", label: "Job ID", filterable: true, sortable: true, render: (val) => <span className="text-[10px] font-bold uppercase text-slate-900 tracking-tight">{val}</span> },
                                    { 
                                        key: "service", 
                                        label: "Service Manifest", 
                                        filterable: true, 
                                        sortable: true, 
                                        render: (val) => {
                                            let summary = val;
                                            try {
                                                const parsed = JSON.parse(val);
                                                if (Array.isArray(parsed) && parsed.length > 0) {
                                                    summary = parsed.map(i => i.description).join(", ");
                                                }
                                            } catch (e) {}
                                            
                                            return (
                                                <div className="flex flex-col gap-0.5 py-1 min-w-[300px] max-w-[450px]">
                                                    <span className="font-sans text-[13px] font-bold text-slate-800 tracking-tight leading-snug line-clamp-2 italic">{summary}</span>
                                                </div>
                                            )
                                        }
                                    },
                                    { key: "date", label: "Date", filterable: true, sortable: true, className: "text-[9px] font-bold text-slate-400" },
                                    {
                                        key: "status",
                                        label: "Status",
                                        filterable: true,
                                        sortable: true,
                                        render: (val: any) => (
                                            <Badge className={`${val === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-none' : 'bg-orange-50 text-orange-600 border-none'} text-[8px] font-bold px-1.5 h-4 uppercase`}>
                                                {val}
                                            </Badge>
                                        )
                                    },
                                    {
                                        key: "actions",
                                        label: "View",
                                        sortable: false,
                                        filterable: false,
                                        className: "text-right",
                                        render: (_, row: any) => (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 text-primary hover:opacity-80 hover:bg-white border-transparent hover:border-slate-100"
                                                onClick={() => router.push(`/jobs/${row.id}/edit`)}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                        )
                                    }
                                ]}
                            />
                        </div>
                    </TabsContent>

                    {/* BI Analysis Content */}
                    <TabsContent value="analysis" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Card className="border border-slate-200 shadow-sm rounded-md bg-white">
                                <CardHeader className="pb-1 pt-3 px-4">
                                    <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Service Frequency</CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 space-y-4">
                                    <div className="flex items-baseline gap-1.5 pt-1">
                                        <span className="text-3xl font-bold text-slate-900 tracking-tight">{jobHistory.length}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">total jobs</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-slate-400">
                                            <span>Retention Probability</span>
                                            <span className={jobHistory.length > 5 ? "text-emerald-600 font-black" : "text-orange-600 font-black"}>
                                                {jobHistory.length > 5 ? "STABLE" : "EMERGING"}
                                            </span>
                                        </div>
                                        <Progress value={85} className="h-1.5 bg-slate-50" />
                                    </div>
                                    <div className="p-2.5 rounded-md bg-indigo-50/50 border border-indigo-100 flex items-center gap-3">
                                        <TrendingUp className="h-4 w-4 text-indigo-600 shrink-0" />
                                        <p className="text-[10px] font-medium text-indigo-900 leading-tight">Print volume increased by <span className="font-bold underline">24%</span> YoY.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200 shadow-sm rounded-md bg-white">
                                <CardHeader className="pb-1 pt-3 px-4">
                                    <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Value Analysis</CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 space-y-3 pt-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 space-y-0.5 text-center">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">Avg Ticket</p>
                                            <p className="text-xs font-bold text-primary">₹{(jobHistory.reduce((acc, j) => acc + j.total, 0) / (jobHistory.length || 1)).toLocaleString()}</p>
                                        </div>
                                        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 space-y-0.5 text-center">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">Primary</p>
                                            <p className="text-xs font-bold text-emerald-700">Offset</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-md bg-primary/5 border border-primary/10">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">LIFETIME VALUE (CLV)</span>
                                            <span className="text-sm font-bold text-slate-800 tracking-tight">₹{jobHistory.reduce((acc, j) => acc + j.total, 0).toLocaleString()}</span>
                                        </div>
                                        <PieChart className="h-4 w-4 text-primary" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
