"use client";
import Link from "next/link";

import { API_BASE } from "@/lib/api";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
  ListTodo,
  Truck,
  Landmark,
  Globe,
  HelpCircle,
  CheckCircle,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/shared/date-range-picker";
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { cn } from "@/lib/utils";
import { useThemeCustomizer } from "@/components/shared/theme-customizer-context";

import { SearchableSelect } from "@/components/shared/searchable-select";
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
} from "@/components/ui/dropdown-menu";
import { Can } from "@/components/shared/permission-context";

// Live Data (To be populated via distinct API endpoints)
const materialUsageData: any[] = [];
const vipCustomers: any[] = [];
const inventoryAlertsData: any[] = [];
const customerMediaData: any[] = [];

// ─── Types ──────────────────────────────────────────────────────────────────
type DashboardSummary = {
  // Row 1
  activeJobs: number;
  todaySales: number;
  todayPayment: number;
  todayExpense: number;
  totalSupplierBalance: number;
  totalReceivables: number;

  // Row 2
  todayReceived: number;
  todayCashReceived: number;
  todayOnlineReceived: number;
  cashBalance: number;
  unpaidInvoicesCount: number;
  partialInvoicesCount: number;

  // Row 3
  avgInvoiceValue: number;
  digitalMachineCount: number;
  todaySqftPrinting: number;
  uninvoicedJobCardsCount: number;
  monthlyRevenue: number;
  monthlyReceived: number;

  // Row 4
  monthlyDue: number;
  monthlyPayment: number;
  monthlyExpenses: number;
  gstNetPayable: number;
  
  pendingOutsource: number;
  maintenanceAlerts: number;

  recentJobs: { jobNumber: string; customerName: string; status: string }[];
  stockAlerts: { itemName: string; currentStock: number; minLevel: number }[];
  trends: { name: string; rev: number; exp: number }[];
  productTrends: { name: string; offset: number; digital: number; flex: number }[];
  dailyTrends: { name: string; value: number }[];
  topCustomers: { name: string; revenue: number; jobCount: number; value: number }[];
  machineUsage: { name: string; value: number; color: string }[];
  machineList: { id: number; name: string; status: string; currentMeter: number; load: string; efficiency: string }[];
  maintenanceTasks: { id: number; taskName: string; assignedTo: string; status: string; priority: string }[];
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<any>(undefined);
  const { setOpen: setOpenTheme } = useThemeCustomizer();
  const [vipSearch, setVipSearch] = useState("");
  const [defaulterSearch, setDefaulterSearch] = useState("");
  const [machineSearch, setMachineSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [maintenanceSearch, setMaintenanceSearch] = useState("");
  const pageSize = 5;
  const [machinePage, setMachinePage] = useState(1);
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryChartType, setInventoryChartType] = useState<
    "bar" | "area" | "line"
  >("bar");
  const [inventoryCategory, setInventoryCategory] = useState("All Materials");
  const [inventoryTimeframe, setInventoryTimeframe] = useState("Monthly View");
  const [rotationIndex, setRotationIndex] = useState(0);

  // Synchronized Auto-rotate effect (5s Interval)
  useEffect(() => {
    const timer = setInterval(() => {
      setRotationIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/admin-summary`);
      if (res.ok) setSummary(await res.json());
    } catch (err) {
      toast.error("Telemetry link severed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [dateRange]);

  useEffect(() => {
    setMachinePage(1);
  }, [machineSearch]);

  useEffect(() => {
    setMaintenancePage(1);
  }, [maintenanceSearch]);

  const filteredMaintenance = (summary?.maintenanceTasks || []).filter((t) =>
    t.taskName.toLowerCase().includes(maintenanceSearch.toLowerCase()),
  );
  const pagedMaintenance = filteredMaintenance.slice(
    (maintenancePage - 1) * pageSize,
    maintenancePage * pageSize,
  );
  const totalMaintenancePages = Math.ceil(filteredMaintenance.length / pageSize);


  const filteredVips = (summary?.topCustomers || []).filter((c) =>
    c.name.toLowerCase().includes(vipSearch.toLowerCase()),
  );
  const filteredDefaulters = (summary?.topCustomers || []).filter((c) =>
    c.name.toLowerCase().includes(defaulterSearch.toLowerCase()),
  );
  const filteredMachines = (summary?.machineList || []).filter((m) =>
    m.name.toLowerCase().includes(machineSearch.toLowerCase()),
  );
  const pagedMachines = filteredMachines.slice(
    (machinePage - 1) * pageSize,
    machinePage * pageSize,
  );
  const totalMachinePages = Math.ceil(filteredMachines.length / pageSize);
  useEffect(() => {
    setInventoryPage(1);
  }, [inventorySearch]);

  const filteredInventory = (summary?.stockAlerts || []).filter((i) =>
    i.itemName.toLowerCase().includes(inventorySearch.toLowerCase()),
  );
  const pagedInventory = filteredInventory.slice(
    (inventoryPage - 1) * pageSize,
    inventoryPage * pageSize,
  );
  const totalInventoryPages = Math.ceil(filteredInventory.length / pageSize);

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2 sm:gap-3">
            <TrendingUp className="size-6 sm:size-8 text-primary shrink-0" />
            Admin Intelligence
          </h1>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="size-4" />
            Live Business Snapshot for{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 font-bold rounded-lg border-primary/20 text-primary hover:bg-primary/5 shadow-sm text-[10px] sm:text-xs"
            onClick={() => setOpenTheme(true)}
          >
            <Palette className="size-3.5 sm:size-4" />{" "}
            <span className="hidden xs:inline">Theme</span>
          </Button>

          <DatePickerWithRange />
          <Can I="create" a="production">
            <Link href="/jobs/new" passHref>
              <Button
                size="sm"
                className="h-8 px-3 sm:px-4 font-bold rounded-lg shadow-sm shadow-primary/20 text-[10px] sm:text-xs"
              >
                <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-1.5" /> New Job Card
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="space-y-4">
      {/* 21-KPI Intelligence Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        {[
          /* Row 1: Operations & Global Balances */
          { label: "Today's Orders",    val: summary?.activeJobs ?? 0,                                                  icon: Package,    grad: "from-cyan-500 to-cyan-600" },
          { label: "Today's Sales",     val: `₹${(summary?.todaySales ?? 0).toLocaleString()}`,                        icon: DollarSign, grad: "from-emerald-500 to-emerald-600" },
          { label: "Today's Payment",   val: `₹${(summary?.todayPayment ?? 0).toLocaleString()}`,                      icon: Wallet,     grad: "from-blue-500 to-blue-600" },
          { label: "Today's Expense",   val: `₹${(summary?.todayExpense ?? 0).toLocaleString()}`,                      icon: CreditCard, grad: "from-rose-500 to-rose-600" },
          { label: "Supplier Balance",  val: `₹${(summary?.totalSupplierBalance ?? 0).toLocaleString()}`,              icon: Landmark,   grad: "from-slate-600 to-slate-700" },
          { label: "Customer Balance",  val: `₹${(summary?.totalReceivables ?? 0).toLocaleString()}`,                  icon: Users,      grad: "from-violet-500 to-violet-600" },

          /* Row 2: Cash & Invoice Health */
          { label: "Today's Received",  val: `₹${(summary?.todayReceived ?? 0).toLocaleString()}`,                    icon: Banknote,   grad: "from-teal-500 to-teal-600" },
          { label: "Cash Received",     val: `₹${(summary?.todayCashReceived ?? 0).toLocaleString()}`,                icon: Wallet,     grad: "from-emerald-400 to-emerald-500" },
          { label: "Online Received",   val: `₹${(summary?.todayOnlineReceived ?? 0).toLocaleString()}`,              icon: Globe,      grad: "from-sky-500 to-sky-600" },
          { label: "Cash Balance",      val: `₹${(summary?.cashBalance ?? 0).toLocaleString()}`,                      icon: Gauge,      grad: "from-amber-500 to-amber-600" },
          { label: "Unpaid Invoices",   val: summary?.unpaidInvoicesCount ?? 0,                                        icon: AlertCircle,grad: "from-orange-500 to-orange-600" },
          { label: "Partial Invoices",  val: summary?.partialInvoicesCount ?? 0,                                       icon: HelpCircle, grad: "from-indigo-400 to-indigo-500" },

          /* Row 3: Throughput & Monthly Velocity */
          { label: "Avg Invoice Val",   val: `₹${(summary?.avgInvoiceValue ?? 0).toLocaleString()}`,                  icon: BarChart3,  grad: "from-cyan-600 to-cyan-700" },
          { label: "Digital Machines",  val: `${summary?.digitalMachineCount ?? 0} Active`,                            icon: Printer,    grad: "from-slate-700 to-slate-800" },
          { label: "Printed Qty",       val: `${(summary?.todaySqftPrinting ?? 0).toLocaleString()} pcs`,             icon: Palette,    grad: "from-pink-500 to-pink-600" },
          { label: "Uninvoiced Jobs",   val: summary?.uninvoicedJobCardsCount ?? 0,                                    icon: FileText,   grad: "from-amber-600 to-amber-700" },
          { label: "This Month Sale",   val: `₹${(summary?.monthlyRevenue ?? 0).toLocaleString()}`,                   icon: TrendingUp, grad: "from-indigo-600 to-indigo-700" },
          { label: "Monthly Received",  val: `₹${(summary?.monthlyReceived ?? 0).toLocaleString()}`,                  icon: CheckCircle,grad: "from-emerald-600 to-emerald-700" },

          /* Row 4: Monthly Liability Matrix */
          { label: "Monthly Due",       val: `₹${(summary?.monthlyDue ?? 0).toLocaleString()}`,                       icon: AlertCircle,grad: "from-rose-600 to-rose-700" },
          { label: "Monthly Payment",   val: `₹${(summary?.monthlyPayment ?? 0).toLocaleString()}`,                   icon: CreditCard, grad: "from-blue-600 to-blue-700" },
          { label: "Monthly Expense",   val: `₹${(summary?.monthlyExpenses ?? 0).toLocaleString()}`,                  icon: TrendingDown,grad: "from-orange-600 to-orange-700" },
        ].map((kpi, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${kpi.grad} text-white p-3 shadow-lg hover:scale-[1.03] hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-24 cursor-default`}>
            {/* Watermark icon */}
            <kpi.icon className="absolute -right-3 -bottom-3 size-16 opacity-10 rotate-[-15deg]" />
            {/* Icon badge */}
            <div className="bg-white/20 w-fit p-1.5 rounded-lg backdrop-blur-sm">
              <kpi.icon className="size-3.5 text-white" />
            </div>
            {/* Values */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70 truncate">{kpi.label}</p>
              <h3 className="text-base font-black tracking-tight leading-tight">
                {isLoading ? <span className="opacity-50 animate-pulse">...</span> : kpi.val}
              </h3>
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* Executive Analytics Section - Combined Rotating Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
        {/* Slot 1: Financial Analytics (Rotating) */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden border border-slate-100/50 group/slot">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50 border-b border-slate-100 px-6">
            <div className="space-y-1 text-left">
              <CardTitle className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
                <div className="size-2 rounded-full bg-indigo-500 animate-pulse" />
                {rotationIndex === 0 && "Financial Pulse & Momentum"}
                {rotationIndex === 1 && "Daily Revenue Velocity"}
                {rotationIndex === 2 && "Profitability Trajectory"}
              </CardTitle>
              <CardDescription className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">
                {rotationIndex === 0 && "Revenue vs Expense Analysis"}
                {rotationIndex === 1 && "Last 30 days cashflow speed"}
                {rotationIndex === 2 && "Net margin efficiency tracking"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
               {[0, 1, 2].map((i) => (
                 <button 
                  key={i}
                  onClick={() => setRotationIndex(i)}
                  className={cn(
                    "size-1.5 rounded-full transition-all duration-500",
                    rotationIndex === i ? "bg-indigo-600 w-4" : "bg-slate-200"
                  )}
                 />
               ))}
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-64 w-full pr-4 relative min-w-0">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                   <Activity className="size-8 text-primary/30 animate-pulse" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {rotationIndex === 0 ? (
                    <AreaChart data={summary?.trends.map(t => ({ ...t, net: Math.max(0, t.rev - t.exp) })) || []}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8', fontFamily: 'Inter, sans-serif' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8', fontFamily: 'Inter, sans-serif' }} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold', fontFamily: 'Inter, sans-serif' }} />
                      <Area type="monotone" dataKey="rev" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      <Area type="monotone" dataKey="exp" stroke="#818cf8" strokeWidth={2} fillOpacity={0} />
                    </AreaChart>
                  ) : rotationIndex === 1 ? (
                    <BarChart data={summary?.dailyTrends || []}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 600, fill: '#94a3b8' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v/1000}k`} />
                       <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rba(0,0,0,0.1)' }} />
                       <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={summary?.trends.map(t => ({ ...t, net: Math.max(0, t.rev - t.exp) })) || []}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v/1000}k`} />
                       <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                       <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Slot 2: Operational Analytics (Rotating) */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden border border-slate-100/50 group/slot">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50 border-b border-slate-100 px-6">
            <div className="space-y-1 text-left">
              <CardTitle className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500" />
                {rotationIndex === 0 && "Trending Services Revenue"}
                {rotationIndex === 1 && "Asset Utilization Deck"}
                {rotationIndex === 2 && "Strategic Customer Matrix"}
              </CardTitle>
              <CardDescription className="text-[10px] font-medium text-slate-400 capitalize">
                {rotationIndex === 0 && "Product category performance"}
                {rotationIndex === 1 && "Machine workload distribution"}
                {rotationIndex === 2 && "Revenue contribution by client"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
               {[0, 1, 2].map((i) => (
                 <button 
                  key={i}
                  onClick={() => setRotationIndex(i)}
                  className={cn(
                    "size-1.5 rounded-full transition-all duration-500",
                    rotationIndex === i ? "bg-emerald-600 w-4" : "bg-slate-200"
                  )}
                 />
               ))}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 w-full min-w-0">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                   <Activity className="size-8 text-primary/30 animate-pulse" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {rotationIndex === 0 ? (
                    <LineChart data={summary?.productTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8', fontFamily: 'Inter, sans-serif' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8', fontFamily: 'Inter, sans-serif' }} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold', fontFamily: 'Inter, sans-serif' }} />
                      <Line type="monotone" dataKey="offset" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="digital" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="flex" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  ) : rotationIndex === 1 ? (
                    <PieChart>
                      <Pie
                        data={summary?.machineUsage || []}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(summary?.machineUsage || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <BarChart layout="vertical" data={summary?.topCustomers || []}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f8fafc" />
                       <XAxis type="number" axisLine={false} tickLine={false} hide />
                       <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} width={100} />
                       <Tooltip cursor={{ fill: 'transparent' }} />
                       <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Strategic Hubs (Dual Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
        
        {/* Left: Partner Hub */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden border border-slate-100/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50 border-b border-slate-100 px-6">
            <div className="space-y-1 text-left">
              <CardTitle className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                {rotationIndex === 0 && "Strategic Partner Leaderboard (Top 10)"}
                {rotationIndex === 1 && "Daily Revenue Velocity (Momentum)"}
                {rotationIndex === 2 && "Client Market Contribution"}
              </CardTitle>
              <CardDescription className="text-[10px] font-medium text-slate-400 capitalize">
                {rotationIndex === 0 && "Client performance matrix: Revenue impact vs Job volume"}
                {rotationIndex === 1 && "Live revenue trajectory - Last 30 days"}
                {rotationIndex === 2 && "Enterprise contribution distribution"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
               {[0, 1, 2].map((i) => (
                 <button key={i} onClick={() => setRotationIndex(i)} className={cn("size-1.5 rounded-full transition-all duration-500", rotationIndex === i ? "bg-blue-600 w-4" : "bg-slate-200")} />
               ))}
            </div>
          </CardHeader>
          <CardContent className="pt-8 px-6">
            <div className="h-64 w-full relative min-w-0">
               {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl">
                     <Activity className="size-10 text-primary/20 animate-spin" />
                  </div>
               ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {rotationIndex === 0 ? (
                    <BarChart layout="vertical" data={summary?.topCustomers || []} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '15px', border: 'none' }} />
                      <Bar dataKey="revenue" name="revenue" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={20} />
                      <Bar dataKey="jobCount" name="jobCount" fill="#10b981" radius={[0, 10, 10, 0]} barSize={12} />
                    </BarChart>
                  ) : rotationIndex === 1 ? (
                    <AreaChart data={summary?.dailyTrends || []}>
                      <defs>
                        <linearGradient id="purpleJagged2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={4} fillOpacity={1} fill="url(#purpleJagged2)" />
                    </AreaChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={summary?.topCustomers || []}
                        cx="50%"
                        cy="45%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="revenue"
                        nameKey="name"
                        minAngle={15}
                        isAnimationActive={false}
                        label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                         {(summary?.topCustomers || []).map((_, index) => (
                           <Cell key={`cell-${index}`} fill={["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444", "#3b82f6"][index % 7]} />
                         ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(4px)'
                        }} 
                      />
                      <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
               )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Inventory & Assets intelligence Hub */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden border border-slate-100/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-orange-50/50 border-b border-orange-100 px-6">
            <div className="space-y-1 text-left">
              <CardTitle className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
                <div className="size-2 rounded-full bg-orange-500 animate-pulse" />
                {rotationIndex === 0 && "Critical Stock Deficit Tracker"}
                {rotationIndex === 1 && "Resource Utilization Matrix"}
                {rotationIndex === 2 && "Material Consumption Momentum"}
              </CardTitle>
              <CardDescription className="text-[10px] font-medium text-orange-400 capitalize">
                {rotationIndex === 0 && "Materials below safety threshold"}
                {rotationIndex === 1 && "Productivity / Efficiency across machine types"}
                {rotationIndex === 2 && "Projected vs Actual raw material flow"}
              </CardDescription>
            </div>
            <div className="bg-orange-500/10 p-2 rounded-xl">
               <Package className="size-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-8 px-6">
            <div className="h-64 w-full relative min-w-0">
               {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl">
                     <Activity className="size-10 text-orange-200 animate-spin" />
                  </div>
               ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {rotationIndex === 0 ? (
                    <BarChart data={summary?.stockAlerts || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff7ed" />
                      <XAxis dataKey="itemName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9a3412' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9a3412' }} />
                      <Tooltip contentStyle={{ borderRadius: '15px' }} />
                      <Bar dataKey="currentStock" name="Current Stock" fill="#f97316" radius={[6, 6, 0, 0]} barSize={25} />
                      <Bar dataKey="minLevel" name="Min Level" fill="#fed7aa" radius={[6, 6, 0, 0]} barSize={15} />
                    </BarChart>
                  ) : rotationIndex === 1 ? (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={summary?.machineUsage || []}>
                      <PolarGrid stroke="#f9731633" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#9a3412' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name="Efficiency" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  ) : (
                    <AreaChart data={summary?.dailyTrends || []}>
                      <defs>
                        <linearGradient id="orangeJagged" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={3} fill="url(#orangeJagged)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
               )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VIP Customers Table -> Recent Jobs */}
        <Can I="view" a="production">
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl border border-slate-100 group hover:shadow-primary/5 transition-all duration-500">
            <CardHeader className="bg-slate-50/30 px-6 py-3 space-y-2">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <TrendingUp className="size-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 font-bold text-base leading-none">
                      Shop Floor Status
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-0.5">
                      Live Efficiency
                    </CardDescription>
                  </div>
                </div>
                <div className="flex-1 max-w-[200px] relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-primary/40" />
                  <Input
                    placeholder="Search machines..."
                    className="h-8 pl-9 bg-white border-primary/10 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus-visible:ring-primary/10 transition-all"
                    value={machineSearch}
                    onChange={(e) => setMachineSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="relative sm:hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-primary/40" />
                <Input
                  placeholder="Search machines..."
                  className="h-8 pl-9 bg-white border-primary/10 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus-visible:ring-primary/10 transition-all"
                  value={machineSearch}
                  onChange={(e) => setMachineSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto scrollbar-thin">
              <Table className="min-w-[400px]">
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100">
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 pl-6 tracking-widest">
                      Job Identity
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 tracking-widest">
                      Customer
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 tracking-widest text-right pr-6">
                      Operational Stage
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary?.recentJobs.map((job) => (
                    <TableRow
                      key={job.jobNumber}
                      className="hover:bg-emerald-50/20 transition-all duration-300 border-slate-50 group/row"
                    >
                      <TableCell className="py-4 font-bold text-slate-800 pl-6 group-hover/row:text-emerald-600 transition-colors uppercase text-xs truncate max-w-[120px]">
                        {job.jobNumber}
                      </TableCell>
                      <TableCell className="py-4 font-bold text-slate-600 truncate max-w-[150px] uppercase text-[10px]">
                        {job.customerName}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <Badge className="text-[9px] font-bold uppercase bg-indigo-50 text-indigo-600 border-none shadow-sm px-3 h-5 rounded-full">
                          {job.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!summary || summary.recentJobs.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-10 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                      >
                        No Active Job Cards Discovered
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Can>

        {/* Defaulters Table -> Critical Stock */}
        <Can I="view" a="inventory">
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl border border-slate-100 group hover:shadow-orange-500/5 transition-all duration-500">
            <CardHeader className="bg-orange-50 px-6 py-5 space-y-3">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-orange-900 font-bold text-xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10">
                      <Package className="size-5 text-orange-600" />
                    </div>
                    Inventory Alerts
                  </CardTitle>
                  <CardDescription className="text-orange-600/50 font-bold text-[10px] uppercase tracking-[0.15em] ml-11">
                    Replenishment needed
                  </CardDescription>
                </div>
                <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-white shadow-sm text-orange-600 border border-slate-100">
                  <AlertTriangle className="size-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto scrollbar-thin">
              <Table className="min-w-[400px]">
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100">
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 pl-6 tracking-widest">
                      Material
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 tracking-widest text-right">
                      Available
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 tracking-widest text-right pr-6">
                      Protocol
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary?.stockAlerts.map((item) => (
                    <TableRow
                      key={item.itemName}
                      className="hover:bg-orange-50/20 transition-all duration-300 border-slate-50 group/row"
                    >
                      <TableCell className="py-4 font-bold text-slate-700 pl-6 truncate max-w-[150px] uppercase text-[10px]">
                        {item.itemName}
                      </TableCell>
                      <TableCell className="py-4 font-bold text-right tabular-nums text-xs">
                        {item.currentStock}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <Badge className="text-[9px] font-bold uppercase bg-rose-500 text-white border-none shadow-sm px-4 h-5 rounded-full animate-pulse">
                          REORDER
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!summary || summary.stockAlerts.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-10 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                      >
                        Inventory Levels Stabilized
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Can>
      </div>

      {/* Material Analytics Section - Smooth & Premium */}
      <Can I="view" a="reports">
        <Card className="border-none shadow-2xl bg-white rounded-2xl overflow-hidden group hover:shadow-indigo-500/5 transition-all duration-500">
          <CardHeader className="px-6 py-4 bg-indigo-50/30 border-b border-slate-100 flex flex-col items-stretch justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
              <div className="space-y-1">
                <CardTitle className="text-slate-900 font-bold text-lg sm:text-xl flex items-center gap-3">
                  <div className="p-1.5 rounded-xl bg-indigo-500/10 shadow-sm shrink-0">
                    <BarChart3 className="size-4 sm:size-5 text-indigo-600" />
                  </div>
                  Inventory & Material Analytics
                </CardTitle>
                <CardDescription className="text-slate-400 font-bold text-[8px] uppercase tracking-widest ml-10 sm:ml-12">
                  Consumption patterns & forecasting
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SearchableSelect
                  options={[
                    { value: "All Materials", label: "ALL MATERIALS" },
                    { value: "Paper", label: "PAPER STOCKS" },
                    { value: "Media", label: "MEDIA STOCKS" },
                    { value: "Ink", label: "INK & TONER" },
                  ]}
                  value={inventoryCategory}
                  onValueChange={setInventoryCategory}
                  placeholder="Select Category"
                  className="h-8 sm:h-9 w-full sm:w-[130px] bg-slate-50 border-none rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                />

                <SearchableSelect
                  options={[
                    { value: "Monthly View", label: "MONTHLY" },
                    { value: "Weekly View", label: "WEEKLY" },
                    { value: "Yearly View", label: "YEARLY" },
                  ]}
                  value={inventoryTimeframe}
                  onValueChange={setInventoryTimeframe}
                  placeholder="Select Timeframe"
                  className="h-8 sm:h-9 w-[48%] sm:w-[120px] bg-slate-50 border-none rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                />

                <Tabs
                  value={inventoryChartType}
                  onValueChange={(v: any) => setInventoryChartType(v)}
                  className="bg-slate-100 p-0.5 rounded-lg h-8 sm:h-9 w-[48%] sm:w-auto"
                >
                  <TabsList className="bg-transparent border-0 gap-1 w-full flex">
                    <TabsTrigger
                      value="bar"
                      className="flex-1 text-[8px] sm:text-[10px] font-bold uppercase h-7 sm:h-8 px-2 sm:px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Bar
                    </TabsTrigger>
                    <TabsTrigger
                      value="area"
                      className="flex-1 text-[8px] sm:text-[10px] font-bold uppercase h-7 sm:h-8 px-2 sm:px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Area
                    </TabsTrigger>
                    <TabsTrigger
                      value="line"
                      className="flex-1 text-[8px] sm:text-[10px] font-bold uppercase h-7 sm:h-8 px-2 sm:px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Line
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Stats Summary Panel - Live Data */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 h-full">
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-100/50 flex flex-col justify-center">
                    <span className="text-[9px] font-bold uppercase text-orange-400 tracking-widest font-sans mb-1">
                      Critical Stock
                    </span>
                    <h3 className="text-xl font-bold text-orange-700">
                      {summary?.stockAlerts.filter(i => i.currentStock <= i.minLevel).length || 0}
                    </h3>
                    <p className="text-[8px] font-bold text-orange-600/60 uppercase tracking-tighter mt-1">
                      Items below safety limit
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100/50 flex flex-col justify-center">
                    <span className="text-[9px] font-bold uppercase text-indigo-400 tracking-widest font-sans mb-1">
                      Total SKUs
                    </span>
                    <h3 className="text-xl font-bold text-indigo-700">
                      {summary?.stockAlerts.length || 0}
                    </h3>
                    <p className="text-[8px] font-bold text-indigo-600/60 uppercase tracking-tighter mt-1">
                      Active Material Tracking
                    </p>
                  </div>
                  <div className="hidden sm:flex p-3 rounded-xl bg-emerald-50 border border-emerald-100/50 flex-col justify-center">
                    <span className="text-[9px] font-bold uppercase text-emerald-400 tracking-widest font-sans mb-1">
                      Healthy Stock
                    </span>
                    <h3 className="text-xl font-bold text-emerald-700">
                       {summary?.stockAlerts.filter(i => i.currentStock > i.minLevel).length || 0}
                    </h3>
                    <p className="text-[8px] font-bold text-emerald-600/60 uppercase tracking-tighter mt-1">
                      In-stock & Available
                    </p>
                  </div>
                </div>
              </div>

              {/* Inventory Consumption Chart */}
              <div className="md:col-span-3 h-64 w-full mt-2 sm:mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  {inventoryChartType === "bar" ? (
                    <BarChart
                      data={summary?.stockAlerts || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="itemName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 10, fontWeight: 800 }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                          fontWeight: "bold",
                        }}
                      />
                      <Bar dataKey="currentStock" radius={[6, 6, 0, 0]} barSize={40}>
                        {(summary?.stockAlerts || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={cn(
                              index % 2 === 0 ? "var(--primary)" : "#6366f1",
                            )}
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : inventoryChartType === "area" ? (
                    <AreaChart
                      data={summary?.stockAlerts || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorUsage"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--primary)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--primary)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="itemName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 10, fontWeight: 800 }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                          fontWeight: "bold",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="currentStock"
                        stroke="var(--primary)"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorUsage)"
                      />
                    </AreaChart>
                  ) : (
                    <LineChart
                      data={summary?.stockAlerts || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="itemName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 10, fontWeight: 800 }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                          fontWeight: "bold",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="currentStock"
                        stroke="var(--primary)"
                        strokeWidth={4}
                        dot={{
                          r: 6,
                          fill: "var(--primary)",
                          strokeWidth: 3,
                          stroke: "#fff",
                        }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </Can>



      {/* Bottom Insight Row - Table View */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 1. Machine Status & Efficiency Table */}
        <Can I="view" a="production">
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl border border-slate-100 group hover:shadow-slate-500/5 transition-all duration-500">
            <CardHeader className="bg-slate-50 px-6 py-5 space-y-3">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 font-bold text-xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100">
                      <Gauge className="size-5 text-slate-600" />
                    </div>
                    Shop Floor Status
                  </CardTitle>
                  <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] ml-11">
                    Live efficiency metrics
                  </CardDescription>
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
              <Table className="min-w-[400px]">
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100">
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 pl-6 tracking-widest">
                      Machine Name
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 tracking-widest">
                      Live Meter
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 tracking-widest text-center">
                      Load
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 tracking-widest">
                      Status
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 text-right pr-6 tracking-widest">
                      Efficiency
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedMachines.map((m) => (
                    <TableRow
                      key={m.id}
                      className="hover:bg-slate-50 transition-all duration-300 border-slate-50 group/row"
                    >
                      <TableCell className="py-4 font-bold text-slate-700 pl-6 group-hover/row:text-primary transition-colors">
                        {m.name}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900 tabular-nums">
                            {m.currentMeter}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                            Impression Count
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                          {m.load}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase border-none h-6 px-3 rounded-full",
                            m.status === "Running"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-slate-100 text-slate-400",
                          )}
                        >
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6 w-[120px]">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[10px] font-bold text-slate-900">
                            {m.efficiency}
                          </span>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000 ease-out"
                              style={{ width: m.efficiency }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalMachinePages > 1 && (
                <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Page {machinePage} of {totalMachinePages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-lg bg-white shadow-sm disabled:opacity-30"
                      onClick={() => setMachinePage(p => Math.max(1, p - 1))}
                      disabled={machinePage === 1}
                    >
                      <ChevronDown className="size-4 rotate-90" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-lg bg-white shadow-sm disabled:opacity-30"
                      onClick={() => setMachinePage(p => Math.min(totalMachinePages, p + 1))}
                      disabled={machinePage === totalMachinePages}
                    >
                      <ChevronDown className="size-4 -rotate-90" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Can>

        {/* 2. Critical Inventory Tracking Table */}
        <Can I="view" a="inventory">
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl border border-slate-100 group hover:shadow-orange-500/5 transition-all duration-500">
            <CardHeader className="bg-orange-50/30 px-6 py-3 space-y-2">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-orange-500/10">
                    <Package className="size-4 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 font-bold text-base leading-none">
                      Inventory Alerts
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-0.5">
                      Stock Replenishment
                    </CardDescription>
                  </div>
                </div>
                <div className="flex-1 max-w-[200px] relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-orange-400" />
                  <Input
                    placeholder="Search materials..."
                    className="h-8 pl-9 bg-white border-orange-100 rounded-xl text-xs font-bold text-orange-700 placeholder:text-orange-200 focus-visible:ring-orange-500/10 transition-all"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="relative sm:hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-orange-400" />
                <Input
                  placeholder="Search materials..."
                  className="h-8 pl-9 bg-white border-orange-100 rounded-xl text-xs font-bold text-orange-700 placeholder:text-orange-200 focus-visible:ring-orange-500/10 transition-all"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto scrollbar-thin">
              <Table className="min-w-[400px]">
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100">
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 pl-6 tracking-widest">
                      Material Name
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 tracking-widest">
                      Stock Left
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 text-right pr-6 tracking-widest">
                      Urgency
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedInventory.map((item: any) => (
                    <TableRow
                      key={item.itemName}
                      className="hover:bg-slate-50 transition-all duration-300 border-slate-50 group/row"
                    >
                      <TableCell className="py-4 font-bold text-slate-700 pl-6 group-hover/row:text-orange-600 transition-colors">
                        {item.itemName}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900 tabular-nums">
                            {item.currentStock}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                            Units Remaining
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase border-none px-3 h-6 rounded-full group-hover/row:scale-105 transition-transform",
                            item.currentStock <= item.minLevel
                              ? "bg-rose-500 text-white animate-pulse shadow-rose-500/20 shadow-lg"
                              : "bg-orange-500 text-white shadow-orange-500/20 shadow-lg",
                          )}
                        >
                          {item.currentStock <= item.minLevel
                            ? "CRITICAL"
                            : "LOW"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalInventoryPages > 1 && (
                <div className="bg-orange-50/20 px-6 py-3 border-t border-orange-100/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                    Page {inventoryPage} of {totalInventoryPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-lg bg-white shadow-sm disabled:opacity-30 border-orange-100"
                      onClick={() => setInventoryPage(p => Math.max(1, p - 1))}
                      disabled={inventoryPage === 1}
                    >
                      <ChevronDown className="size-4 rotate-90" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-lg bg-white shadow-sm disabled:opacity-30 border-orange-100"
                      onClick={() => setInventoryPage(p => Math.min(totalInventoryPages, p + 1))}
                      disabled={inventoryPage === totalInventoryPages}
                    >
                      <ChevronDown className="size-4 -rotate-90" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Can>
      </div>

      {/* 3. Maintenance Accountability Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <Can I="view" a="production">
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl border border-slate-100 group hover:shadow-indigo-500/5 transition-all duration-500">
            <CardHeader className="bg-indigo-50/30 px-6 py-2 space-y-2">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10">
                    <ShieldCheck className="size-4 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 font-bold text-base leading-none">
                      Maintenance Tasks
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-0.5">
                      Staff Accountability
                    </CardDescription>
                  </div>
                </div>
                <div className="flex-1 max-w-[200px] relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-indigo-400/40" />
                  <Input
                    placeholder="Search tasks..."
                    className="h-8 pl-9 bg-white border-indigo-100 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus-visible:ring-indigo-500/10 transition-all"
                    value={maintenanceSearch}
                    onChange={(e) => setMaintenanceSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="relative sm:hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-indigo-400/40" />
                <Input
                  placeholder="Search tasks..."
                  className="h-8 pl-9 bg-white border-indigo-100 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus-visible:ring-indigo-500/10 transition-all"
                  value={maintenanceSearch}
                  onChange={(e) => setMaintenanceSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto scrollbar-thin">
              <Table className="min-w-[400px]">
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100">
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 pl-6 tracking-widest">
                      Task Protocol
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 tracking-widest text-center">
                      Assignee
                    </TableHead>
                    <TableHead className="py-4 font-bold uppercase text-[10px] text-slate-400 text-right pr-6 tracking-widest">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedMaintenance.map((task: any) => (
                    <TableRow
                      key={task.id}
                      className="hover:bg-indigo-50/20 transition-all duration-300 border-slate-50 group/row"
                    >
                      <TableCell className="py-2.5 pl-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 group-hover/row:text-indigo-600 transition-colors">
                            {task.taskName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                            Frequency: Standard
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 font-bold text-slate-500 text-center text-xs">
                        {task.assignedTo}
                      </TableCell>
                      <TableCell className="py-2.5 text-right pr-6">
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase border-none px-3 h-6 rounded-full",
                            task.status === "OVERDUE"
                              ? "bg-rose-500/10 text-rose-600 shadow-sm shadow-rose-500/10"
                              : task.status === "CRITICAL"
                                ? "bg-rose-500 text-white animate-pulse shadow-rose-500/20 shadow-lg"
                                : task.status === "PENDING"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-emerald-500/10 text-emerald-600",
                          )}
                        >
                          {task.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalMaintenancePages > 1 && (
                <div className="bg-indigo-50/20 px-6 py-3 border-t border-indigo-100/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Page {maintenancePage} of {totalMaintenancePages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-lg bg-white shadow-sm disabled:opacity-30 border-indigo-100"
                      onClick={() => setMaintenancePage(p => Math.max(1, p - 1))}
                      disabled={maintenancePage === 1}
                    >
                      <ChevronDown className="size-4 rotate-90" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-lg bg-white shadow-sm disabled:opacity-30 border-indigo-100"
                      onClick={() => setMaintenancePage(p => Math.min(totalMaintenancePages, p + 1))}
                      disabled={maintenancePage === totalMaintenancePages}
                    >
                      <ChevronDown className="size-4 -rotate-90" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Can>

        {/* Quick Info Card - Premium Smooth Version */}
        <Can I="view" a="production">
          <div className="relative group overflow-hidden rounded-2xl">
            {/* Background with subtle gradient and glow */}
            <div className="absolute inset-0 bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950" />
            <div className="absolute -top-24 -right-24 size-48 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors duration-700" />

            <Card className="bg-transparent border-none shadow-2xl rounded-2xl p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-4 sm:space-y-6 relative z-10">
              <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="size-10 sm:size-12 text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Awaiting Maintenance Data
                </h3>
                <p className="text-slate-400 text-[10px] sm:text-xs font-medium max-w-[280px] sm:max-w-[320px] mx-auto leading-relaxed">
                  System analytics will generate an accountability score as
                  maintenance operations are performed.{" "}
                  <span className="text-emerald-400 font-bold">
                    Stay proactive!
                  </span>
                </p>
              </div>

              <Button
                asChild
                className="h-10 sm:h-11 px-6 sm:px-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-[9px] sm:text-[11px] uppercase tracking-[0.15em] gap-2 sm:gap-3 shadow-[0_10px_20px_-5px_rgba(255,255,255,0.1)] active:scale-95 transition-all w-full sm:w-auto"
              >
                <Link href="/maintenance">
                  View Full Audit Report{" "}
                  <ArrowRight className="size-3 sm:size-3.5" />
                </Link>
              </Button>
            </Card>
          </div>
        </Can>
      </div>
    </div>
  );
}
