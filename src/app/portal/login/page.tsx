"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Fingerprint,
    ArrowRight,
    ShieldCheck,
    Info,
    Smartphone,
    LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export default function ClientLoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [mobile, setMobile] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulating Auth
        setTimeout(() => {
            setLoading(false)
            toast.success("Identity Verified", { description: "Welcome to your Digital Portfolio." })
            router.push("/portal/dashboard")
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            {/* Background Decorative Gradient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 blur-[80px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 blur-[80px] rounded-full" />
            </div>

            <Card className="w-full max-w-[400px] p-0 border border-slate-200 shadow-xl rounded-md overflow-hidden bg-white relative z-10">
                <div className="p-8 space-y-8">
                    {/* Brand Section */}
                    <div className="space-y-4 text-center">
                        <div className="inline-flex p-2.5 rounded-md bg-primary text-white shadow-md">
                            <LayoutDashboard className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Client Portfolio</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital ERP Transparency Engine</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-5">
                            {/* Mobile Input */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600 pl-0.5">Mobile Number</Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Smartphone className="h-4 w-4" />
                                    </div>
                                    <Input
                                        required
                                        type="tel"
                                        placeholder="Enter Reg. Mobile No."
                                        className="h-9 pl-10 rounded-md bg-white border-slate-200 font-bold text-slate-800 text-sm tracking-widest focus:ring-primary/20 transition-all font-sans"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-0.5">
                                    <Label className="text-xs font-medium text-slate-600">Access Password</Label>
                                    <button type="button" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight">Forgot Key?</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Fingerprint className="h-4 w-4" />
                                    </div>
                                    <Input
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-9 pl-10 rounded-md bg-white border-slate-200 font-bold text-slate-800 text-sm focus:ring-primary/20 transition-all font-sans"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            disabled={loading}
                            className="w-full h-9 rounded-md bg-primary hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Authorize & Open <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Bottom Info */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-start gap-3 p-3 rounded-md bg-slate-50 border border-slate-100">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-medium text-slate-500 leading-normal italic">
                                Restricted Access Environment. Credentials are managed by the account administrator.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-400">
                <p className="text-[9px] font-bold uppercase tracking-widest">Authenticated Secure Session</p>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
        </div>
    )
}
