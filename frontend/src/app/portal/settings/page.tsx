"use client"

import React, { useState, useEffect } from "react"
import { API_BASE } from '@/lib/api'
import { 
    Settings, 
    User, 
    Bell, 
    Palette, 
    Globe, 
    Save, 
    Camera, 
    RefreshCcw,
    Mail,
    Phone,
    Building2,
    CheckCircle2,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [customer, setCustomer] = useState<any>(null)
    const [notifications, setNotifications] = useState({
        notifyProductionMilestones: true,
        notifyPaymentReceipt: true,
        notifyCreditAlerts: false,
        notifyMonthlyDigest: false
    })

    useEffect(() => {
        const stored = localStorage.getItem("portal_customer")
        if (stored) {
            const parsed = JSON.parse(stored)
            setCustomer(parsed)
            fetchProfile(parsed.id)
        }
    }, [])

    const fetchProfile = async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/portal/profile/${id}`)
            if (res.ok) {
                const data = await res.json()
                setCustomer(data)
                setNotifications({
                    notifyProductionMilestones: data.notifyProductionMilestones,
                    notifyPaymentReceipt: data.notifyPaymentReceipt,
                    notifyCreditAlerts: data.notifyCreditAlerts,
                    notifyMonthlyDigest: data.notifyMonthlyDigest
                })
            }
        } catch (err) {}
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!customer) return

        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/portal/update-notifications/${customer.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notifications)
            })
            
            if (res.ok) {
                toast.success("Notification Preferences Synchronized Successfully")
            } else {
                toast.error("Failed to update preferences")
            }
        } catch (err) {
            toast.error("Server synchronization failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--primary)]/10">
                            <Settings className="h-4.5 w-4.5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading uppercase">Portal Configuration</h2>
                    </div>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="h-10 px-8 rounded-xl bg-[var(--primary)] text-white font-black text-[10px] tracking-widest uppercase shadow-md hover:shadow-lg transition-all" 
                    style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #3d1862 100%)' }}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="h-12 w-full max-w-xl bg-slate-50 border border-slate-100 p-1 rounded-xl mb-6">
                    <TabsTrigger value="profile" className="flex-1 h-full rounded-lg gap-2 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-sm transition-all">
                        <User className="h-3.5 w-3.5" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex-1 h-full rounded-lg gap-2 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-sm transition-all">
                        <Bell className="h-3.5 w-3.5" /> Notifications
                    </TabsTrigger>
                </TabsList>

                {/* ── Profile Customization ── */}
                <TabsContent value="profile" className="space-y-4">
                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/10">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group cursor-pointer hover:border-[var(--primary)]/20 transition-all relative">
                                    <Buildings2Icon className="h-7 w-7 text-slate-300 group-hover:text-[var(--primary)]" />
                                    <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-lg bg-white shadow-md border border-slate-50 flex items-center justify-center">
                                        <Camera className="h-3 w-3 text-slate-500" />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-lg font-black tracking-tight font-heading">{customer?.companyName || 'Enterprise Partner'}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="h-4 text-[8px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-500">Verified</Badge>
                                        <span className="text-[9px] font-bold text-slate-400 opacity-60 uppercase tracking-widest">ID: {customer?.Id || '002'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Primary Organization</Label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-[var(--primary)] transition-colors" />
                                        <Input defaultValue={customer?.companyName} className="h-10 pl-10 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-[var(--primary)]/20 placeholder:text-slate-400 font-bold transition-all text-sm shadow-sm" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Authorized Official</Label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-[var(--primary)] transition-colors" />
                                        <Input defaultValue={customer?.contactPerson} className="h-10 pl-10 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-[var(--primary)]/20 placeholder:text-slate-400 font-bold transition-all text-sm shadow-sm" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Official Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-[var(--primary)] transition-colors" />
                                        <Input defaultValue={customer?.email} className="h-10 pl-10 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-[var(--primary)]/20 placeholder:text-slate-400 font-bold transition-all text-sm shadow-sm" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Primary Phone No.</Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-[var(--primary)] transition-colors" />
                                        <Input defaultValue={customer?.phone} className="h-10 pl-10 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-[var(--primary)]/20 placeholder:text-slate-400 font-bold transition-all text-sm shadow-sm" />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>


                <TabsContent value="notifications" className="space-y-4">
                    <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { key: "notifyProductionMilestones", title: "Production Milestone Alerts", desc: "Design, print and QC phase notifications.", active: notifications.notifyProductionMilestones },
                                { key: "notifyPaymentReceipt", title: "Payment Receipt Confirmation", desc: "Automated billing email on every payment.", active: notifications.notifyPaymentReceipt },
                                { key: "notifyCreditAlerts", title: "Account Credit Alerts", desc: "Notifications on balance and credit limit.", active: notifications.notifyCreditAlerts },
                                { key: "notifyMonthlyDigest", title: "Monthly Digest Statement", desc: "Comprehensive activities report monthly.", active: notifications.notifyMonthlyDigest }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl group hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                    <div className="space-y-0.5">
                                        <h5 className="font-black text-slate-800 text-[11px] tracking-tight truncate max-w-[200px] uppercase leading-none mb-1">{item.title}</h5>
                                        <p className="text-[9px] font-bold text-slate-400 opacity-80 uppercase tracking-tighter leading-tight italic">{item.desc}</p>
                                    </div>
                                    <Switch 
                                        checked={item.active} 
                                        onCheckedChange={(val) => setNotifications(prev => ({ ...prev, [item.key]: val }))}
                                        className="data-[state=checked]:bg-[var(--primary)]" 
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="pb-8 text-center space-y-2">
                <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.4em] italic mb-6">Secured Environment v2.4.0-Stable</p>
                <div className="flex items-center justify-center gap-2 text-slate-400 opacity-40">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Encrypted Cloud Link Established</span>
                </div>
            </div>
        </div>
    )
}

function Buildings2Icon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12h12" />
            <path d="M6 7h12" />
            <path d="M6 17h12" />
            <path d="M10 22v-4a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v4" />
        </svg>
    )
}
