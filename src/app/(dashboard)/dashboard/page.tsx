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
    Plus,
    CreditCard,
    Banknote,
    Printer,
    UserCheck,
    AlertCircle,
    BarChart3,
    Filter,
    Palette,
    Search,
    ChevronDown,
    ShieldCheck,
    ListTodo
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "@/components/shared/date-range-picker"
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
    LineChart,
    Line,
} from "recharts"
import { cn } from "@/lib/utils"
import { useThemeCustomizer } from "@/components/shared/theme-customizer-context"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/shared/searchable-select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"

// Mock Data
const materialUsageData = [
    { name: "12x18 Art Card 300GSM", usage: 4500, unit: "Sheets" },
    { name: "13x19 Glossy 170GSM", usage: 3200, unit: "Sheets" },
    { name: "Vinyl Sticker (Opaque)", usage: 1200, unit: "Meters" },
    { name: "Flex Banner 10oz", usage: 850, unit: "Sq Ft" },
    { name: "Gumming Sheet 80GSM", usage: 2800, unit: "Sheets" },
    { name: "Transparent Sticker", usage: 600, unit: "Meters" },
]

const vipCustomers = [
    { name: "Reliance Retail", orders: 45, revenue: 145000, lastOrder: "2h ago" },
    { name: "Aditya Birla Group", orders: 38, revenue: 112000, lastOrder: "5h ago" },
    { name: "TATA Digital", orders: 32, revenue: 98500, lastOrder: "Yesterday" },
    { name: "HDFC Bank Ltd", orders: 28, revenue: 84000, lastOrder: "1d ago" },
    { name: "Zomato Media", orders: 25, revenue: 72500, lastOrder: "2d ago" },
]

const defaulters = [
    { name: "Local Printers Assoc", balance: 45000, days: 65, lastPay: "Jan 12" },
    { name: "Creative Ads Agency", balance: 32000, days: 42, lastPay: "Jan 28" },
    { name: "Siddhi Vinayak Decor", balance: 28500, days: 38, lastPay: "Feb 05" },
    { name: "Metro Events Corp", balance: 21000, days: 55, lastPay: "Jan 15" },
    { name: "Pioneer Publications", balance: 18500, days: 22, lastPay: "Feb 18" },
]

const machineData = [
    { name: "Xerox Versant 180", status: "Running", eff: 98, currentMeter: "2,14,650", todayLoad: "4,250" },
    { name: "Konica AccurioPress", status: "Running", eff: 89, currentMeter: "8,33,100", todayLoad: "2,100" },
    { name: "Canon ImagePress", status: "Idle", eff: 0, currentMeter: "5,42,300", todayLoad: "0" },
    { name: "Ricoh Pro C7200", status: "Running", eff: 92, currentMeter: "1,12,450", todayLoad: "3,800" },
]

const inventoryAlertsData = [
    { name: "Cyan Toner (C60/70)", stock: "15%", status: "CRITICAL" },
    { name: "170 GSM Art Card (12x18)", stock: "85 Sheets", status: "LOW" },
    { name: "Solvent Ink (Magenta)", stock: "0.5 Litre", status: "CRITICAL" },
]

const customerMediaData = [
    { name: "12x18 Art Card", qty: "2.4k", color: "bg-primary" },
    { name: "Glossy 170GSM", qty: "1.2k", color: "bg-indigo-500" },
    { name: "Vinyl Opaque", qty: "0.8k", color: "bg-emerald-500" },
    { name: "Matte Finish 250", qty: "0.5k", color: "bg-orange-500" },
    { name: "Synthetics", qty: "0.3k", color: "bg-rose-500" },
]

export default function DashboardPage() {
    const [dateRange, setDateRange] = useState<any>(undefined)
    const { setOpen: setOpenTheme } = useThemeCustomizer()
    const [analysisMode, setAnalysisMode] = useState<"customer" | "material">("customer")
    const [selectedCustomer, setSelectedCustomer] = useState("Reliance Retail")
    const [selectedMaterial, setSelectedMaterial] = useState("12x18 Art Card 300GSM")
    const [vipSearch, setVipSearch] = useState("")
    const [defaulterSearch, setDefaulterSearch] = useState("")
    const [machineSearch, setMachineSearch] = useState("")
    const [inventorySearch, setInventorySearch] = useState("")
    const [materialConsumerSearch, setMaterialConsumerSearch] = useState("")
    const [customerMediaSearch, setCustomerMediaSearch] = useState("")
    const [inventoryChartType, setInventoryChartType] = useState<"bar" | "area" | "line">("bar")
    const [inventoryCategory, setInventoryCategory] = useState("All Materials")
    const [inventoryTimeframe, setInventoryTimeframe] = useState("Monthly View")
    
    const pendingMaintenanceData = [
        { name: "AC Filter Cleaning", assignee: "Ramesh Sharma", status: "OVERDUE", priority: "HIGH" },
        { name: "UPS Battery Water", assignee: "Suresh Tech", status: "PENDING", priority: "MEDIUM" },
        { name: "Shop Closing MCB", assignee: "Amit Security", status: "DUE TODAY", priority: "CRITICAL" },
        { name: "Shutter Greasing", assignee: "Ramesh Sharma", status: "SCHEDULED", priority: "LOW" }
    ]

    const [activeFilters, setActiveFilters] = useState({
        location: "All Locations",
        category: "All Jobs",
        machineType: "All Machines",
        paymentMode: "All Modes",
        orderPriority: "All Priorities",
        customerSegment: "All Segments",
        jobStage: "All Stages"
    })

    const filteredVips = vipCustomers.filter(c => c.name.toLowerCase().includes(vipSearch.toLowerCase()))
    const filteredDefaulters = defaulters.filter(c => c.name.toLowerCase().includes(defaulterSearch.toLowerCase()))
    const filteredMachines = machineData.filter(m => m.name.toLowerCase().includes(machineSearch.toLowerCase()))
    const filteredInventory = inventoryAlertsData.filter(i => i.name.toLowerCase().includes(inventorySearch.toLowerCase()))
    const filteredConsumers = vipCustomers.slice(0, 5).filter(c => c.name.toLowerCase().includes(materialConsumerSearch.toLowerCase()))
    const filteredCustomerMedia = customerMediaData.filter(m => m.name.toLowerCase().includes(customerMediaSearch.toLowerCase()))

    const isFilterActive = 
        activeFilters.location !== "All Locations" || 
        activeFilters.category !== "All Jobs" || 
        activeFilters.machineType !== "All Machines" ||
        activeFilters.paymentMode !== "All Modes" ||
        activeFilters.orderPriority !== "All Priorities" ||
        activeFilters.customerSegment !== "All Segments" ||
        activeFilters.jobStage !== "All Stages"

    return (
        <div className="space-y-8 p-1">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between items-start">
                <div className="space-y-1 italic">
                    <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans flex items-center gap-2 sm:gap-3">
                        <TrendingUp className="size-6 sm:size-8 text-primary shrink-0" />
                        Admin Intelligence
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="size-4" />
                        Live Business Snapshot for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 gap-2 font-bold rounded-lg border-primary/20 text-primary hover:bg-primary/5 shadow-sm text-[10px] sm:text-xs"
                        onClick={() => setOpenTheme(true)}
                    >
                        <Palette className="size-3.5 sm:size-4" /> <span className="hidden xs:inline">Theme</span>
                    </Button>

                    <DatePickerWithRange />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className={cn("h-8 w-8 rounded-lg relative transition-all", isFilterActive && "border-primary bg-primary/5")}>
                                <Filter className={cn("size-4", isFilterActive && "text-primary")} />
                                {isFilterActive && (
                                    <span className="absolute -top-1 -right-1 size-2.5 bg-primary rounded-full border-2 border-white animate-pulse" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-xl border-slate-200 shadow-2xl" align="end">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Filters</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="text-xs font-bold py-2.5">
                                        <Users className="mr-2 size-3.5" />
                                        <span>Plant Location</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="rounded-xl border-slate-200 shadow-xl">
                                            {["All Locations", "Main HQ - Mumbai", "Branch - Pune", "Factory - Vapi"].map(loc => (
                                                <DropdownMenuCheckboxItem 
                                                    key={loc} 
                                                    checked={activeFilters.location === loc}
                                                    onCheckedChange={() => setActiveFilters(prev => ({ ...prev, location: loc }))}
                                                    className="text-xs font-medium py-2"
                                                >
                                                    {loc}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="text-xs font-bold py-2.5">
                                        <Wallet className="mr-2 size-3.5" />
                                        <span>Payment Mode</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="rounded-xl border-slate-200 shadow-xl">
                                            {["All Modes", "Cash", "Online - UPI", "Bank Transfer", "Cheque"].map(mode => (
                                                <DropdownMenuCheckboxItem 
                                                    key={mode} 
                                                    checked={activeFilters.paymentMode === mode}
                                                    onCheckedChange={() => setActiveFilters(prev => ({ ...prev, paymentMode: mode }))}
                                                    className="text-xs font-medium py-2"
                                                >
                                                    {mode}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="text-xs font-bold py-2.5">
                                        <UserCheck className="mr-2 size-3.5" />
                                        <span>Customer Segment</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="rounded-xl border-slate-200 shadow-xl">
                                            {["All Segments", "Agencies", "Retail Clients", "Corporate", "Government"].map(seg => (
                                                <DropdownMenuCheckboxItem 
                                                    key={seg} 
                                                    checked={activeFilters.customerSegment === seg}
                                                    onCheckedChange={() => setActiveFilters(prev => ({ ...prev, customerSegment: seg }))}
                                                    className="text-xs font-medium py-2"
                                                >
                                                    {seg}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="text-xs font-bold py-2.5">
                                        <Activity className="mr-2 size-3.5" />
                                        <span>Production Stage</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="rounded-xl border-slate-200 shadow-xl">
                                            {["All Stages", "Designing", "Printing", "Binding", "Ready for Billing"].map(stage => (
                                                <DropdownMenuCheckboxItem 
                                                    key={stage} 
                                                    checked={activeFilters.jobStage === stage}
                                                    onCheckedChange={() => setActiveFilters(prev => ({ ...prev, jobStage: stage }))}
                                                    className="text-xs font-medium py-2"
                                                >
                                                    {stage}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="text-xs font-bold py-2.5">
                                        <AlertCircle className="mr-2 size-3.5" />
                                        <span>Job Priority</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="rounded-xl border-slate-200 shadow-xl">
                                            {["All Priorities", "Urgent - Today", "Regular", "VIP Portfolio"].map(prio => (
                                                <DropdownMenuCheckboxItem 
                                                    key={prio} 
                                                    checked={activeFilters.orderPriority === prio}
                                                    onCheckedChange={() => setActiveFilters(prev => ({ ...prev, orderPriority: prio }))}
                                                    className="text-xs font-medium py-2"
                                                >
                                                    {prio}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-[10px] font-black uppercase text-rose-500 justify-center py-2 cursor-pointer hover:bg-rose-50"
                                onClick={() => setActiveFilters({ 
                                    location: "All Locations", 
                                    category: "All Jobs", 
                                    machineType: "All Machines",
                                    paymentMode: "All Modes",
                                    orderPriority: "All Priorities",
                                    customerSegment: "All Segments",
                                    jobStage: "All Stages"
                                })}
                            >
                                Clear All Filters
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" className="h-8 px-3 sm:px-4 font-bold rounded-lg shadow-sm shadow-primary/20 text-[10px] sm:text-xs">
                        <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-1.5" /> New Job Card
                    </Button>
                </div>
            </div>

            {/* Metric Cards Row */}
            {/* Metric Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
                {/* 1. Today's Orders */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <FileText className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0">
                        <CardTitle className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest opacity-80">Today's Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-black">24</div>
                        <p className="text-[8px] sm:text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full">+4 vs Yesterday</p>
                    </CardContent>
                </Card>

                {/* 2. Today's Sales */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <DollarSign className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0">
                        <CardTitle className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest opacity-80">Today's Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-black truncate">₹32,450</div>
                        <p className="text-[8px] sm:text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full">₹12,800 Billed</p>
                    </CardContent>
                </Card>

                {/* 3. Today's Payment (Bifurcated) */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <Wallet className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0 text-white">
                        <CardTitle className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest opacity-80">Total Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 sm:space-y-2">
                        <div className="text-xl sm:text-3xl font-black truncate">₹18,200</div>
                        <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-1">
                            <div className="flex flex-col bg-white/10 p-1 rounded-lg border border-white/10 hover:bg-white/20 transition-colors">
                                <span className="text-[7px] sm:text-[7.5px] uppercase font-black opacity-70">Cash</span>
                                <span className="text-[9px] sm:text-[11px] font-black">₹4.5k</span>
                            </div>
                            <div className="flex flex-col bg-white/10 p-1 rounded-lg border border-white/10 hover:bg-white/20 transition-colors">
                                <span className="text-[7px] sm:text-[7.5px] uppercase font-black opacity-70">Online</span>
                                <span className="text-[9px] sm:text-[11px] font-black">₹13.7k</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Today's Expenses */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <CreditCard className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0">
                        <CardTitle className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest opacity-80">Daily Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-black truncate">₹6,840</div>
                        <p className="text-[8px] sm:text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full truncate">Ink & Materials</p>
                    </CardContent>
                </Card>

                {/* 5. Machine Counter */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute -bottom-2 -right-2 opacity-20 transform group-hover:rotate-12 transition-transform duration-700">
                        <Gauge className="size-16 sm:size-24" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0">
                        <CardTitle className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest opacity-80">Prints Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl sm:text-3xl font-black">4,250</span>
                            <span className="text-[8px] sm:text-[10px] font-bold opacity-70">IMPR.</span>
                        </div>
                        <div className="mt-2 sm:mt-3 space-y-0.5 sm:space-y-1 bg-black/10 p-1.5 sm:p-2 rounded-lg border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center justify-between text-[7px] sm:text-[7.5px] font-black uppercase tracking-tighter">
                                <span className="opacity-70 text-white">Opening</span>
                                <span>2,10,400</span>
                            </div>
                            <Progress value={65} className="h-0.5 sm:h-1 bg-white/20 [&>[data-slot=progress-indicator]]:bg-white" />
                            <div className="flex items-center justify-between text-[7px] sm:text-[7.5px] font-black uppercase tracking-tighter">
                                <span className="opacity-70 text-white">Current</span>
                                <span>2,14,650</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Market Balance (Customer Outstandings) */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
                        <History className="size-10 sm:size-16" />
                    </div>
                    <CardHeader className="pb-1 sm:pb-2 space-y-0">
                        <CardTitle className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest opacity-80">Market Dues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-black text-white truncate">₹1,45,000</div>
                        <p className="text-[8px] sm:text-[10px] font-bold mt-1 bg-white/20 w-fit px-1.5 py-0.5 rounded-full uppercase tracking-tighter italic">Collected Udhaari</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tables Section (VIPs & Defaulters) with Smooth Grid & Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* VIP Customers Table */}
                <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl border border-slate-100 group hover:shadow-emerald-500/5 transition-all duration-500">
                    <CardHeader className="bg-emerald-50 px-6 py-5 space-y-3">
                        <div className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-emerald-900 font-black text-xl flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-emerald-500/10">
                                        <UserCheck className="size-5 text-emerald-600" />
                                    </div>
                                    VIP Portfolio
                                </CardTitle>
                                <CardDescription className="text-emerald-600/50 font-bold text-[10px] uppercase tracking-[0.15em] ml-11">Top performers by revenue</CardDescription>
                            </div>
                            <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-white shadow-sm text-emerald-600 border border-slate-100">
                                <TrendingUp className="size-5" />
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-400" />
                            <Input 
                                placeholder="Filter VIP Customers..." 
                                className="h-9 pl-10 bg-white border-emerald-100 rounded-xl text-xs font-bold placeholder:text-emerald-200 focus-visible:ring-emerald-500/10 transition-all"
                                value={vipSearch}
                                onChange={(e) => setVipSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto scrollbar-thin">
                        <Table className="min-w-[400px]">
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-b border-slate-100">
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 pl-6 tracking-widest">Name</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Jobs</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Revenue</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right pr-6">Tier</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVips.map((cust) => (
                                    <TableRow key={cust.name} className="hover:bg-emerald-50/20 transition-all duration-300 border-slate-50 group/row">
                                        <TableCell className="py-4 font-bold text-slate-700 pl-6 group-hover/row:text-emerald-600 transition-colors">{cust.name}</TableCell>
                                        <TableCell className="py-4 font-mono font-bold text-right text-emerald-600 tabular-nums">{cust.orders}</TableCell>
                                        <TableCell className="py-4 font-black text-right tabular-nums">₹{cust.revenue.toLocaleString('en-IN')}</TableCell>
                                        <TableCell className="py-4 text-right pr-6">
                                            <Badge className="text-[9px] font-black uppercase bg-emerald-500 text-white border-none shadow-sm shadow-emerald-500/20 px-3 h-5 rounded-full">GOLD VIP</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Defaulters Table */}
                <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl border border-slate-100 group hover:shadow-rose-500/5 transition-all duration-500">
                    <CardHeader className="bg-rose-50 px-6 py-5 space-y-3">
                        <div className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-rose-900 font-black text-xl flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-rose-500/10">
                                        <AlertCircle className="size-5 text-rose-600" />
                                    </div>
                                    Pending Risk
                                </CardTitle>
                                <CardDescription className="text-rose-600/50 font-bold text-[10px] uppercase tracking-[0.15em] ml-11">Unpaid dues tracking</CardDescription>
                            </div>
                            <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-white shadow-sm text-rose-600 border border-slate-100">
                                <AlertTriangle className="size-5" />
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-rose-400" />
                            <Input 
                                placeholder="Filter Defaulters..." 
                                className="h-9 pl-10 bg-white border-rose-100 rounded-xl text-xs font-bold placeholder:text-rose-200 focus-visible:ring-rose-500/10 transition-all"
                                value={defaulterSearch}
                                onChange={(e) => setDefaulterSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto scrollbar-thin">
                        <Table className="min-w-[400px]">
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-b border-slate-100">
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 pl-6 tracking-widest">Name</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Ageing</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Balance</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDefaulters.map((cust) => (
                                    <TableRow key={cust.name} className="hover:bg-rose-50/20 transition-all duration-300 border-slate-50 group/row">
                                        <TableCell className="py-4 font-bold text-slate-700 pl-6 group-hover/row:text-rose-600 transition-colors">{cust.name}</TableCell>
                                        <TableCell className="py-4 font-mono font-bold text-right text-rose-600 tabular-nums">{cust.days}D</TableCell>
                                        <TableCell className="py-4 font-black text-right text-rose-700 tabular-nums">₹{cust.balance.toLocaleString('en-IN')}</TableCell>
                                        <TableCell className="py-4 text-right pr-6">
                                            <Badge className="text-[9px] font-black uppercase bg-rose-500 text-white border-none shadow-sm shadow-rose-500/20 px-4 h-5 rounded-full">HOLD</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Material Analytics Section - Smooth & Premium */}
            <Card className="border-none shadow-2xl bg-white rounded-2xl overflow-hidden group hover:shadow-indigo-500/5 transition-all duration-500">
                <CardHeader className="px-5 sm:px-8 py-5 sm:py-7 bg-indigo-50/30 border-b border-slate-100 flex flex-col items-stretch justify-between gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                        <div className="space-y-1.5 sm:space-y-2">
                            <CardTitle className="text-slate-900 font-black text-xl sm:text-2xl flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-2.5 rounded-2xl bg-indigo-500/10 shadow-sm shrink-0">
                                    <BarChart3 className="size-5 sm:size-6 text-indigo-600" />
                                </div>
                                Inventory & Material Analytics
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] ml-11 sm:ml-14">
                                Deep-dive into consumption patterns & forecasting
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <SearchableSelect
                                options={[
                                    { value: 'All Materials', label: 'ALL MATERIALS' },
                                    { value: 'Paper', label: 'PAPER STOCKS' },
                                    { value: 'Media', label: 'MEDIA STOCKS' },
                                    { value: 'Ink', label: 'INK & TONER' }
                                ]}
                                value={inventoryCategory}
                                onValueChange={setInventoryCategory}
                                placeholder="Select Category"
                                className="h-8 sm:h-9 w-full sm:w-[130px] bg-slate-50 border-none rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider"
                            />

                            <SearchableSelect
                                options={[
                                    { value: 'Monthly View', label: 'MONTHLY' },
                                    { value: 'Weekly View', label: 'WEEKLY' },
                                    { value: 'Yearly View', label: 'YEARLY' }
                                ]}
                                value={inventoryTimeframe}
                                onValueChange={setInventoryTimeframe}
                                placeholder="Select Timeframe"
                                className="h-8 sm:h-9 w-[48%] sm:w-[120px] bg-slate-50 border-none rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider"
                            />

                            <Tabs value={inventoryChartType} onValueChange={(v: any) => setInventoryChartType(v)} className="bg-slate-100 p-0.5 rounded-lg h-8 sm:h-9 w-[48%] sm:w-auto">
                                <TabsList className="bg-transparent border-0 gap-1 w-full flex">
                                    <TabsTrigger value="bar" className="flex-1 text-[8px] sm:text-[10px] font-black uppercase h-7 sm:h-8 px-2 sm:px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Bar</TabsTrigger>
                                    <TabsTrigger value="area" className="flex-1 text-[8px] sm:text-[10px] font-black uppercase h-7 sm:h-8 px-2 sm:px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Area</TabsTrigger>
                                    <TabsTrigger value="line" className="flex-1 text-[8px] sm:text-[10px] font-black uppercase h-7 sm:h-8 px-2 sm:px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Line</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Stats Summary Panel */}
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-2">
                                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider font-sans">Most Used Item</span>
                                <h3 className="text-lg font-black text-indigo-700">12x18 Art Card</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-indigo-600/70">4,500 Sheets</span>
                                    <Badge className="bg-indigo-500 text-[8px] font-black">Plan Stocks</Badge>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-sans">Highest Growth</span>
                                <h3 className="text-lg font-black text-slate-700">Gumming Sheet</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600/70">+15% YoY</span>
                                    <Badge variant="outline" className="text-[8px] font-black border-slate-300">Expanding</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Consumption Chart */}
                        <div className="md:col-span-3 h-[250px] sm:h-[300px] w-full mt-2 sm:mt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                {inventoryChartType === "bar" ? (
                                    <BarChart data={materialUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} interval={0} angle={-25} textAnchor="end" />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                        <Bar dataKey="usage" radius={[6, 6, 0, 0]} barSize={40}>
                                            {materialUsageData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={cn(index % 2 === 0 ? "var(--primary)" : "#6366f1")} fillOpacity={0.8} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                ) : inventoryChartType === "area" ? (
                                    <AreaChart data={materialUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                        <defs>
                                            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} interval={0} angle={-25} textAnchor="end" />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                        <Area type="monotone" dataKey="usage" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorUsage)" />
                                    </AreaChart>
                                ) : (
                                    <LineChart data={materialUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} interval={0} angle={-25} textAnchor="end" />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                        <Line type="monotone" dataKey="usage" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6, fill: "var(--primary)", strokeWidth: 3, stroke: "#fff" }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 7. Customer & Material Intelligence Drill-down (Compact View) */}
            <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden border border-slate-100">
                <CardHeader className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Activity className="size-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-slate-900 font-black text-sm uppercase tracking-wider">Business Intelligence</CardTitle>
                            <CardDescription className="text-[10px] font-medium text-slate-400">Deep-dive analytics</CardDescription>
                        </div>
                    </div>
                    <Tabs value={analysisMode} onValueChange={(v: any) => setAnalysisMode(v)} className="bg-slate-100 p-0.5 rounded-lg h-8">
                        <TabsList className="bg-transparent border-0 gap-0.5">
                            <TabsTrigger value="customer" className="text-[9px] font-black uppercase h-7 px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Customer</TabsTrigger>
                            <TabsTrigger value="material" className="text-[9px] font-black uppercase h-7 px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Material</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="p-5">
                    {analysisMode === "customer" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
                            <div className="lg:col-span-1 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Client</Label>
                                    <SearchableSelect
                                        options={vipCustomers.map(c => ({ value: c.name, label: c.name }))}
                                        value={selectedCustomer}
                                        onValueChange={setSelectedCustomer}
                                        placeholder="Select Client"
                                        className="h-9 bg-slate-50 border-none rounded-xl text-xs font-bold"
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-3 space-y-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-5">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consumption Pattern</h4>
                                            <Badge variant="outline" className="text-[8px] font-black border-slate-200 bg-white">6M Trend</Badge>
                                        </div>
                                        <div className="h-[120px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={materialUsageData.slice(0, 4)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorUsageCompact" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="name" hide />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                                    />
                                                    <Area type="monotone" dataKey="usage" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsageCompact)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-[200px] flex flex-col">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Top Media Used</h4>
                                            <Badge variant="outline" className="text-[7px] font-black bg-white">TRENDING</Badge>
                                        </div>
                                        <div className="relative mb-3">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-2.5 text-slate-400" />
                                            <Input 
                                                placeholder="Filter media..." 
                                                className="h-7 pl-7 bg-white border-slate-200 rounded-lg text-[9px] font-bold placeholder:text-slate-400 focus-visible:ring-slate-500/10"
                                                value={customerMediaSearch}
                                                onChange={(e) => setCustomerMediaSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto max-h-[120px] pr-1 scrollbar-thin">
                                            {filteredCustomerMedia.map((m) => (
                                                <div key={m.name} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 group hover:shadow-sm transition-all">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("size-1.5 rounded-full", m.color)} />
                                                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[90px]">{m.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-900">{m.qty}</span>
                                                </div>
                                            ))}
                                            {filteredCustomerMedia.length === 0 && (
                                                <div className="py-5 text-center text-[9px] font-bold text-slate-400 italic">No media found</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            <div className="lg:col-span-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Material</Label>
                                    <SearchableSelect
                                        options={materialUsageData.map(m => ({ value: m.name, label: m.name }))}
                                        value={selectedMaterial}
                                        onValueChange={setSelectedMaterial}
                                        placeholder="Select Material"
                                        className="h-9 bg-slate-50 border-none rounded-xl text-xs font-bold"
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-8">
                                <div className="rounded-xl border border-slate-100 overflow-x-auto scrollbar-thin bg-white">
                                    <div className="bg-slate-50/50 p-3 border-b border-slate-100 flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                                            <Input 
                                                placeholder="Search consumers..." 
                                                className="h-8 pl-8 bg-white border-slate-200 rounded-lg text-[10px] font-bold placeholder:text-slate-400 focus-visible:ring-slate-500/10"
                                                value={materialConsumerSearch}
                                                onChange={(e) => setMaterialConsumerSearch(e.target.value)}
                                            />
                                        </div>
                                        <Badge variant="outline" className="text-[8px] font-black h-5 border-slate-200 bg-white">TOP 5</Badge>
                                    </div>
                                    <Table className="min-w-[400px]">
                                        <TableHeader>
                                            <TableRow className="bg-slate-50 h-8 hover:bg-slate-50">
                                                <TableHead className="py-2 text-[9px] font-black uppercase text-slate-500 pl-4 border-r border-slate-100">Top Consumers</TableHead>
                                                <TableHead className="py-2 text-[9px] font-black uppercase text-slate-500 text-right pr-4">Spend</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredConsumers.map((cust) => (
                                                <TableRow key={cust.name} className="h-10 hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="py-2 pl-4 border-r border-slate-50/50">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-700">{cust.name}</span>
                                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Volume Tier A</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-2 text-right pr-4">
                                                        <span className="text-xs font-black text-indigo-600">₹{(cust.revenue/2).toLocaleString()}</span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredConsumers.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="py-10 text-center text-slate-400 font-bold italic text-[10px]">No consumers found</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bottom Insight Row - Table View */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* 1. Machine Status & Efficiency Table */}
                <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl border border-slate-100 group hover:shadow-slate-500/5 transition-all duration-500">
                    <CardHeader className="bg-slate-50 px-6 py-5 space-y-3">
                        <div className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-slate-900 font-black text-xl flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-slate-100">
                                        <Gauge className="size-5 text-slate-600" />
                                    </div>
                                    Shop Floor Status
                                </CardTitle>
                                <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] ml-11">Live efficiency metrics</CardDescription>
                            </div>
                            <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-white shadow-sm text-slate-600 border border-slate-100">
                                <Activity className="size-5 animate-pulse" />
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                            <Input 
                                placeholder="Search machines..." 
                                className="h-9 pl-10 bg-white border-slate-100 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus-visible:ring-slate-500/10 transition-all"
                                value={machineSearch}
                                onChange={(e) => setMachineSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto scrollbar-thin">
                        <Table className="min-w-[600px]">
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-b border-slate-100">
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 pl-6 tracking-widest">Machine Name</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest">Live Meter</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Load</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest">Status</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 text-right pr-6 tracking-widest">Efficiency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMachines.map((m) => (
                                    <TableRow key={m.name} className="hover:bg-slate-50 transition-all duration-300 border-slate-50 group/row">
                                        <TableCell className="py-4 font-bold text-slate-700 pl-6 group-hover/row:text-primary transition-colors">{m.name}</TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-900 tabular-nums">{m.currentMeter}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Impression Count</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{m.todayLoad}</span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge className={cn(
                                                "text-[9px] font-black uppercase border-none h-6 px-3 rounded-full",
                                                m.status === "Running" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-400"
                                            )}>
                                                {m.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-6 w-[120px]">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className="text-[10px] font-black text-slate-900">{m.eff}%</span>
                                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                    <div className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000 ease-out" style={{ width: `${m.eff}%` }} />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 2. Critical Inventory Tracking Table */}
                <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl border border-slate-100 group hover:shadow-orange-500/5 transition-all duration-500">
                    <CardHeader className="bg-orange-50 px-6 py-5 space-y-3">
                        <div className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-slate-900 font-black text-xl flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-orange-500/10">
                                        <Package className="size-5 text-orange-600" />
                                    </div>
                                    Inventory Alerts
                                </CardTitle>
                                <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] ml-11">Replenishment tracking</CardDescription>
                            </div>
                            <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-white shadow-sm text-orange-600 border border-slate-100">
                                <AlertTriangle className="size-5" />
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-orange-400" />
                            <Input 
                                placeholder="Search materials..." 
                                className="h-9 pl-10 bg-white border-orange-100 rounded-xl text-xs font-bold text-orange-700 placeholder:text-orange-200 focus-visible:ring-orange-500/10 transition-all"
                                value={inventorySearch}
                                onChange={(e) => setInventorySearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto scrollbar-thin">
                        <Table className="min-w-[400px]">
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-b border-slate-100">
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 pl-6 tracking-widest">Material Name</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest">Stock Left</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 text-right pr-6 tracking-widest">Urgency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInventory.map((item) => (
                                    <TableRow key={item.name} className="hover:bg-orange-50/20 transition-all duration-300 border-slate-50 group/row">
                                        <TableCell className="py-4 font-bold text-slate-700 pl-6 group-hover/row:text-orange-600 transition-colors">{item.name}</TableCell>
                                        <TableCell className="py-4 font-mono font-black text-slate-500 tabular-nums">{item.stock}</TableCell>
                                        <TableCell className="py-4 text-right pr-6">
                                            <Badge className={cn(
                                                "text-[9px] font-black uppercase border-none px-4 h-6 rounded-full shadow-sm transition-all",
                                                item.status === "CRITICAL" ? "bg-rose-500 text-white animate-pulse shadow-rose-500/20" : "bg-orange-500 text-white shadow-orange-500/20"
                                            )}>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Maintenance Accountability Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl border border-slate-100 group hover:shadow-indigo-500/5 transition-all duration-500">
                    <CardHeader className="bg-indigo-50/30 px-6 py-5 space-y-3">
                        <div className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-slate-900 font-black text-xl flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-indigo-500/10">
                                        <ShieldCheck className="size-5 text-indigo-500" />
                                    </div>
                                    Maintenance Tasks
                                </CardTitle>
                                <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] ml-11">Staff accountability & Proof tickets</CardDescription>
                            </div>
                            <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-white shadow-sm text-indigo-600 border border-slate-100">
                                <ListTodo className="size-5" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto scrollbar-thin">
                        <Table className="min-w-[400px]">
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-b border-slate-100">
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 pl-6 tracking-widest">Task Protocol</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Assignee</TableHead>
                                    <TableHead className="py-4 font-black uppercase text-[10px] text-slate-400 text-right pr-6 tracking-widest">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingMaintenanceData.map((task: any) => (
                                    <TableRow key={task.name} className="hover:bg-indigo-50/20 transition-all duration-300 border-slate-50 group/row">
                                        <TableCell className="py-4 pl-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 group-hover/row:text-indigo-600 transition-colors">{task.name}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Frequency: Standard</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 font-bold text-slate-500 text-center text-xs">{task.assignee}</TableCell>
                                        <TableCell className="py-4 text-right pr-6">
                                            <Badge className={cn(
                                                "text-[9px] font-black uppercase border-none px-3 h-6 rounded-full",
                                                task.status === "OVERDUE" ? "bg-rose-500/10 text-rose-600 shadow-sm shadow-rose-500/10" : 
                                                task.status === "CRITICAL" ? "bg-rose-500 text-white animate-pulse shadow-rose-500/20 shadow-lg" :
                                                task.status === "PENDING" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                                            )}>
                                                {task.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Quick Info Card - Premium Smooth Version */}
                <div className="relative group overflow-hidden rounded-2xl">
                    {/* Background with subtle gradient and glow */}
                    <div className="absolute inset-0 bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950" />
                    <div className="absolute -top-24 -right-24 size-48 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors duration-700" />
                    
                    <Card className="bg-transparent border-none shadow-2xl rounded-2xl p-6 sm:p-10 flex flex-col justify-center items-center text-center space-y-4 sm:space-y-6 relative z-10">
                        <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                            <TrendingUp className="size-10 sm:size-12 text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Maintenance Efficiency: 92%</h3>
                            <p className="text-slate-400 text-[10px] sm:text-xs font-medium max-w-[280px] sm:max-w-[320px] mx-auto leading-relaxed">
                                Total 48 tasks completed this month. Current accountability score is <span className="text-emerald-400 font-bold">trending upwards by 12%</span>.
                            </p>
                        </div>

                        <Button 
                            className="h-10 sm:h-11 px-6 sm:px-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-black text-[9px] sm:text-[11px] uppercase tracking-[0.15em] gap-2 sm:gap-3 shadow-[0_10px_20px_-5px_rgba(255,255,255,0.1)] active:scale-95 transition-all w-full sm:w-auto"
                        >
                            View Full Audit Report <ArrowRight className="size-3 sm:size-3.5" />
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
