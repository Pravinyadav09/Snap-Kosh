"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
    Save, Building2, Mail, Phone, MapPin,
    FileText, Hash, CreditCard, ReceiptText,
    Info, RefreshCcw, CheckCircle2, IndianRupee,
    Landmark, Camera, Image as ImageIcon,
    ShieldCheck, Globe, Percent, Upload, ChevronRight,
    FileCheck, Package, Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SettingsMap = Record<string, string>

const SECTIONS = [
    {
        id: "branding",
        label: "Branding",
        icon: Camera,
        fields: [
            { key: "site_title",    label: "Organization Title", placeholder: "Digital ERP", icon: Building2, span: 2 },
            { key: "site_logo",     label: "Brand Logo Asset",     placeholder: "/uploads/logo.png", icon: ImageIcon, span: 1, isAsset: true },
            { key: "site_favicon",  label: "Favicon Asset",        placeholder: "/favicon.ico", icon: Globe, span: 1, isAsset: true },
        ]
    },
    {
        id: "company",
        label: "Contact Info",
        icon: Building2,
        fields: [
            { key: "company_name",    label: "Company Legal Name", placeholder: "Pvt. Ltd.", icon: Building2, span: 2 },
            { key: "company_email",   label: "Corporate Email",    placeholder: "info@company.com", icon: Mail, span: 1 },
            { key: "company_phone",   label: "Phone / Hotline",     placeholder: "+91...", icon: Phone, span: 1 },
            { key: "company_address", label: "Registered Address", placeholder: "Full address...", icon: MapPin, span: 2 },
        ]
    },
    {
        id: "commerce",
        label: "Tax & Compliance",
        icon: ShieldCheck,
        fields: [
            { key: "gst_number",   label: "GSTIN Number",  placeholder: "22AAAAA...", icon: FileText, span: 1 },
            { key: "pan_number",   label: "PAN Number",    placeholder: "AAAPL...", icon: CreditCard, span: 1 },
            { key: "site_currency",label: "Base Currency", placeholder: "₹", icon: IndianRupee, span: 1 },
            { key: "tax_rate",     label: "Default Tax %", placeholder: "18", icon: Percent, span: 1 },
        ]
    },
    {
        id: "bank",
        label: "Bank Details",
        icon: Landmark,
        fields: [
            { key: "bank_name",           label: "Bank Name",      placeholder: "HDFC, SBI...", icon: Landmark, span: 1 },
            { key: "bank_ifsc",           label: "IFSC Code",      placeholder: "HDFC000...", icon: Hash, span: 1 },
            { key: "bank_account_name",   label: "Account Name",   placeholder: "Beneficiary Name", icon: Building2, span: 1 },
            { key: "bank_account_number", label: "Account Number", placeholder: "0000 0000...", icon: CreditCard, span: 1 },
        ]
    },
    {
        id: "invoice",
        label: "Invoicing",
        icon: ReceiptText,
        fields: [
            { key: "invoice_prefix",       label: "Invoice Prefix", placeholder: "INV/", icon: ReceiptText, span: 1 },
            { key: "invoice_start_number", label: "Start Sequence", placeholder: "1001", icon: Hash, span: 1 },
            { key: "invoice_footer",       label: "Footer Note",    placeholder: "Thank you for your business.", icon: FileText, span: 2 },
        ]
    },
    {
        id: "quotation",
        label: "Quotations",
        icon: FileCheck,
        fields: [
            { key: "quotation_prefix",       label: "Quotation Prefix", placeholder: "QT/", icon: FileCheck, span: 1 },
            { key: "quotation_start_number", label: "Start Sequence",    placeholder: "1001", icon: Hash, span: 1 },
            { key: "quotation_footer",       label: "Footer Note",       placeholder: "Valid for 30 days.", icon: FileText, span: 2 },
        ]
    },
    {
        id: "jobcard",
        label: "Job Tickets",
        icon: FileText,
        fields: [
            { key: "job_prefix",       label: "Job Prefix", placeholder: "JB/", icon: FileText, span: 1 },
            { key: "job_start_number", label: "Start Sequence", placeholder: "3001", icon: Hash, span: 1 },
        ]
    },
    {
        id: "inventory",
        label: "Inventory Master",
        icon: Package,
        fields: [
            { key: "item_code_prefix",       label: "Paper Item Prefix", placeholder: "SH-", icon: FileText, span: 1 },
            { key: "item_code_sequence",     label: "Start Sequence",    placeholder: "1001", icon: Hash, span: 1 },
        ]
    },
]

export default function SettingsPage() {
    const [activeId, setActiveId] = useState("branding")
    const [settings, setSettings] = useState<SettingsMap>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState<string | null>(null)
    const [dirty, setDirty] = useState<Set<string>>(new Set())

    const fileInputRef = useRef<HTMLInputElement>(null)
    const currentUploadKey = useRef<string | null>(null)

    const fetchSettings = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/settings`)
            if (res.ok) {
                const data: any[] = await res.json()
                const map: SettingsMap = {}
                data.forEach(s => {
                    const k = s.key ?? s.Key;
                    if (k) map[k] = s.value ?? s.Value ?? ""
                })
                setSettings(map)
            } else toast.error("Sync Protocol Failed")
        } catch { toast.error("Network Error") }
        finally { setIsLoading(false) }
    }, [])

    useEffect(() => { fetchSettings() }, [fetchSettings])

    const handleChange = (key: string, value: string) => {
        setSettings(p => ({ ...p, [key]: value }))
        setDirty(p => new Set(p).add(key))
    }

    const handleSave = async () => {
        if (!dirty.size) { toast.info("No modifications detected"); return }
        setIsSaving(true)
        let ok = 0, fail = 0
        for (const key of dirty) {
            try {
                const r = await fetch(`${API_BASE}/api/settings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key, value: settings[key] ?? "" }),
                })
                r.ok ? ok++ : fail++
            } catch { fail++ }
        }
        setIsSaving(false)
        if (!fail) {
            toast.success(`System Synced: ${ok} keys updated`, { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> })
            setDirty(new Set())
        } else toast.error(`${fail} keys failed to sync`)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        const key = currentUploadKey.current
        if (!file || !key) return

        setIsUploading(key)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch(`${API_BASE}/api/Uploads?folder=branding`, {
                method: "POST",
                body: formData
            })
            if (res.ok) {
                const data = await res.json()
                handleChange(key, data.fileUrl)
                toast.success("Branding Asset Synchronized")
            } else toast.error("Upload Failed")
        } catch { toast.error("Asset Sync Failure") }
        finally { setIsUploading(null); currentUploadKey.current = null }
    }

    const triggerUpload = (key: string) => {
        currentUploadKey.current = key
        fileInputRef.current?.click()
    }

    const section = SECTIONS.find(s => s.id === activeId)!

    return (
        <div className="space-y-1 font-sans">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            
            {/* Header Area */}
            <div className="flex flex-row items-center justify-between px-4 sm:px-1 gap-2 border-b border-slate-200 pb-2 mb-2 p-4 sm:p-6">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                        <Settings className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-slate-900 leading-none uppercase">Global Settings</h1>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={fetchSettings} className="h-9 w-9 p-0 rounded-lg border-slate-200 text-slate-500 hover:text-slate-800 transition-all shadow-sm">
                        <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !dirty.size}
                        className="h-9 px-6 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95 disabled:opacity-50"
                        style={{ background: "var(--primary)" }}
                    >
                        <Save className="h-4 w-4" />
                        <span className="hidden sm:inline">{isSaving ? "Syncing..." : dirty.size ? `Sync (${dirty.size})` : "Save Changes"}</span>
                        <span className="sm:hidden">{isSaving ? "Syncing..." : "Save"}</span>
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex overflow-x-auto no-scrollbar gap-2 px-4 pb-2">
                {SECTIONS.map(s => {
                    const Icon = s.icon
                    const isActive = s.id === activeId
                    return (
                        <button
                            key={s.id}
                            onClick={() => setActiveId(s.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border shadow-sm flex-shrink-0",
                                isActive 
                                    ? "bg-white text-slate-900 border-slate-200" 
                                    : "bg-slate-50/50 text-slate-400 border-transparent shadow-none"
                            )}
                        >
                            <Icon className={cn("h-3 w-3", isActive ? "text-[var(--primary)]" : "text-slate-300")} style={isActive ? { color: "var(--primary)" } : {}} />
                            {s.label}
                        </button>
                    )
                })}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-md overflow-hidden flex flex-col md:flex-row min-h-[500px] border border-slate-200">
                {/* Desktop Sidebar Sidebar */}
                <div className="hidden md:flex w-52 border-r border-slate-100 bg-slate-50/10 flex-shrink-0 p-4 flex-col space-y-1">
                    {SECTIONS.map(s => {
                        const Icon = s.icon
                        const isActive = s.id === activeId
                        return (
                            <button
                                key={s.id}
                                onClick={() => setActiveId(s.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all text-[11px] font-bold uppercase tracking-tight",
                                    isActive
                                        ? "bg-white shadow-sm text-slate-900 border border-slate-200"
                                        : "text-slate-400 hover:bg-white/60 hover:text-slate-600"
                                )}
                            >
                                <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", isActive ? "text-[var(--primary)]" : "text-slate-300")}
                                    style={isActive ? { color: "var(--primary)" } : {}}
                                />
                                {s.label}
                            </button>
                        )
                    })}
                </div>

                {/* Main Panel Content */}
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-white">
                    {/* Section Header */}
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-50">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-400">
                             {(() => { const Icon = section.icon; return <Icon className="h-4 w-4" /> })()}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 leading-none tracking-tight font-heading uppercase">{section.label}</h2>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mt-1.5 tracking-wider">
                                {activeId === "branding" && "Global visual identity assets"}
                                {activeId === "company" && "Contact & Corporate info"}
                                {activeId === "commerce" && "Taxation & Currency"}
                                {activeId === "bank" && "Banking identifiers"}
                                {activeId === "invoice" && "Document sequencing"}
                                {activeId === "quotation" && "Professional estimates"}
                                {activeId === "jobcard" && "Production tracking"}
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-50 rounded-lg" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {section.fields.map(field => {
                                const Icon = field.icon
                                const isDirty = dirty.has(field.key)
                                const isAsset = (field as any).isAsset
                                
                                return (
                                    <div
                                        key={field.key}
                                        className={cn("space-y-1.5", field.span === 2 && "md:col-span-2")}
                                    >
                                        <Label className="text-xs font-semibold text-slate-600 flex items-center gap-2 px-1">
                                            {field.label}
                                            {isDirty && <Badge className="h-1.5 w-1.5 rounded-full bg-amber-400 p-0 border-none shadow-[0_0_8px_rgba(251,191,36,0.5)]" />}
                                        </Label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 rounded-lg bg-white border border-slate-100 text-slate-300 group-focus-within:text-[var(--primary)] group-focus-within:border-[var(--primary)]/20 transition-all shadow-sm">
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>
                                            <Input
                                                value={settings[field.key] ?? ""}
                                                onChange={e => handleChange(field.key, e.target.value)}
                                                placeholder={field.placeholder}
                                                className={cn(
                                                    "h-10 pl-12 text-sm rounded-lg border-slate-100 bg-slate-50/50 font-semibold text-slate-700 focus:bg-white focus:border-[var(--primary)]/30 transition-all outline-none shadow-none",
                                                    isDirty && "border-amber-100 bg-amber-50/20",
                                                    isAsset && "pr-32"
                                                )}
                                            />
                                            {isAsset && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => triggerUpload(field.key)}
                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 gap-2 transition-all"
                                                >
                                                    {isUploading === field.key ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                                    {settings[field.key] ? "Update" : "Setup"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Simple Bottom Policy Box */}
                    <div className="mt-12 p-5 bg-slate-50/50 border border-slate-100 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-100 text-slate-400 shadow-sm flex-shrink-0">
                            <Info className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800 mb-1 leading-none">Security Registry</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xl">
                                System parameters committed here propagate instantly across all enterprise clusters. 
                                Banking identifiers must align with KYC documents for valid digital settlement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
