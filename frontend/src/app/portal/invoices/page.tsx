"use client"
import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, IndianRupee, Clock, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem("portal_customer")
        if (stored) {
            const cust = JSON.parse(stored)
            fetchInvoices(cust.id)
        } else {
            window.location.href = "/portal/login"
        }
    }, [])

    const fetchInvoices = async (id: number) => {
        setLoading(true)
        try {
            const response = await fetch(`${API_BASE}/api/portal/my-invoices/${id}`)
            if (response.ok) {
                const data = await response.json()
                setInvoices(data || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none uppercase tracking-wider">Financial Ledgers</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Historical Invoices & Payment Status</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Invoice #</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={`skel-${i}`} className="border-b border-slate-50/50">
                                        <td className="px-8 py-6"><Skeleton className="h-4 w-24 bg-slate-100" /></td>
                                        <td className="px-8 py-6"><Skeleton className="h-4 w-20 bg-slate-50" /></td>
                                        <td className="px-8 py-6"><Skeleton className="h-4 w-20 bg-slate-50" /></td>
                                        <td className="px-8 py-6 text-center"><Skeleton className="h-6 w-16 mx-auto bg-slate-100 rounded-full" /></td>
                                        <td className="px-8 py-6"><Skeleton className="h-4 w-16 bg-slate-100" /></td>
                                        <td className="px-8 py-6 text-right"><Skeleton className="h-8 w-8 ml-auto bg-slate-50 rounded-xl" /></td>
                                    </tr>
                                ))
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Invoices Found In System Vault</p>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map(invoice => (
                                    <tr key={invoice.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[var(--primary)] group-hover:border-[var(--primary)]/20 transition-all">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-800">{invoice.invoiceNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-500 tabular-nums">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-500 tabular-nums">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <Badge className={`border-none font-bold text-[9px] uppercase tracking-wider h-6 px-4 rounded-full ${
                                                invoice.paymentStatus === 'Paid' 
                                                ? 'bg-emerald-50 text-emerald-600' 
                                                : 'bg-rose-50 text-rose-600'
                                            }`}>
                                                {invoice.paymentStatus === 'Paid' ? (
                                                    <span className="flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" /> PAID</span>
                                                ) : (
                                                    <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {invoice.paymentStatus || 'UNPAID'}</span>
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-900 tracking-tight">₹{invoice.grandTotal?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
