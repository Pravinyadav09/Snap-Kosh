"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function ProfilePage() {
    const [customer, setCustomer] = React.useState<any>(null)

    React.useEffect(() => {
        const stored = localStorage.getItem("portal_customer")
        if (stored) {
            setCustomer(JSON.parse(stored))
        } else {
            window.location.href = "/portal/login"
        }
    }, [])

    if (!customer) return null

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none uppercase tracking-wider">My Profile</h1>
            </div>

            <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white p-8 space-y-10">
                {/* ── Business Details ── */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Business Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Company Name</Label>
                            <Input value={customer.companyName} readOnly className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GST Number</Label>
                            <Input value={customer.gstNumber || "N/A"} readOnly className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-slate-700 uppercase" />
                        </div>
                    </div>
                </div>

                {/* ── Communication ── */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Contact Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account ID / Mobile</Label>
                            <Input value={customer.phone} readOnly className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</Label>
                            <Input value={customer.email || "N/A"} readOnly className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-slate-700" />
                        </div>
                    </div>
                </div>

                {/* ── Security ── */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Security</h3>
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Portal Access Key</p>
                            <p className="text-[11px] font-medium text-slate-500 mt-1">Managed by account administrator - {customer.contactPerson}</p>
                        </div>
                        <Button 
                            variant="outline" 
                            className="bg-white border-slate-200 text-xs font-bold text-slate-600 rounded-xl"
                            onClick={() => window.location.href = "/portal/login"}
                        >
                            Sign Out Account
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
