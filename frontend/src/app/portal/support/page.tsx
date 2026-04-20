"use client"

import React, { useState, useEffect } from "react"
import { 
    MessageSquare, 
    LifeBuoy, 
    Search, 
    Plus, 
    Filter, 
    BadgeCheck, 
    Clock, 
    CheckCircle2, 
    Calendar,
    ArrowUpRight,
    Headset,
    Phone,
    Mail,
    Send,
    Loader2
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
    subject: string
    category: string
    description: string
    status: string
    priority: string
    createdAt: string
    updatedAt?: string
    adminComment?: string
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRaising, setIsRaising] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [newTicket, setNewTicket] = useState({
        subject: "",
        category: "General",
        priority: "Medium",
        description: ""
    })

    const fetchTickets = async () => {
        const stored = localStorage.getItem("portal_customer")
        if (!stored) return
        const customer = JSON.parse(stored)
        
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/portal/support/tickets/${customer.id}`)
            if (res.ok) {
                const data = await res.json()
                setTickets(data)
            }
        } catch (err) {
            toast.error("Failed to load records")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [])

    const handleRaiseTicket = async () => {
        const stored = localStorage.getItem("portal_customer")
        if (!stored) return
        const customer = JSON.parse(stored)

        if (!newTicket.subject || !newTicket.description) {
            toast.error("Required fields missing")
            return
        }

        setIsRaising(true)
        try {
            const res = await fetch(`${API_BASE}/api/portal/support/raise-ticket`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: customer.id,
                    ...newTicket
                })
            })

            if (res.ok) {
                toast.success("Intelligence recorded successfully")
                setIsDialogOpen(false)
                setNewTicket({ subject: "", category: "General", priority: "Medium", description: "" })
                fetchTickets()
            }
        } catch (err) {
            toast.error("Synchronization failed")
        } finally {
            setIsRaising(false)
        }
    }

    const columns: ColumnDef<SupportTicket>[] = [
        {
            key: "id",
            label: "ID",
            sortable: true,
            filterable: true,
            type: 'number',
            render: (val: any) => <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{val}</span>
        },
        {
            key: "subject",
            label: "Subject",
            sortable: true,
            filterable: true,
            render: (val: any, item: SupportTicket) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-[11px] truncate tracking-tight uppercase">{val}</span>
                    <span className="text-[9px] font-bold text-slate-400 capitalize">{item.category}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            filterable: true,
            render: (val: any) => {
                const colors: any = {
                    Open: "bg-emerald-50 text-emerald-600",
                    "In-Progress": "bg-amber-50 text-amber-600",
                    Resolved: "bg-blue-50 text-blue-600",
                    Closed: "bg-slate-100 text-slate-500"
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
            label: "Priority",
            sortable: true,
            filterable: true,
            render: (val: any) => (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg max-w-fit">
                    <div className={`h-1.5 w-1.5 rounded-full ${val === 'High' ? 'bg-rose-500 shadow-sm shadow-rose-500/50' : val === 'Medium' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{val}</span>
                </div>
            )
        },
        {
            key: "createdAt",
            label: "Raised On",
            sortable: true,
            filterable: true,
            type: 'date',
            render: (val: any) => <span className="text-[10px] font-bold text-slate-400 tabular-nums">{new Date(val).toLocaleDateString()}</span>
        },
        {
            key: "actions",
            label: "Actions",
            render: (val: any, item: SupportTicket) => (
                <Button 
                    onClick={() => { setViewTicket(item); setIsViewOpen(true); }}
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-4 rounded-lg border-slate-100 text-slate-600 font-black text-[8px] uppercase tracking-[0.2em] hover:bg-[var(--primary)] hover:text-white transition-all"
                >
                    View
                </Button>
            )
        }
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12 font-sans">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-white text-slate-900 border border-slate-100 flex items-center justify-center shadow-sm">
                        <LifeBuoy className="h-6 w-6 text-[var(--primary)]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading uppercase">Service Desk Workspace</h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Intelligence-led support & tickets</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95 whitespace-nowrap"
                        style={{ background: 'var(--primary)' }}
                    >
                        <Plus className="h-4 w-4" /> Raise New Ticket
                    </Button>
                </div>
            </div>

            {/* ── Support Dashboard Grid ── */}
            <div className="grid grid-cols-1 gap-6">
                {/* Tickets History */}
                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden p-0">
                    <CardContent className="p-4">
                        <DataGrid 
                            columns={columns} 
                            data={tickets} 
                            isLoading={isLoading}
                            enableSelection={true}
                            enableCardView={true}
                            enableDateRange={true}
                            title="Communication Intelligence Ledger"
                            searchPlaceholder="Search communication records..."
                        />
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[92vh] flex flex-col font-sans">
                    <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                <Plus className="h-4 w-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-bold text-slate-800 leading-none">Raise Intelligence Ticket</DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 font-medium mt-1">Official communication trace initialized for {new Date().toLocaleDateString()}</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="px-6 py-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Primary Subject</Label>
                                    <Input 
                                        placeholder="Brief summary of the issue..." 
                                        className="h-10 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Category Selection</Label>
                                        <SearchableSelect 
                                            options={[
                                                { value: "Design", label: "Design Revision" },
                                                { value: "Quality", label: "Quality Control" },
                                                { value: "Billing", label: "Billing & Sales" },
                                                { value: "Technical", label: "Technical Support" },
                                                { value: "General", label: "General Query" }
                                            ]}
                                            value={newTicket.category} 
                                            onValueChange={(val: string) => setNewTicket(prev => ({ ...prev, category: val }))}
                                            className="h-10 border-slate-200 bg-white font-medium text-sm rounded-md"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Operational Priority</Label>
                                        <SearchableSelect 
                                            options={[
                                                { value: "High", label: "H-1 Priority (Urgent)" },
                                                { value: "Medium", label: "Standard Priority" },
                                                { value: "Low", label: "Low - Deferred" }
                                            ]}
                                            value={newTicket.priority} 
                                            onValueChange={(val: string) => setNewTicket(prev => ({ ...prev, priority: val }))}
                                            className="h-10 border-slate-200 bg-white font-medium text-sm rounded-md"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Detailed intelligence Description</Label>
                                    <Textarea 
                                        placeholder="Provide complete context and specifications..." 
                                        className="min-h-[120px] border-slate-200 bg-white font-medium text-sm rounded-md leading-relaxed" 
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500">Discard</Button>
                        <Button 
                            onClick={handleRaiseTicket}
                            disabled={isRaising}
                            className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95 bg-slate-900"
                        >
                            {isRaising ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dispatch Ticket"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── View Ticket Details Modal ── */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[650px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[92vh] flex flex-col font-sans">
                    <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                                <div>
                                    <DialogTitle className="text-sm font-bold text-slate-800 leading-none">{viewTicket?.subject}</DialogTitle>
                                    <DialogDescription className="text-xs text-slate-500 font-medium mt-1">Intelligence Trace: #TK-{viewTicket?.id} • {viewTicket?.category}</DialogDescription>
                                </div>
                            </div>
                            <Badge className="h-5 text-[9px] font-bold tracking-wider uppercase rounded-md px-3 border-none bg-slate-100 text-slate-500">
                                {viewTicket?.status}
                            </Badge>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="px-6 py-6 space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recorded Intelligence (Description)</Label>
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed">
                                    {viewTicket?.description}
                                </div>
                            </div>

                            {viewTicket?.adminComment && (
                                <div className="p-5 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Administrative Resolution</h4>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                                        {viewTicket.adminComment}
                                    </p>
                                </div>
                            )}

                            {!viewTicket?.adminComment && viewTicket?.status !== 'Resolved' && (
                                <div className="p-5 rounded-lg bg-amber-50/30 border border-amber-100 flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    <div>
                                        <h4 className="text-[10px] font-bold text-amber-600 uppercase">Awaiting Analysis</h4>
                                        <p className="text-xs font-medium text-amber-800/60">Personnel are currently reviewing this intelligence trace.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Operational Priority</p>
                                    <p className="text-xs font-bold text-slate-800">{viewTicket?.priority} Priority</p>
                                 </div>
                                 <div className="space-y-1 text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Entry Timestamp</p>
                                    <p className="text-xs font-bold text-slate-800 tabular-nums">{viewTicket?.createdAt ? new Date(viewTicket.createdAt).toLocaleString() : '—'}</p>
                                 </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                        <Button onClick={() => setIsViewOpen(false)} className="h-9 px-8 bg-slate-900 border-none text-white font-bold text-xs rounded-md shadow-sm">
                            Exit Workspace
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
