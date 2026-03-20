"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const orders = [
    { id: "ORD-YDK6I8QORO", date: "13 Feb, 2026", status: "Received", total: "₹2,297.46" },
]

export default function OrdersPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase tracking-wider">My Orders</h1>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Order #</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.map(order => (
                                <tr key={order.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-[var(--primary)] hover:underline cursor-pointer">{order.id}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-slate-600 tabular-nums uppercase">{order.date}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[9px] uppercase tracking-wider h-6 px-4 rounded-full">
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-slate-900 tracking-tight">{order.total}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Button size="sm" variant="outline" className="h-9 px-6 rounded-full border-slate-200 text-slate-600 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95">
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
