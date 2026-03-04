"use client"

import React, { useState } from "react"
import {
    ArrowLeft,
    Printer,
    Phone,
    Mail,
    MapPin,
    History,
    CreditCard,
    TrendingUp,
    FileText,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Calendar,
    MessageCircle,
    UserCircle,
    Plus,
    Activity,
    ShieldCheck,
    Lock,
    Unlock,
    PieChart,
    ArrowUpRight,
    Search,
    Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockJobHistory: JobBreakdown[] = [
    {
        jobId: "JB-2026-0034",
        date: "11 Feb, 2026",
        service: "1000 Business Cards (300 GSM)",
        total: 2500,
        paid: 1500,
        pending: 1000,
        status: "Completed"
    },
    {
        jobId: "JB-2026-0045",
        date: "25 Feb, 2026",
        service: "Canvas Print (24x36)",
        total: 1800,
        paid: 1800,
        pending: 0,
        status: "Completed"
    },
    {
        jobId: "JB-2026-0052",
        date: "01 Mar, 2026",
        service: "Brochure Printing (500 Nos)",
        total: 4500,
        paid: 0,
        pending: 4500,
        status: "In-Progress"
    }
]

export function CustomerDetailsClient({ customerId }: { customerId: string }) {
    const router = useRouter()

    // Mock Customer Data (Shabdolok Publications)
    const [portalActive, setPortalActive] = useState(true)
    const totalPending = mockJobHistory.reduce((acc, job) => acc + job.pending, 0)
    const advanceAmount = 0 // Mock advance
    const netBalance = advanceAmount - totalPending

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
                                    <Activity className="h-3.5 w-3.5 text-[#4C1F7A]" /> Current Work Status
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
                                            <TableCell className="py-2.5 text-right font-bold text-[#4C1F7A] text-xs pr-4">₹9.00 / pc</TableCell>
                                        </TableRow>
                                        <TableRow className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="py-2.5 font-bold text-xs pl-4 text-slate-700">Poster Vinyl (Large)</TableCell>
                                            <TableCell className="py-2.5 text-center">
                                                <Badge className="bg-blue-100 text-blue-600 border-none font-bold text-[8px] uppercase px-1.5 h-4">Pre-Press</Badge>
                                            </TableCell>
                                            <TableCell className="py-2.5 text-right font-bold text-[#4C1F7A] text-xs pr-4">₹45 / sqft</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-md">
                            <CardHeader className="bg-[#4C1F7A] text-white py-3 px-4">
                                <CardTitle className="text-[9px] font-bold uppercase tracking-widest opacity-80">Total Expenditure</CardTitle>
                                <div className="text-2xl font-bold tracking-tight mt-0.5">₹1,25,000</div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-center text-[10px] p-2.5 rounded-md bg-rose-50 border border-rose-100">
                                    <span className="font-bold text-rose-500 uppercase">PENDING BALANCE</span>
                                    <span className="font-bold text-rose-700 text-base tracking-tight italic">₹{Math.abs(netBalance)}</span>
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
        <div className="space-y-4 animate-in fade-in duration-300">
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
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Shabdolok Publications</h1>
                            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[8px] tracking-widest uppercase px-1.5 h-4">Active</Badge>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                            <UserCircle className="h-3 w-3" /> ID: {customerId} • SINCE DEC 2025
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="outline"
                        onClick={() => setShowPreview(true)}
                        className="h-8 px-3 rounded-md border-slate-200 font-bold text-[9px] uppercase tracking-wider text-indigo-600 gap-2 hover:bg-indigo-50 transition-all font-sans"
                    >
                        <Eye className="h-3.5 w-3.5" /> Preview Portal
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="h-8 px-3 rounded-md border-slate-200 font-bold text-[9px] uppercase tracking-wider text-slate-600 gap-2 font-sans"
                    >
                        <Printer className="h-3.5 w-3.5" /> Slip
                    </Button>
                    <Button className="h-8 px-4 rounded-md bg-[#4C1F7A] hover:bg-[#3d1862] font-bold text-[9px] uppercase tracking-wider text-white gap-2 shadow-sm font-sans">
                        <Plus className="h-3.5 w-3.5" /> Job Card
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* ── Left Column: Summary & Profile ───────────────────────── */}
                <div className="space-y-4">
                    {/* Financial health */}
                    <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-[#4C1F7A] to-[#3d1862] text-white rounded-md">
                        <CardHeader className="pb-1 pt-3 px-4">
                            <CardTitle className="text-[9px] font-bold uppercase tracking-[.15em] opacity-70">NET FINANCIAL POSITION</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="text-3xl font-bold tracking-tight mb-3 italic">
                                {netBalance < 0 ? `- ₹${Math.abs(netBalance)}` : `+ ₹${netBalance}`}
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="opacity-60 font-medium uppercase">Pending Jobs</span>
                                    <span className="font-mono font-bold text-white/90">₹{totalPending}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="opacity-60 font-medium uppercase">Advance Credits</span>
                                    <span className="font-mono font-bold text-emerald-400">₹{advanceAmount}</span>
                                </div>
                                <div className="h-[1px] bg-white/10 my-1" />
                                <p className="text-[8px] font-bold text-white/40 italic uppercase tracking-tighter">Calculated as (Advance - Pending)</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Portal Access Control */}
                    <Card className="border border-slate-200 shadow-sm rounded-md bg-white">
                        <CardHeader className="py-3 px-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                                    <ShieldCheck className="h-3.5 w-3.5 text-[#4C1F7A]" /> Client Portal
                                </CardTitle>
                                <Switch
                                    checked={portalActive}
                                    onCheckedChange={setPortalActive}
                                    className="data-[state=checked]:bg-[#4C1F7A] scale-75"
                                />
                            </div>
                            <CardDescription className="text-[9px] font-medium italic text-slate-400">Control B2B Dashboard access</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-3">
                            <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className={`p-1.5 rounded-md ${portalActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                        {portalActive ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-[9px] font-bold uppercase tracking-tight ${portalActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                            {portalActive ? 'Authorized' : 'Restricted'}
                                        </span>
                                        <span className="text-[8px] text-slate-400 font-medium">Last login: 2h ago</span>
                                    </div>
                                </div>
                                {portalActive && (
                                    <Button variant="ghost" className="h-6 px-2 text-[8px] font-bold text-indigo-600 hover:bg-white uppercase tracking-tighter border border-transparent hover:border-slate-200 shadow-none">
                                        OTP <ArrowUpRight className="h-2 w-2 ml-0.5" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card className="border border-slate-200 shadow-sm rounded-md bg-white">
                        <CardHeader className="py-3 px-4 border-b border-slate-50">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Master Record Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="space-y-2.5">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-md bg-blue-50 text-blue-500 border border-blue-100">
                                        <Phone className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Primary Contact</span>
                                        <span className="text-xs font-bold text-slate-700">+91 9540046568</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-md bg-orange-50 text-orange-500 border border-orange-100">
                                        <MapPin className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Shipping Node</span>
                                        <span className="text-xs font-medium text-slate-600 leading-tight">Sector 5, Rohini, Delhi - 110085</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-500 border border-emerald-100">
                                        <FileText className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">GST Registration</span>
                                        <span className="text-[11px] font-black text-slate-800 uppercase italic tracking-tight">09ABCDE1234F1Z5</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-[9px] font-bold">
                                <span className="text-slate-400 uppercase tracking-tighter italic">Ledger Source</span>
                                <Badge className="bg-slate-50 text-slate-600 border border-slate-100 font-bold px-1.5 h-4 uppercase text-[8px]">WhatsApp</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right Column: Kundali (History/Analysis) ─────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    <Tabs defaultValue="payments" className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <TabsList className="bg-slate-100 p-0.5 rounded-md h-8 border-none shadow-none w-fit">
                                <TabsTrigger value="payments" className="h-7 rounded-sm font-bold text-[9px] uppercase tracking-wider px-4 data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">Payments</TabsTrigger>
                                <TabsTrigger value="history" className="h-7 rounded-sm font-bold text-[9px] uppercase tracking-wider px-4 data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">Work Log</TabsTrigger>
                                <TabsTrigger value="analysis" className="h-7 rounded-sm font-bold text-[9px] uppercase tracking-wider px-4 data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">Insights</TabsTrigger>
                            </TabsList>
                            <div className="relative group">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 group-focus-within:text-[#4C1F7A] transition-colors" />
                                <input placeholder="Filter records..." className="pl-8 h-8 w-full sm:w-40 bg-white border border-slate-200 rounded-md text-[10px] font-medium focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none font-sans" />
                            </div>
                        </div>

                        {/* Payment Breakdown Content (Job-wise) */}
                        <TabsContent value="payments" className="mt-0">
                            <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-md bg-white">
                                <CardHeader className="bg-slate-50/50 py-2.5 px-4 border-b">
                                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                                        <CreditCard className="h-3.5 w-3.5 text-rose-500" /> Job-Wise Outstanding
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow className="hover:bg-transparent border-slate-100 h-8">
                                                <TableHead className="font-bold text-[9px] uppercase tracking-wider text-slate-500 pl-4">Job ID</TableHead>
                                                <TableHead className="font-bold text-[9px] uppercase tracking-wider text-slate-500">Service</TableHead>
                                                <TableHead className="font-bold text-[9px] uppercase tracking-wider text-slate-500 text-right">Value</TableHead>
                                                <TableHead className="font-bold text-[9px] uppercase tracking-wider text-slate-500 text-right">Paid</TableHead>
                                                <TableHead className="font-bold text-[9px] uppercase tracking-wider text-rose-500 text-right pr-4">Balance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockJobHistory.map((job) => (
                                                <TableRow key={job.jobId} className="hover:bg-slate-50/50 border-slate-50 h-10 transition-colors">
                                                    <TableCell className="font-mono font-bold text-blue-600 text-[10px] pl-4">{job.jobId}</TableCell>
                                                    <TableCell className="font-bold text-slate-700 text-xs py-2">{job.service}</TableCell>
                                                    <TableCell className="text-right font-bold text-slate-400 text-xs py-2">₹{job.total}</TableCell>
                                                    <TableCell className="text-right font-bold text-emerald-600 text-xs py-2">₹{job.paid}</TableCell>
                                                    <TableCell className="text-right pr-4 py-2">
                                                        <span className={`font-bold italic text-xs tracking-tight ${job.pending > 0 ? 'text-rose-600' : 'text-slate-200'}`}>
                                                            ₹{job.pending}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Work History Content */}
                        <TabsContent value="history" className="mt-0">
                            <Card className="border border-slate-200 shadow-sm bg-white rounded-md divide-y divide-slate-100">
                                {mockJobHistory.map((job, idx) => (
                                    <div key={job.jobId} className="group relative pl-10 pr-4 py-3 hover:bg-slate-50 transition-colors">
                                        <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-slate-100 group-first:top-5 group-last:bottom-auto group-last:h-5" />
                                        <div className="absolute left-3 top-5 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-white shadow-sm" />

                                        <div className="flex justify-between items-start">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase text-slate-900 tracking-tight">{job.jobId}</span>
                                                    <Badge className={`${job.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-none' : 'bg-orange-50 text-orange-600 border-none'} text-[8px] font-bold px-1.5 h-4 uppercase`}>
                                                        {job.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700">{job.service}</p>
                                                <div className="flex items-center gap-3 font-sans">
                                                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Calendar className="h-3 w-3" /> {job.date}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">• WhatsApp</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-500 hover:text-indigo-700 hover:bg-white border-transparent hover:border-slate-100">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </Card>
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
                                            <span className="text-3xl font-bold text-slate-900 tracking-tight italic">4.2</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">jobs / mo</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-slate-400">
                                                <span>Retention Probability</span>
                                                <span className="text-indigo-600 font-black">HIGH</span>
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
                                                <p className="text-xs font-bold text-[#4C1F7A]">₹8,450</p>
                                            </div>
                                            <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 space-y-0.5 text-center">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase">Primary</p>
                                                <p className="text-xs font-bold text-emerald-700">Offset</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-md bg-[#4C1F7A]/5 border border-[#4C1F7A]/10">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-bold text-slate-400 uppercase">LIFETIME VALUE (CLV)</span>
                                                <span className="text-sm font-bold text-slate-800 tracking-tight">₹1.25 Lakhs</span>
                                            </div>
                                            <PieChart className="h-4 w-4 text-[#4C1F7A]" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
