"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { API_BASE } from '@/lib/api'
import { toast } from 'sonner'
import { Wallet, History, AlertCircle, CheckCircle2, IndianRupee, ArrowRight } from 'lucide-react'
import { CustomerHistoryModal } from './customer-history-modal'

interface ClientPaymentStatusProps {
    customerId: string | number
    layout?: "vertical" | "horizontal"
}

export function ClientPaymentStatus({ customerId, layout = "vertical" }: ClientPaymentStatusProps) {
    const [status, setStatus] = useState<any>(null)
    const [ledgerSummary, setLedgerSummary] = useState({ totalDebit: 0, totalCredit: 0 })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!customerId) {
            setStatus(null)
            setLedgerSummary({ totalDebit: 0, totalCredit: 0 })
            return
        }

        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch customer basic info
                const custRes = await fetch(`${API_BASE}/api/Customers/${customerId}`)
                if (custRes.ok) {
                    const custData = await custRes.json()
                    setStatus(custData)
                }

                // Fetch ledger to calculate totals
                const ledgerRes = await fetch(`${API_BASE}/api/portal/ledger/${customerId}`)
                if (ledgerRes.ok) {
                    const entries = await ledgerRes.json()
                    const debit = entries.reduce((sum: number, item: any) => sum + (item.debit || 0), 0)
                    const credit = entries.reduce((sum: number, item: any) => sum + (item.credit || 0), 0)
                    setLedgerSummary({ totalDebit: debit, totalCredit: credit })
                }
            } catch (error) {
                console.error("Failed to fetch client financial data", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [customerId])

    if (!customerId) return null

    if (isLoading) {
        return (
            <Card className="border-2 border-dashed border-slate-100 bg-slate-50/50 rounded-2xl animate-pulse">
                <CardContent className="h-20 flex items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Intelligence...</span>
                </CardContent>
            </Card>
        )
    }

    if (!status) return null

    const balance = status.netBalance || 0
    const isNegative = balance < 0
    const isZero = balance === 0

    if (layout === "horizontal") {
        return (
            <div className={`overflow-hidden border transition-all duration-500 hover:shadow-md ${
                isNegative ? 'border-emerald-100 bg-emerald-50/30' : 
                isZero ? 'border-slate-100 bg-slate-50/50' : 
                'border-rose-100 bg-rose-50/30'
            } rounded-md relative group`}>
                <div className="absolute right-0 top-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    {isNegative ? <CheckCircle2 size={120} /> : <AlertCircle size={120} />}
                </div>
                <div className="p-3 sm:p-5 relative z-10">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 shrink-0 rounded-md flex items-center justify-center shadow-sm ${
                                isNegative ? 'bg-emerald-500 text-white' : 
                                isZero ? 'bg-slate-400 text-white' : 
                                'bg-rose-500 text-white'
                            }`}>
                                <IndianRupee className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ledger Authority</h4>
                                    <Badge variant="outline" className={`text-[8px] font-black uppercase border-none px-2 h-4 rounded-sm ${
                                        isNegative ? 'bg-emerald-500 text-white' : 
                                        isZero ? 'bg-slate-400 text-white' : 
                                        'bg-rose-500 text-white'
                                    }`}>
                                        {isNegative ? 'Vault Credit' : isZero ? 'Account Set' : 'Payment Overdue'}
                                    </Badge>
                                </div>
                                <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{status.companyName}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 xl:gap-12">
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest block">Total Billed</span>
                                <div className="text-sm font-black text-slate-900 tabular-nums">
                                    ₹{ledgerSummary.totalDebit.toLocaleString()}
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest block">Total Paid</span>
                                <div className="text-sm font-black text-emerald-600 tabular-nums">
                                    ₹{ledgerSummary.totalCredit.toLocaleString()}
                                </div>
                            </div>

                            <div className="h-10 w-[1px] bg-slate-200/60 hidden md:block" />

                            <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest block">{isNegative ? 'Advance Balance' : 'Outstanding Due'}</span>
                                <div className={`text-2xl font-black tabular-nums tracking-tighter flex items-baseline gap-1 ${
                                    isNegative ? 'text-emerald-600' : 
                                    isZero ? 'text-slate-600' : 
                                    'text-rose-600'
                                }`}>
                                    <span className="text-sm font-bold">₹</span>
                                    {Math.abs(balance).toLocaleString()}
                                </div>
                            </div>

                            <CustomerHistoryModal 
                                customerId={customerId} 
                                customerName={status.companyName}
                                trigger={
                                    <Button variant="ghost" className="h-12 px-6 rounded-md border border-slate-200/60 bg-white/50 hover:bg-white hover:shadow-sm transition-all flex flex-col items-start gap-0.5">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">View Data</span>
                                        <span className="text-[10px] font-black uppercase text-slate-900 flex items-center gap-1">
                                            Full Ledger <ArrowRight className="h-3 w-3" />
                                        </span>
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card className={`overflow-hidden border transition-all duration-300 ${
            isNegative ? 'border-emerald-100 bg-emerald-50/20' : 
            isZero ? 'border-slate-100 bg-slate-50/30' : 
            'border-rose-100 bg-rose-50/20'
        } rounded-md shadow-sm`}>
            <CardContent className="p-3 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-md ${
                            isNegative ? 'bg-emerald-100 text-emerald-600' : 
                            isZero ? 'bg-slate-100 text-slate-600' : 
                            'bg-rose-100 text-rose-600'
                        }`}>
                            <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none mb-1">Financial Intelligence</h4>
                            <p className="text-xs font-bold text-slate-900 truncate max-w-[150px] uppercase tracking-tight">{status.companyName}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className={`text-[8px] font-bold uppercase border-none px-2 h-5 rounded-sm ${
                        isNegative ? 'bg-emerald-100 text-emerald-700' : 
                        isZero ? 'bg-slate-100 text-slate-700' : 
                        'bg-rose-100 text-rose-700'
                    }`}>
                        {isNegative ? 'Credit' : isZero ? 'Settled' : 'Due'}
                    </Badge>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                        <div className="space-y-0.5">
                            <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter block mb-1">Outstanding Due</span>
                            <div className={`text-xl font-black tabular-nums tracking-tighter ${
                                isNegative ? 'text-emerald-600' : 
                                isZero ? 'text-slate-600' : 
                                'text-rose-600'
                            }`}>
                                ₹{Math.abs(balance).toLocaleString()}
                            </div>
                        </div>
                        <div className="text-right">
                           <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter block mb-1">Total Received</span>
                           <p className="text-xs font-black text-emerald-600">₹{ledgerSummary.totalCredit.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="space-y-0.5">
                                <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">Phone</span>
                                <p className="text-[10px] font-bold text-slate-700">{status.phone || 'N/A'}</p>
                            </div>
                            <div className="space-y-0.5 text-right">
                                <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">GST Reg.</span>
                                <p className="text-[10px] font-bold text-slate-700 truncate">{status.gstNumber || 'Unregistered'}</p>
                            </div>
                        </div>
                        
                        <div className="ml-4">
                            <CustomerHistoryModal 
                                customerId={customerId} 
                                customerName={status.companyName}
                                trigger={
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600">
                                        <History className="h-3.5 w-3.5" />
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
