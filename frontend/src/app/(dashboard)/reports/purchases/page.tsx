"use client"

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect } from "react"
import { 
    ShoppingCart, Users, 
    TrendingUp, TrendingDown,
    PieChart as PieChartIcon, 
    Download, Calendar, History,
    PackageSearch, Receipt,
    ArrowUpRight, ArrowDownRight,
    DollarSign, Package
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

type Purchase = {
    id: number
    supplierName: string
    totalAmount: number
    itemName: string
    status: string
    purchaseDate: string
}

export default function PurchaseAnalysisPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_BASE}/api/Purchases`)
            .then(res => res.json())
            .then(data => {
                setPurchases(data || [])
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0)
    const pendingCount = purchases.filter(p => p.status === 'Pending').length

    const vendorMap: Record<string, { spent: number; count: number }> = {}
    purchases.forEach(p => {
        const name = p.supplierName || 'Unknown Vendor'
        if (!vendorMap[name]) vendorMap[name] = { spent: 0, count: 0 }
        vendorMap[name].spent += p.totalAmount
        vendorMap[name].count += 1
    })

    const vendorSummary = Object.entries(vendorMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5)

    const formatCurrency = (val: number = 0) => `₹${(val || 0).toLocaleString()}`

    const columns: ColumnDef<Purchase>[] = [
        { key: "id", label: "PO ID", render: (v) => <span className="font-black text-slate-900">#{v}</span> },
        { key: "supplierName", label: "Vendor", render: (v) => <span className="font-bold text-slate-800">{v as string}</span> },
        { key: "itemName", label: "Material", render: (v) => <span className="text-xs font-bold text-slate-500">{v as string}</span> },
        { key: "totalAmount", label: "Spend", className: "text-right", render: (v) => <span className="font-black text-rose-600">{formatCurrency(v as number)}</span> },
        { key: "purchaseDate", label: "Date", render: (v) => <span className="text-[10px] font-bold text-slate-400">{new Date(v as string).toLocaleDateString()}</span> },
        { key: "status", label: "Status", className: "text-center", render: (v) => (
            <Badge className={v === 'Completed' ? "bg-emerald-500" : "bg-amber-500"}>{v as string}</Badge>
        )}
    ]

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 uppercase font-bold text-left">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl tracking-tight text-slate-900">Procurement Intelligence</h1>
                    <p className="text-[10px] text-muted-foreground tracking-widest px-0.5">Spend Optimization & Vendor Control</p>
                </div>
            </div>

            <Card className="border border-slate-100 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <DataGrid 
                        data={purchases} 
                        columns={columns} 
                        isLoading={loading}
                        hideTitle={true}
                        searchPlaceholder="Search POs, vendors, materials..." 
                    />
                </CardContent>
            </Card>
        </div>
    )
}
