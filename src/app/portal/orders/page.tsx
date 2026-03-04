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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order #</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="group hover:bg-slate-50/30 transition-all border-b border-slate-100 last:border-0">
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">{order.id}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-bold text-slate-600 uppercase">{order.date}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <Badge className="bg-slate-200 text-slate-600 border-none font-bold text-[9px] uppercase tracking-tighter h-5 px-3">
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-black text-slate-800">{order.total}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <Button size="sm" variant="outline" className="h-8 px-4 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-[10px] uppercase tracking-wider shadow-sm">
                                            View
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
