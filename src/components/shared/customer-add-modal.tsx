"use client"

import React, { useState } from "react"
import {
    UserPlus,
    ShieldCheck,
    Smartphone,
    Building2,
    MapPin,
    Wallet,
    Globe,
    Info,
    CheckCircle2
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { StateSelect } from "./state-select"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface CustomerAddModalProps {
    onSuccess?: (customerName: string) => void
    trigger?: React.ReactNode
}

export function CustomerAddModal({ onSuccess, trigger }: CustomerAddModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [state, setState] = useState("")

    const handleRegister = () => {
        toast.success("Client Registered", {
            description: "New customer has been added successfully.",
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        })
        setIsOpen(false)
        if (onSuccess) onSuccess("New Customer Name")
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="h-9 px-4 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans">
                        <UserPlus className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Add Customer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[85vh] flex flex-col">
                <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                            <UserPlus className="h-4 w-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">New Customer Profile</DialogTitle>
                            <DialogDescription className="text-[10px] text-slate-400 font-medium">Create a new organizational record</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-6 py-6 space-y-6">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Info className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organizational Profile</span>
                                </div>
                                <Badge variant="outline" className="text-[9px] font-bold uppercase bg-slate-50 text-slate-600 border-slate-200 px-2 rounded-sm">
                                    AUTOID-2026
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Company Name <span className="text-rose-500">*</span></Label>
                                    <Input placeholder="Enter company legal name" className="h-9 border-slate-200 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all rounded-md" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Contact Person <span className="text-rose-500">*</span></Label>
                                    <Input placeholder="Primary Contact Name" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Phone Number <span className="text-rose-500">*</span></Label>
                                    <Input placeholder="+91 XXXXX XXXXX" className="h-9 border-slate-200 bg-white font-bold text-sm rounded-md" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Email Address</Label>
                                    <Input type="email" placeholder="official@company.com" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Tax & Financials */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tax & Financial Defaults</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-md border border-slate-100">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">GSTIN Number</Label>
                                    <Input placeholder="Tax Registration ID" className="h-9 border-slate-200 bg-white font-bold text-sm uppercase rounded-md" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Opening Balance (₹)</Label>
                                    <Input type="number" placeholder="0.00" className="h-9 border-slate-200 bg-white font-bold text-sm rounded-md" />
                                    <p className="text-[9px] text-slate-400 font-medium">Positive: Receivable, Negative: Payable</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Address Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Address</span>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Address Line 1</Label>
                                    <Input placeholder="Street, Building, Area" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">City</Label>
                                        <Input placeholder="City" className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">State <span className="text-rose-500">*</span></Label>
                                        <StateSelect 
                                            value={state} 
                                            onValueChange={setState} 
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Pincode</Label>
                                        <Input placeholder="6-digit" maxLength={6} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800 shrink-0">Discard</Button>
                    <Button
                        onClick={handleRegister}
                        className="h-9 px-6 md:px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95 whitespace-nowrap"
                        style={{ background: 'var(--primary)' }}
                    >
                        Create Customer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
