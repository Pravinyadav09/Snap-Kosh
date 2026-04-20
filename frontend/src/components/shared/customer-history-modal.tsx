"use client"

import React, { useEffect, useState } from "react"
import {
    History,
    FileText,
    CircleDollarSign,
    Calendar,
    ShieldCheck,
    Loader2,
    X,
    ArrowUpRight,
    ArrowDownLeft,
    Receipt,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API_BASE } from "@/lib/api"
import { format } from "date-fns"

interface LedgerEntry {
    date: string
    refNo: string
    type: "Invoice" | "Payment"
    description: string
    debit: number
    credit: number
    status: string
}

interface HistoryItemProps {
    date: string
    title: string
    amount: number
    status: string
    type: "Invoice" | "Payment"
    refNo: string
}

const HistoryItem = ({ date, title, amount, status, type, refNo }: HistoryItemProps) => (
    <div className="flex items-center justify-between p-3 rounded-md bg-white border border-slate-100 hover:border-slate-200 transition-all group font-sans">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${type === 'Invoice' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {type === 'Invoice' ? <Receipt className="h-3.5 w-3.5" /> : <CircleDollarSign className="h-3.5 w-3.5" />}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-800 leading-none mb-1">{title}</p>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" /> {format(new Date(date), "dd MMM yyyy")}
                    </p>
                    <span className="text-[10px] text-slate-200">|</span>
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                        REF: {refNo}
                    </p>
                </div>
            </div>
        </div>
        <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1">
                {type === 'Payment' ? <ArrowDownLeft className="h-3 w-3 text-emerald-500" /> : <ArrowUpRight className="h-3 w-3 text-rose-500" />}
                <p className={`text-xs font-bold tabular-nums ${type === 'Payment' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    ₹{amount.toLocaleString()}
                </p>
            </div>
            <Badge variant="outline" className={`text-[8px] font-bold uppercase px-1.5 h-4 border-none ${
                status === 'Paid' || status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
            }`}>
                {status}
            </Badge>
        </div>
    </div>
)

interface CustomerHistoryProps {
    customerId: string | number
    customerName: string
    trigger?: React.ReactNode
}

export function CustomerHistoryModal({ customerId, customerName, trigger }: CustomerHistoryProps) {
    const [entries, setEntries] = useState<LedgerEntry[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        if (open && customerId) {
            fetchLedger()
        }
    }, [open, customerId])

    useEffect(() => {
        setCurrentPage(1)
    }, [activeTab])

    const fetchLedger = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/portal/ledger/${customerId}`)
            if (res.ok) {
                const data = await res.json()
                setEntries(data)
            }
        } catch (error) {
            console.error("Failed to fetch ledger", error)
        } finally {
            setIsLoading(false)
        }
    }

    const totalDebit = entries.reduce((sum, item) => sum + item.debit, 0)
    const totalCredit = entries.reduce((sum, item) => sum + item.credit, 0)
    const netBalance = totalDebit - totalCredit

    // Filtering and Pagination
    const filteredEntries = [...entries].reverse().filter(item => {
        if (activeTab === "invoices") return item.type === "Invoice"
        if (activeTab === "payments") return item.type === "Payment"
        return true
    })

    const totalPages = Math.ceil(filteredEntries.length / pageSize)
    const paginatedEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="h-8 border border-slate-200 rounded-md font-bold text-[10px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans">
                        <History className="h-3.5 w-3.5 text-[var(--primary)]" /> Account Ledger
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="max-w-[calc(100%-1rem)] sm:max-w-[750px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[90vh] flex flex-col font-sans">
                <DialogHeader className="px-5 py-4 text-left border-b border-slate-100 bg-white relative shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                            <History className="h-4 w-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-800 leading-none uppercase tracking-tight flex items-center gap-2">
                                {customerName} <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm font-medium border border-slate-200">ID: #{customerId}</span>
                            </DialogTitle>
                            <DialogDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Financial Transparency Ledger</DialogDescription>
                        </div>
                    </div>
                    <DialogClose asChild>
                        <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors">
                            <X className="h-4 w-4 text-slate-500" />
                        </Button>
                    </DialogClose>
                </DialogHeader>

                <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-3 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-md">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Billable</p>
                        <p className="text-base font-black text-slate-900 tabular-nums leading-none">₹{totalDebit.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-md">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Received</p>
                        <p className="text-base font-black text-emerald-600 tabular-nums leading-none">₹{totalCredit.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 border rounded-md ${netBalance > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${netBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>Net Exposure</p>
                        <div className="flex items-center gap-1.5">
                            <p className={`text-base font-black tabular-nums leading-none ${netBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                ₹{Math.abs(netBalance).toLocaleString()}
                            </p>
                            <span className={`text-[9px] font-black uppercase px-1 rounded-sm ${netBalance > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {netBalance > 0 ? 'DUE' : 'CR'}
                            </span>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="px-5 border-b bg-white flex items-center justify-between shrink-0">
                        <TabsList className="bg-transparent h-12 p-0 gap-4">
                            <TabsTrigger value="all" className="h-8 rounded-md data-[state=active]:bg-slate-900 data-[state=active]:text-white text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 transition-all border border-transparent data-[state=active]:border-slate-800">All Records</TabsTrigger>
                            <TabsTrigger value="invoices" className="h-8 rounded-md data-[state=active]:bg-slate-900 data-[state=active]:text-white text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 transition-all border border-transparent data-[state=active]:border-slate-800">Billing</TabsTrigger>
                            <TabsTrigger value="payments" className="h-8 rounded-md data-[state=active]:bg-slate-900 data-[state=active]:text-white text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 transition-all border border-transparent data-[state=active]:border-slate-800">Payments</TabsTrigger>
                        </TabsList>
                        
                        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--primary)]" />}
                    </div>

                    <ScrollArea className="flex-1 min-h-0 bg-white">
                        <div className="p-4 space-y-2">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="h-14 w-full bg-slate-50 animate-pulse rounded-md" />
                                ))
                            ) : paginatedEntries.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-slate-50 text-slate-200">
                                        <History size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">No records found</p>
                                        <p className="text-[10px] text-slate-400 font-medium font-sans">No data available for this filter or page.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        {paginatedEntries.map((item, idx) => (
                                            <HistoryItem 
                                                key={idx}
                                                date={item.date}
                                                title={item.description}
                                                amount={item.type === 'Invoice' ? item.debit : item.credit}
                                                status={item.status}
                                                type={item.type}
                                                refNo={item.refNo}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </Tabs>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0 font-sans">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${netBalance > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Financial Position</p>
                            <p className="text-sm font-black tracking-tight mt-0.5">
                                ₹{Math.abs(netBalance).toLocaleString()} 
                                <span className={`text-[9px] uppercase ml-1.5 font-bold ${netBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {netBalance > 0 ? 'Pending Collection' : 'Account Settled / Credit'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {filteredEntries.length > pageSize && (
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-md bg-white border-slate-200"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 text-slate-600" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-md bg-white border-slate-200"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4 text-slate-600" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
