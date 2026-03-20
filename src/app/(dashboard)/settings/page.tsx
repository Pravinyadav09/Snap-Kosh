"use client"

import React, { useState } from "react"
import {
    Globe,
    Building2,
    Camera,
    CreditCard,
    CheckCircle2,
    Landmark
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const Switch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
            checked ? "bg-primary" : "bg-slate-200"
        )}
        style={checked ? { backgroundColor: 'var(--primary)' } : {}}
    >
        <span
            className={cn(
                "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-all duration-200",
                checked ? "translate-x-4" : "translate-x-0.5"
            )}
        />
    </button>
)

export default function SettingsPage() {
    const [enableGst, setEnableGst] = useState(true)

    const handleSave = () => {
        toast.success("Settings Saved", {
            description: "System configuration has been updated successfully."
        })
    }

    return (
        <div className="space-y-4 font-sans bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans italic uppercase">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">System Settings</h1>
                </div>
                <Button className="h-11 px-6 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl gap-2 active:scale-95 w-full sm:w-auto" style={{ background: 'var(--primary)' }} onClick={handleSave}>
                    <CheckCircle2 className="h-4 w-4" /> Save Configuration
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="bg-white p-1 h-10 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar justify-start sm:justify-center">
                    <TabsTrigger
                        value="general"
                        className="rounded-md px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 transition-all h-8 shrink-0"
                        style={{ ['--active-bg' as any]: 'var(--primary)' }}
                    >
                        <Globe className="h-3.5 w-3.5 mr-2" /> General
                    </TabsTrigger>
                    <TabsTrigger
                        value="billing"
                        className="rounded-md px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 transition-all h-8 shrink-0"
                        style={{ ['--active-bg' as any]: 'var(--primary)' }}
                    >
                        <CreditCard className="h-3.5 w-3.5 mr-2" /> Billing
                    </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="mt-0">
                    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-semibold text-slate-800">Site Configuration</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Global identity settings for the ERP portal.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Site Title</Label>
                                    <Input defaultValue="Ganesha Prints" className="h-9 rounded-md border-slate-200 bg-white text-sm font-medium text-slate-800" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Currency Symbol</Label>
                                    <Input defaultValue="₹" className="h-9 rounded-md border-slate-200 bg-white text-sm font-medium text-slate-800" />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600">Site Logo</Label>
                                        <div className="flex items-center gap-4 border border-dashed border-slate-200 rounded-md p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <div className="h-12 w-12 rounded-md bg-white border shadow-sm flex items-center justify-center shrink-0">
                                                <span className="text-2xl">🐘</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:border-blue-300">
                                                <Camera className="h-3 w-3 text-blue-500" /> Choose File
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600">Favicon</Label>
                                        <div className="flex items-center gap-4 border border-dashed border-slate-200 rounded-md p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <div className="h-10 w-10 rounded-md bg-white border shadow-sm flex items-center justify-center shrink-0">
                                                <span className="text-lg">🐘</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:border-blue-300">
                                                <Camera className="h-3 w-3 text-blue-500" /> Choose File
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing" className="mt-0 space-y-4">
                    {/* Company Details */}
                    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-800">Company Details</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Registered Office Address</Label>
                                <Textarea
                                    defaultValue={`SF-37,\nGaur City Center,\nGreater Noida Extention`}
                                    className="min-h-[70px] rounded-md border-slate-200 bg-white text-sm font-medium resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Company State</Label>
                                    <Input defaultValue="Uttar Pradesh" className="h-9 rounded-md border-slate-200 bg-white text-sm font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Company Email</Label>
                                    <Input defaultValue="info@ganeshasoftwares" className="h-9 rounded-md border-slate-200 bg-white text-sm font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Company Phone</Label>
                                    <Input defaultValue="+(91) 9540046568" className="h-9 rounded-md border-slate-200 bg-white text-sm font-medium" />
                                </div>
                            </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">GST Number</Label>
                                    <Input defaultValue="27ABCDE1234F2Z5" className="h-9 rounded-md border-slate-200 bg-white text-sm font-bold uppercase tracking-wider" />
                                </div>
                        </div>
                    </div>

                    {/* Invoice Configuration */}
                    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-800">Invoice Configuration</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Invoice Prefix</Label>
                                    <Input defaultValue="INV-" className="h-9 rounded-md border-slate-200 bg-white text-sm font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Invoice Start Number</Label>
                                    <Input defaultValue="1001" className="h-9 rounded-md border-slate-200 bg-white text-sm font-medium" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <Landmark className="h-4 w-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-800">Bank Details (For Invoices)</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Bank Name</Label>
                                    <Input defaultValue="Oriental Bank Of Commerce" className="h-9 rounded-md border-slate-200 bg-white text-sm font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Account Name</Label>
                                    <Input defaultValue="Ganesha Prints" className="h-9 rounded-md border-slate-200 bg-white text-sm font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Account Number</Label>
                                    <Input defaultValue="10012151004216" className="h-9 rounded-md border-slate-200 bg-white text-sm font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">IFSC Code</Label>
                                    <Input defaultValue="ORBC100121" className="h-9 rounded-md border-slate-200 bg-white text-sm font-bold uppercase" />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
