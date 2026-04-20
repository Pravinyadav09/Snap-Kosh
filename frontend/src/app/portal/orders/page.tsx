"use client"
import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, Suspense } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { cn } from "@/lib/utils"
import { useSearchParams, useRouter } from "next/navigation"
import { 
    ArrowLeft, 
    FileText, 
    Truck, 
    MapPin, 
    CreditCard, 
    Printer,
    Download,
    Package,
    Check
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function OrdersPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading Orders...</div>}>
            <OrdersContent />
        </Suspense>
    )
}

function OrdersContent() {

    const searchParams = useSearchParams()
    const router = useRouter()
    const selectedId = searchParams.get("id")
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [customer, setCustomer] = useState<any>(null)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    useEffect(() => {
        const stored = localStorage.getItem("portal_customer")
        if (stored) {
            const cust = JSON.parse(stored)
            setCustomer(cust)
            fetchOrders(cust.id)
        } else {
            window.location.href = "/portal/login"
        }
    }, [])

    useEffect(() => {
        if (selectedId && orders.length > 0) {
            const found = orders.find(o => o.id === selectedId)
            setSelectedOrder(found)
        } else {
            setSelectedOrder(null)
        }
    }, [selectedId, orders])

    const orderColumns: ColumnDef<any>[] = [
        { 
            key: "id", 
            label: "Order #",
            render: (val) => (
                <Link href={`/portal/orders?id=${val}`} className="text-xs font-black text-[var(--primary)] hover:underline cursor-pointer">
                    #{val}
                </Link>
            ),
            filterable: true,
            sortable: true
        },
        { 
            key: "date", 
            label: "Date",
            render: (val) => <span className="text-xs font-bold text-slate-500 tabular-nums uppercase">{val}</span>,
            sortable: true
        },
        { 
            key: "status", 
            label: "Status",
            render: (val) => (
                <Badge className={`border-none font-bold text-[9px] uppercase tracking-wider h-6 px-4 rounded-full ${
                    val === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                    val === 'In Production' ? 'bg-amber-50 text-amber-600' :
                    val === 'Pending' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                    {val}
                </Badge>
            ),
            filterable: true
        },
        { 
            key: "total", 
            label: "Total Amount",
            render: (val) => <span className="text-xs font-black text-slate-900 tracking-tight">{val}</span>,
            sortable: true
        },
        {
            key: "actions",
            label: "Action",
            render: (_, row) => (
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-9 px-6 rounded-full border-slate-200 font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 text-slate-600 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)]"
                    asChild
                >
                    <Link href={`/portal/orders?id=${row.id}`}>View Job Card</Link>
                </Button>
            )
        }
    ]

    const fetchOrders = async (id: number) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/api/portal/jobs/${id}`)
            if (response.ok) {
                const data = await response.json()
                const mappedOrders = (data || []).map((job: any) => ({
                    id: job.jobNumber,
                    date: new Date(job.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: job.status,
                    isApproved: job.isApproved,
                    total: `₹${(job.totalCost || 0).toLocaleString()}`,
                    rawCost: job.totalCost || 0,
                    service: job.jobName || "Standard Printing",
                    paperSize: job.paperSize,
                    paperType: job.paperType,
                    bookDetails: job.bookDetails,
                    quantity: job.quantity,
                    rate: job.rate,
                    designFilePath: job.designFilePath
                }))
                setOrders(mappedOrders)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    if (selectedOrder) {
        const igst = selectedOrder.rawCost * 0.18;
        const grandTotal = selectedOrder.rawCost + igst;
        const statusSteps = ["Pending", "In Production", "Completed", "Delivered"];
        const currentStep = statusSteps.indexOf(selectedOrder.status) !== -1 ? statusSteps.indexOf(selectedOrder.status) : 0;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.push('/portal/orders')}
                        className="w-fit p-0 hover:bg-transparent text-slate-500 hover:text-slate-900 group flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Back to History</span>
                    </Button>
                    <div className="flex items-center gap-2">
                        {selectedOrder.designFilePath && (
                            <Button variant="outline" className="h-9 px-4 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border-primary/10">
                                <Download className="h-3.5 w-3.5 mr-2" /> Download Design
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Order #{selectedOrder.id}</h1>
                            <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Placed on {selectedOrder.date}</p>
                        </div>
                        <Badge className="h-7 px-5 rounded-full bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest shadow-sm">
                            {selectedOrder.status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-primary" /> Billing Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="space-y-0.5">
                                        <p className="font-black text-slate-900 text-sm uppercase">{customer?.companyName}</p>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-[300px] uppercase">
                                            {customer?.address || "Registered Business Address Not Provided"}
                                        </p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 space-y-1">
                                        <p className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                                            <span className="font-black text-slate-900 tracking-tight">GST:</span> {customer?.gstNumber || "Unregistered"}
                                        </p>
                                        <p className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                                            <span className="font-black text-slate-900 tracking-tight">ID:</span> {customer?.phone}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <Truck className="h-3.5 w-3.5 text-orange-500" /> Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                     <div className="space-y-0.5">
                                        <p className="font-black text-slate-900 text-sm uppercase">{customer?.contactPerson}</p>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-[300px] uppercase">
                                            {customer?.address || "Primary Unit Site Location"}
                                        </p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 space-y-1">
                                         <p className="text-[11px] font-medium text-slate-400 flex items-center gap-2 font-sans italic">
                                            Self-Pickup / Logistics Delivery Mode
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden uppercase font-sans">
                         <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Package className="h-3.5 w-3.5 text-blue-500" /> Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Job Specification</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Qty</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Unit Rate</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Ext. Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr>
                                            <td className="px-6 py-6">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 tracking-tight uppercase leading-tight">{selectedOrder.service}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-1 tracking-wider">REF: {selectedOrder.id}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedOrder.paperSize && <Badge variant="outline" className="bg-white text-[8px] font-bold uppercase tracking-widest border-slate-100 px-2 h-5 text-slate-500">SIZE: {selectedOrder.paperSize}</Badge>}
                                                        {selectedOrder.paperType && <Badge variant="outline" className="bg-white text-[8px] font-bold uppercase tracking-widest border-slate-100 px-2 h-5 text-slate-500">PAPER: {selectedOrder.paperType}</Badge>}
                                                        {selectedOrder.bookDetails && <Badge variant="outline" className="bg-white text-[8px] font-bold uppercase tracking-widest border-slate-100 px-2 h-5 text-slate-500">{selectedOrder.bookDetails}</Badge>}
                                                    </div>

                                                    <div className="pt-4 flex flex-col gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-all",
                                                                selectedOrder.designFilePath ? "border-primary/20 bg-primary/5 text-primary" : "border-slate-100 bg-slate-50 text-slate-300"
                                                            )}>
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Front Design Asset</span>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                    {selectedOrder.designFilePath ? "Production Ready File Attached" : "Awaiting Design Upload"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {selectedOrder.designFilePath ? (
                                                            <div className="space-y-4">
                                                                {/* Image Preview if it's an image */}
                                                                {(selectedOrder.designFilePath.toLowerCase().endsWith('.png') || 
                                                                  selectedOrder.designFilePath.toLowerCase().endsWith('.jpg') || 
                                                                  selectedOrder.designFilePath.toLowerCase().endsWith('.jpeg')) && (
                                                                    <div className="relative group w-fit">
                                                                        <img 
                                                                            src={`${API_BASE}/${selectedOrder.designFilePath}`} 
                                                                            alt="Design Preview" 
                                                                            className="h-32 w-auto bg-slate-100 rounded-2xl border border-slate-200 shadow-sm group-hover:shadow-md transition-all cursor-zoom-in"
                                                                            onClick={() => window.open(`${API_BASE}/${selectedOrder.designFilePath}`, '_blank')}
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-all" />
                                                                    </div>
                                                                )}
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    className="h-9 px-6 rounded-full border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                                                    onClick={() => window.open(`${API_BASE}/${selectedOrder.designFilePath}`, '_blank')}
                                                                >
                                                                    <Download className="h-3.5 w-3.5 mr-2" /> View & Download Design
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                disabled
                                                                className="h-9 px-6 rounded-full border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-300 italic cursor-not-allowed"
                                                            >
                                                                <Package className="h-3.5 w-3.5 mr-2" /> No Design Attached
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center align-top pt-8 font-black text-sm text-slate-600">{selectedOrder.quantity || '1'}</td>
                                            <td className="px-6 py-6 text-right align-top pt-8 font-black text-sm text-slate-600">₹{(selectedOrder.rate || selectedOrder.rawCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-6 text-right align-top pt-8 font-black text-sm text-slate-900">₹{selectedOrder.rawCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-slate-50/50 p-8 flex justify-end">
                                <div className="w-[300px] space-y-4">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span className="uppercase tracking-[0.15em]">Subtotal</span>
                                        <span className="text-slate-900 tabular-nums">₹{selectedOrder.rawCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span className="uppercase tracking-[0.15em]">IGST (18%)</span>
                                        <span className="text-slate-900 tabular-nums">₹{igst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span className="uppercase tracking-[0.15em]">Logistics</span>
                                        <span className="text-emerald-500 tabular-nums uppercase">Free</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
                                        <span className="font-black text-slate-900 uppercase tracking-[0.2em]">Grand Total</span>
                                        <span className="font-black text-slate-900 text-lg tracking-tight tabular-nums">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none uppercase tracking-wider">My Orders</h1>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden p-4">
                <DataGrid 
                    data={orders}
                    columns={orderColumns}
                    isLoading={isLoading}
                    title="Order History"
                    searchPlaceholder="Search orders..."
                    pageSizeOptions={[10, 25, 50]}
                    initialPageSize={10}
                />
            </div>
        </div>
    )
}
