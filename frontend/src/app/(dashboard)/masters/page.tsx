"use client"

import React, { useState } from "react"
import { 
    UserCircle, 
    Gauge, 
    Boxes, 
    Maximize2, 
    Users2, 
    Cog, 
    Users, 
    UserCog, 
    Settings, 
    Tag,
    Search,
    ChevronRight,
    Database,
    ArrowUpRight,
    ShieldCheck,
    Briefcase,
    Zap,
    Layers,
    Warehouse,
    Truck,
    CreditCard,
    Cpu,
    Fingerprint,
    ListChecks
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const masterItems = [
    { 
        title: "Customers", 
        description: "Client CRM & Profiles", 
        url: "/customers", 
        icon: UserCircle, 
        category: "Sales",
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    { 
        title: "Machine Master", 
        description: "Equipment Registry", 
        url: "/machines", 
        icon: Gauge, 
        category: "Production",
        color: "text-indigo-600",
        bg: "bg-indigo-50"
    },
    { 
        title: "Suppliers", 
        description: "Vendor Management", 
        url: "/inventory/suppliers", 
        icon: Truck, 
        category: "Supply",
        color: "text-emerald-600",
        bg: "bg-emerald-50"
    },
    { 
        title: "Paper Stocks", 
        description: "Raw Paper Inventory", 
        url: "/inventory/paper-stocks", 
        icon: Boxes, 
        category: "Stocks",
        color: "text-amber-600",
        bg: "bg-amber-50"
    },
    { 
        title: "Media Stocks", 
        description: "Flex & Large Format", 
        url: "/inventory/media-stocks", 
        icon: Maximize2, 
        category: "Stocks",
        color: "text-orange-600",
        bg: "bg-orange-50"
    },
    { 
        title: "Processes", 
        description: "Workflow Calibration", 
        url: "/management/processes", 
        icon: Cpu, 
        category: "Config",
        color: "text-slate-600",
        bg: "bg-slate-100"
    },
    { 
        title: "User Master", 
        description: "Staff & Accounts", 
        url: "/management/users", 
        icon: Users, 
        category: "Admin",
        color: "text-violet-600",
        bg: "bg-violet-50"
    },
    { 
        title: "Role Master", 
        description: "Security Levels", 
        url: "/management/roles", 
        icon: ShieldCheck, 
        category: "Admin",
        color: "text-rose-600",
        bg: "bg-rose-50"
    },
    { 
        title: "Expenses", 
        description: "Financial Categories", 
        url: "/finance/categories", 
        icon: Tag, 
        category: "Finance",
        color: "text-cyan-600",
        bg: "bg-cyan-50"
    },
    { 
        title: "Global Config", 
        description: "ERP Parameters", 
        url: "/settings", 
        icon: Settings, 
        category: "System",
        color: "text-slate-500",
        bg: "bg-slate-50"
    },
    { 
        title: "Dropdown Master", 
        description: "Dynamic Lists & Statuses", 
        url: "/settings/dropdowns", 
        icon: ListChecks, 
        category: "Config",
        color: "text-orange-600",
        bg: "bg-orange-50"
    },
]

export default function MastersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState("All")

    const categories = ["All", ...Array.from(new Set(masterItems.map(item => item.category)))]

    const filteredItems = masterItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === "All" || item.category === activeCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="space-y-6 pb-12">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary text-white shadow-sm">
                            <Database className="size-5" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                            Master <span className="text-primary">Registry</span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Find master..." 
                            className="h-10 pl-10 rounded-xl border-slate-200 bg-white text-xs font-bold shadow-sm transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 px-1">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "whitespace-nowrap rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all border",
                            activeCategory === cat 
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Optimized Compact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {filteredItems.map((item, index) => (
                    <Link key={item.title} href={item.url} className="group">
                        <Card className="h-full border border-slate-100 shadow-sm bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative active:scale-95 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl">
                            {/* Accent Background */}
                            <div className={cn("absolute -top-10 -right-10 size-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500", item.bg)} />
                            
                            <div className={cn("mb-4 p-4 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm", item.bg, item.color)}>
                                <item.icon className="size-6 sm:size-7" />
                            </div>
                            
                            <div className="space-y-1 z-10">
                                <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold leading-tight line-clamp-2">
                                    {item.description}
                                </p>
                            </div>

                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

        </div>
    )
}
