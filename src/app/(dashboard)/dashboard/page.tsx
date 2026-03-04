"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
    Users,
    DollarSign,
    Package,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    History,
    TrendingUp,
    FileText,
    Wallet,
    Calendar,
    ArrowRight,
    Gauge,
    Plus
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area,
} from "recharts"

const salesData = [
    { month: "Jan", sales: 42000, target: 40000 },
    { month: "Feb", sales: 38000, target: 40000 },
    { month: "Mar", sales: 55000, target: 45000 },
    { month: "Apr", sales: 48000, target: 45000 },
    { month: "May", sales: 62000, target: 50000 },
    { month: "Jun", sales: 75000, target: 55000 },
]

const distributionData = [
    { name: "Digital", value: 50, color: "#10b981" },
    { name: "Offset", value: 30, color: "#3b82f6" },
    { name: "Wide Format", value: 20, color: "#f59e0b" },
]

export default function DashboardPage() {
    const [role, setRole] = useState<"Owner" | "Operator">("Owner")

    const stats = [
        {
            title: "Today's Revenue (Sales)",
            value: "₹28,500",
            description: "+12% from yesterday",
            icon: DollarSign,
            color: "text-emerald-500",
            hideForOperator: true
        },
        {
            title: "Today's Expenses",
            value: "₹8,240",
            description: "Incl. raw materials",
            icon: Wallet,
            color: "text-rose-500",
            hideForOperator: true
        },
        {
            title: "Market Outstandings",
            value: "₹1,45,000",
            description: "Unpaid Invoices",
            icon: History,
            color: "text-amber-500",
            hideForOperator: true
        },
        {
            title: "Active Jobs",
            value: "14",
            description: "Production Floor",
            icon: Activity,
            color: "text-blue-500",
            hideForOperator: false
        },
    ]

    const lowStockItems = [
        { name: "170 GSM Art Paper", stock: "85 sheets", threshold: "200" },
        { name: "Cyan Toner (C60)", stock: "15%", threshold: "20%" },
        { name: "Gloss Lamination 12\"", stock: "1.5 rolls", threshold: "3" },
    ]

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">Control Center</h1>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-sans">
                        Real-time earnings and shop floor status at a glance.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white border-2 border-slate-50 p-1.5 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-3 border-r-2 border-slate-50">Role Simulation:</span>
                    <Tabs defaultValue={role} onValueChange={(v) => setRole(v as any)}>
                        <TabsList className="h-9 bg-transparent border-0 gap-1">
                            <TabsTrigger value="Owner" className="text-[9px] font-black uppercase tracking-widest h-7 rounded-lg data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white transition-all">Owner</TabsTrigger>
                            <TabsTrigger value="Operator" className="text-[9px] font-black uppercase tracking-widest h-7 rounded-lg data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white transition-all">Operator</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    role === "Operator" && stat.hideForOperator ? (
                        <Card key={stat.title} className="relative overflow-hidden border border-dashed flex items-center justify-center bg-muted/20 min-h-[120px]">
                            <div className="text-center">
                                <Badge variant="secondary" className="text-[8px] opacity-50 uppercase">Restricted</Badge>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter italic">Finance Data Hidden</p>
                            </div>
                        </Card>
                    ) : (
                        <Card key={stat.title} className="relative overflow-hidden border-none shadow-md bg-gradient-to-br from-background to-muted/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg bg-background/80 shadow-sm ${stat.color}`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                                    <ArrowRight className="h-3 w-3" /> {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                <Card className={`col-span-4 shadow-sm ${role === 'Operator' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Sales Intelligence (6 Months)</CardTitle>
                            <CardDescription>Monthly revenue trend vs profit targets</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                        formatter={(value: any) => [`₹${value?.toLocaleString() || 0}`, 'Sales']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSales)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-md border-rose-500/20 bg-rose-500/[0.02] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <AlertTriangle className="size-24 text-rose-500" />
                    </div>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                            <CardTitle className="text-rose-600">Urgent Store Alerts</CardTitle>
                        </div>
                        <CardDescription>Low stock items requiring immediate purchase.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {lowStockItems.map((item) => (
                            <div key={item.name} className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-foreground">{item.name}</span>
                                    <Badge variant="destructive" className="text-[9px] animate-pulse">
                                        WARN: {item.stock} left
                                    </Badge>
                                </div>
                                <Progress
                                    value={(parseInt(item.stock) / parseInt(item.threshold)) * 100}
                                    className="h-1.5 bg-rose-100"
                                />
                                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                    <ArrowRight className="h-3 w-3" /> Threshold: {item.threshold}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Job Distribution</CardTitle>
                        <CardDescription>By Machine Category</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-6">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontSize: '11px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className="text-2xl font-black text-slate-800">14</span>
                                <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-tighter">Total Jobs</p>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-1 gap-3 w-full">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold font-mono">DIGITAL (Xerox/Konica)</span>
                                </div>
                                <span className="text-xs font-bold">50%</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-blue-500" />
                                    <span className="text-xs font-bold font-mono">OFFSET (Ryobi/Heidelberg)</span>
                                </div>
                                <span className="text-xs font-bold">30%</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-amber-500" />
                                    <span className="text-xs font-bold font-mono">WIDE FORMAT (Flex/Vinyl)</span>
                                </div>
                                <span className="text-xs font-bold">20%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-sm relative border-none overflow-hidden bg-gradient-to-br from-background to-primary/[0.03]">
                    <div className="absolute bottom-0 right-0 p-4 opacity-10">
                        <Activity className="size-48" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Shop Floor Live Operations</CardTitle>
                            <CardDescription>Real-time status of jobs in production.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-[10px] uppercase font-bold border-primary/20 text-primary">
                                        <Plus className="mr-1 h-3 w-3" /> New Job Card
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Create New Production Job</DialogTitle>
                                        <DialogDescription>Generate a factory floor job ticket.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Job Title</Label>
                                                <Input placeholder="e.g. 500 Letterheads" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Machine</Label>
                                                <Select>
                                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="c60">Xerox C60</SelectItem>
                                                        <SelectItem value="ryobi">Ryobi Offset</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Specifications & Instructions</Label>
                                            <Textarea placeholder="Paper weight, lamination, binding details..." />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Deadline</Label>
                                                <Input type="datetime-local" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Priority</Label>
                                                <Select defaultValue="medium">
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High (URGENT)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button className="w-full font-bold uppercase tracking-widest" onClick={() => toast.success("Job Card Created", { description: "New production job has been generated successfully." })}>Generate Job Card</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-[10px] uppercase font-bold">
                                        <Gauge className="mr-1 h-3 w-3" /> Log Reading
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Machine Meter Audit</DialogTitle>
                                        <DialogDescription>Log daily opening/closing meter readings.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Select Machine</Label>
                                            <Select>
                                                <SelectTrigger><SelectValue placeholder="Choose Machine" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="xerox">Xerox C60 (Digital)</SelectItem>
                                                    <SelectItem value="ryobi">Ryobi (Offset)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Closing Reading</Label>
                                                <Input type="number" placeholder="Enter meter value" />
                                            </div>
                                            <div className="space-y-2 opacity-50">
                                                <Label>Opening Reading</Label>
                                                <Input disabled value="1,45,200" />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button className="w-full font-bold uppercase" onClick={() => toast.success("Reading Saved", { description: "Machine meter audit log has been recorded." })}>Save Audit Log</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-5">
                            {[
                                { label: "Pending Pre-Press", count: 5, color: "bg-amber-500", progress: 20 },
                                { label: "On Printing Press", count: 3, color: "bg-blue-500", progress: 45 },
                                { label: "In Post-Press/Binding", count: 6, color: "bg-purple-500", progress: 70 },
                                { label: "Quality Check/Dispatched", count: 2, color: "bg-emerald-500", progress: 95 },
                            ].map((item) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded bg-background shadow-sm`}>
                                                <Activity className={`size-3 ${item.color.replace('bg-', 'text-')}`} />
                                            </div>
                                            <span className="text-sm font-bold">{item.label}</span>
                                        </div>
                                        <Badge variant="secondary" className="font-mono">{item.count} Jobs</Badge>
                                    </div>
                                    <Progress value={item.progress} className="h-1" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <div className="m-6 mt-0 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Calendar className="size-5 text-primary" />
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold">Today's Deliveries</p>
                                <p className="text-[10px] text-muted-foreground font-medium">4 jobs are due by 6:00 PM</p>
                            </div>
                        </div>
                        <Button size="sm" className="h-8 text-[10px] font-bold uppercase" onClick={() => toast.info("Opening Scheduler")}>Open Scheduler</Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
