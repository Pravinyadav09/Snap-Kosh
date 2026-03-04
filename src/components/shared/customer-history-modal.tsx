"use client"

import React from "react"
import {
    History,
    FileText,
    CircleDollarSign,
    Clock,
    Printer,
    ArrowUpRight,
    User,
    Calendar,
    Contact,
    ShieldCheck
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface HistoryItemProps {
    date: string
    title: string
    amount: number
    status: string
    type: "job" | "payment"
}

const HistoryItem = ({ date, title, amount, status, type }: HistoryItemProps) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-all group">
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${type === 'job' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {type === 'job' ? <FileText className="h-4 w-4" /> : <CircleDollarSign className="h-4 w-4" />}
            </div>
            <div>
                <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="h-2 w-2" /> {date}
                </p>
            </div>
        </div>
        <div className="text-right">
            <p className={`text-sm font-black tracking-tighter ${type === 'payment' ? 'text-emerald-600' : 'text-slate-900'}`}>
                {type === 'payment' ? '+' : ''}₹{amount.toLocaleString()}
            </p>
            <Badge className="text-[9px] font-black uppercase tracking-widest px-2 h-4 border-none bg-slate-200 text-slate-600">
                {status}
            </Badge>
        </div>
    </div>
)

interface CustomerHistoryProps {
    customerName: string
    trigger?: React.ReactNode
}

export function CustomerHistoryModal({ customerName, trigger }: CustomerHistoryProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="border font-black text-[10px] uppercase tracking-widest rounded-xl gap-2" style={{ background: 'var(--sidebar-accent)', borderColor: 'var(--border)', color: 'var(--primary)' }}>
                        <History className="h-3.5 w-3.5" /> View Kundli
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white font-sans">
                <DialogHeader className="px-10 pt-10 pb-6 text-left border-b text-white shrink-0" style={{ background: 'var(--primary)' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white">
                                <History className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                                    {customerName} <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold opacity-80 decoration-none">Customer #412</span>
                                </DialogTitle>
                                <DialogDescription className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100 mt-0.5">
                                    Complete Business History & Analytics Ledger
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-100 mb-1 opacity-60">Total Business</p>
                            <p className="text-xl font-black tracking-tighter">₹24,500</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-100 mb-1 opacity-60">Jobs Logged</p>
                            <p className="text-xl font-black tracking-tighter">18 Tickets</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-500/30 border border-emerald-400/30">
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100 mb-1">Loyalty Rating</p>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-2 w-4 rounded-full bg-emerald-400" />)}
                                <div className="h-2 w-4 rounded-full bg-emerald-400/20" />
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="all" className="flex-1 flex flex-col">
                    <div className="px-10 border-b bg-slate-50/50">
                        <TabsList className="bg-transparent h-12 p-0 gap-6">
                            <TabsTrigger value="all" className="h-10 rounded-full data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 transition-all">All Records</TabsTrigger>
                            <TabsTrigger value="jobs" className="h-10 rounded-full data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 transition-all">Recent Jobs</TabsTrigger>
                            <TabsTrigger value="payments" className="h-10 rounded-full data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 transition-all">Payments</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 max-h-[400px]">
                        <div className="p-8 pb-32">
                            <TabsContent value="all" className="m-0 space-y-3">
                                <HistoryItem date="02 Mar 2026" title="Cash Received (Hand to Hand)" amount={5000} status="Success" type="payment" />
                                <HistoryItem date="28 Feb 2026" title="Pamphlet Printing (A4 Size)" amount={1450} status="Closed" type="job" />
                                <HistoryItem date="25 Feb 2026" title="Glow Sign Board Fitting" amount={8400} status="Completed" type="job" />
                                <HistoryItem date="20 Feb 2026" title="Online Transfer (GPay)" amount={2500} status="Success" type="payment" />
                                <HistoryItem date="15 Feb 2026" title="Visiting Card (300 GSM)" amount={650} status="Invoiced" type="job" />
                            </TabsContent>
                            <TabsContent value="jobs" className="m-0 space-y-3">
                                <HistoryItem date="28 Feb 2026" title="Pamphlet Printing (A4 Size)" amount={1450} status="Closed" type="job" />
                                <HistoryItem date="25 Feb 2026" title="Glow Sign Board Fitting" amount={8400} status="Completed" type="job" />
                            </TabsContent>
                            <TabsContent value="payments" className="m-0 space-y-3">
                                <HistoryItem date="02 Mar 2026" title="Cash Received (Hand to Hand)" amount={5000} status="Success" type="payment" />
                                <HistoryItem date="20 Feb 2026" title="Online Transfer (GPay)" amount={2500} status="Success" type="payment" />
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>

                <div className="absolute bottom-0 w-full p-8 pt-10 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
                    <div className="pointer-events-auto bg-slate-900 text-white p-5 rounded-3xl flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <ShieldCheck className="h-5 w-5 text-indigo-300" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 opacity-80 leading-tight">Current Net Status</p>
                                <p className="text-lg font-black tracking-tighter mt-0.5">₹1,135 <span className="text-[10px] text-rose-400 uppercase ml-1 italic font-black">Hold: Payment Overdue</span></p>
                            </div>
                        </div>
                        <Button className="h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white" style={{ background: 'var(--primary)' }}>
                            Download Ledger
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
