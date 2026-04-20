"use client"

import React, { useState, useEffect } from "react"
import { 
    LifeBuoy, 
    MessageSquare, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Filter,
    ArrowRight,
    Loader2,
    Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataGrid, ColumnDef } from "@/components/shared/data-grid"
import { API_BASE } from "@/lib/api"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { toast } from "sonner"

interface SupportTicket {
    id: number
    customerId: number
    companyName?: string
    subject: string
    category: string
    description: string
    status: string
    priority: string
    createdAt: string
    adminComment?: string
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
    const [processData, setProcessData] = useState({
        status: "",
        comment: ""
    })
    const [isSaving, setIsSaving] = useState(false)

    const fetchTickets = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/admin/support/tickets`)
            if (res.ok) {
                const data = await res.json()
                setTickets(data)
            }
        } catch (err) {
            toast.error("Failed to load intelligence records")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [])

    const handleProcess = async () => {
        if (!selectedTicket || !processData.status) {
            toast.error("Completion parameters required")
            return
        }

        setIsSaving(true)
        try {
            const res = await fetch(`${API_BASE}/api/admin/support/tickets/${selectedTicket.id}/process`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(processData)
            })

            if (res.ok) {
                toast.success("Ticket resolution protocol completed")
                setIsProcessModalOpen(false)
                fetchTickets()
            }
        } catch (err) {
            toast.error("Processing relay failed")
        } finally {
            setIsSaving(false)
        }
    }

    const columns: ColumnDef<SupportTicket>[] = [
        {
            key: "id",
            label: "ID",
            render: (val) => <span className="font-mono text-[10px] font-bold text-slate-400">#TK-{val}</span>
        },
        {
            key: "companyName",
            label: "Organization",
            render: (val) => <span className="font-black text-slate-800 text-[11px] uppercase tracking-tight">{val || "Entity Unknown"}</span>
        },
        {
            key: "subject",
            label: "Intelligence / Subject",
            render: (val, item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700 text-[11px] line-clamp-1">{val}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Current Phase",
            render: (val) => {
                const colors: any = {
                    Open: "bg-emerald-50 text-emerald-600",
                    "In-Progress": "bg-amber-50 text-amber-600",
                    Resolved: "bg-blue-50 text-blue-600",
                    Closed: "bg-slate-100 text-slate-500",
                    Rejected: "bg-rose-50 text-rose-600"
                }
                return (
                    <Badge className={`h-5 text-[8px] font-black tracking-widest border-none px-3 rounded-full ${colors[val] || 'bg-slate-100'} shadow-none uppercase`}>
                        {val}
                    </Badge>
                )
            }
        },
        {
            key: "priority",
            label: "Severity",
            render: (val) => {
                const isHigh = val === 'High'
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg max-w-fit">
                        <div className={`h-1.5 w-1.5 rounded-full ${isHigh ? 'bg-rose-500 shadow-sm shadow-rose-500/50' : 'bg-slate-300'}`} />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{val}</span>
                    </div>
                )
            }
        },
        {
            key: "createdAt",
            label: "Recorded",
            render: (val) => <span className="text-[10px] font-bold text-slate-400 tabular-nums">{new Date(val).toLocaleDateString()}</span>
        },
        {
            key: "actions",
            label: "Remedy Command",
            render: (_, item) => (
                <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                        setSelectedTicket(item)
                        setProcessData({ status: item.status, comment: item.adminComment || "" })
                        setIsProcessModalOpen(true)
                    }}
                    className="h-8 group hover:bg-[var(--primary)] hover:text-white transition-all rounded-lg"
                >
                    <span className="text-[9px] font-black uppercase tracking-widest group-hover:mr-2 transition-all">Process</span>
                    <ArrowRight className="h-0 w-0 group-hover:h-3 group-hover:w-3 transition-all" />
                </Button>
            )
        }
    ]

    return (
        <div className="space-y-1 font-sans">
            <div className="flex flex-row items-center justify-between px-4 sm:px-1 gap-2 border-b border-slate-200 pb-2 mb-2 p-4 sm:p-6">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                        <LifeBuoy className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-slate-900 leading-none uppercase">Global Support Queue</h1>
                    </div>
                </div>
            </div>

            {/* ── Operational Grid ── */}
            <div className="bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm">
                <DataGrid 
                    columns={columns} 
                    data={tickets} 
                    isLoading={isLoading}
                    enableDateRange={true}
                    dateFilterKey="createdAt"
                    searchPlaceholder="Search ID, Organization, or Subject..."
                    hideTitle={true}
                />
            </div>

            {/* ── Remedy Logic Modal ── */}
            <Dialog open={isProcessModalOpen} onOpenChange={setIsProcessModalOpen}>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[750px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[92vh] flex flex-col font-sans">
                    <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                <Clock className="h-4 w-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-bold text-slate-800 leading-none">Resolution Protocol</DialogTitle>
                                <DialogDescription className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                                    <span>#TK-{selectedTicket?.id}</span>
                                    <Badge className="h-4 text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border-none rounded px-2">{selectedTicket?.status}</Badge>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                            <div className="md:col-span-2 p-6 bg-slate-50/50 border-r border-slate-100 space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Intelligence</h4>
                                    <div className="p-4 rounded-lg bg-white border border-slate-100 space-y-2 shadow-sm">
                                        <p className="text-xs font-bold text-slate-900 leading-tight uppercase mb-1">{selectedTicket?.subject}</p>
                                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">"{selectedTicket?.description}"</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Origin Information</h4>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <LifeBuoy className="h-3.5 w-3.5 text-[var(--primary)]" />
                                        <span className="text-[10px] font-bold uppercase">{selectedTicket?.companyName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-medium tabular-nums">{selectedTicket?.createdAt && new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-3 p-6 space-y-6">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Terminal Phase Update</Label>
                                    <SearchableSelect 
                                        options={[
                                            { value: "In-Progress", label: "I-1 Process Ongoing" },
                                            { value: "Resolved", label: "Resolution Sync (Solved)" },
                                            { value: "Rejected", label: "Reject Protocol" },
                                            { value: "Closed", label: "Archive & Close" }
                                        ]}
                                        value={processData.status} 
                                        onValueChange={(val: string) => setProcessData(prev => ({ ...prev, status: val }))}
                                        className="h-10 border-slate-100 bg-slate-50 font-semibold text-sm rounded-lg"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Administrative Comments</Label>
                                    <Textarea 
                                        placeholder="Internal resolution details for client..." 
                                        className="min-h-[160px] border-slate-100 bg-slate-50 font-medium text-sm rounded-lg leading-relaxed" 
                                        value={processData.comment}
                                        onChange={(e) => setProcessData(prev => ({ ...prev, comment: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/10 flex flex-row items-center justify-between">
                        <Button variant="ghost" onClick={() => setIsProcessModalOpen(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500">Abort Protocol</Button>
                        <Button 
                            onClick={handleProcess}
                            disabled={isSaving}
                            className="h-9 px-8 bg-slate-900 border-none text-white font-bold text-xs rounded-md shadow-sm flex items-center gap-2 transition-all active:scale-95"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            Sync Resolution
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
