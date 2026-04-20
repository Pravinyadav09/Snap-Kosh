"use client"

import { API_BASE } from '@/lib/api'

import React, { useState } from "react"
import {
    UserPlus,
    Smartphone,
    Building2,
    MapPin,
    Wallet,
    Info,
    CheckCircle2,
    X
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { StateSelect } from "./state-select"
import { GeoSelect } from "./geo-select"
import { toast } from "sonner"

interface CustomerAddModalProps {
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export function CustomerAddModal({ onSuccess, trigger }: CustomerAddModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Form states
    const [companyName, setCompanyName] = useState("")
    const [contactPerson, setContactPerson] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [gstNumber, setGstNumber] = useState("")
    const [netBalance, setNetBalance] = useState<number | string>("")

    const [addressLine1, setAddressLine1] = useState("")
    const [country, setCountry] = useState("IN")
    const [city, setCity] = useState("")
    const [stateVal, setStateVal] = useState("")
    const [pincode, setPincode] = useState("")

    const handleRegister = async () => {
        if (!companyName || !phone) {
            toast.error("Company Name and Phone are mandatory")
            return
        }

        setIsLoading(true)
        const payload = {
            companyName,
            contactPerson,
            phone,
            email,
            gstNumber,
            addressLine1,
            country,
            city,
            state: stateVal,
            pincode,
            netBalance: parseFloat(netBalance.toString()) || 0,
            isActive: true,
            portalAccessEnabled: true
        }

        try {
            const res = await fetch(`${API_BASE}/api/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success("Client Registered", {
                    description: `${companyName} has been added to the master ledger.`,
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                })
                setIsOpen(false)
                // Reset form
                setCompanyName("")
                setContactPerson("")
                setPhone("")
                setEmail("")
                setGstNumber("")
                setNetBalance("")
                setAddressLine1("")
                setCountry("IN")
                setCity("")
                setStateVal("")
                setPincode("")
                if (onSuccess) onSuccess()
            } else {
                const errData = await res.json()
                toast.error("Operation Denied", { description: errData.message || "Could not register customer." })
            }
        } catch (error) {
            toast.error("Network synchronization error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button type="button" variant="outline" className="h-9 px-4 rounded-md border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 gap-2 hover:bg-slate-50 transition-all font-sans">
                        <UserPlus className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Add Customer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="max-w-[calc(100%-1rem)] sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[90vh] flex flex-col font-sans">
                <DialogHeader className="px-4 sm:px-6 py-4 text-left border-b border-slate-100 bg-white relative">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                            <UserPlus className="h-4 w-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-800 leading-none uppercase tracking-tight">New Customer Profile</DialogTitle>
                            <DialogDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Create a new organizational record</DialogDescription>
                        </div>
                    </div>
                    <DialogClose asChild>
                        <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors">
                            <X className="h-4 w-4 text-slate-500" />
                        </Button>
                    </DialogClose>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-4 sm:px-6 py-6 space-y-6">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Info className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organizational Profile</span>
                                </div>
                                <Badge variant="outline" className="text-[10px] uppercase font-medium text-slate-500 bg-slate-50 border-slate-200 rounded-sm">AUTOID-2026</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Company Name <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        placeholder="Enter company legal name" 
                                        className="h-9 border-slate-200 bg-white font-medium text-sm focus:bg-white transition-all rounded-md" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Contact Person <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        value={contactPerson}
                                        onChange={e => setContactPerson(e.target.value)}
                                        placeholder="Primary Contact Name" 
                                        className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Phone Number <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="+91 XXXXX XXXXX" 
                                        className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Email Address</Label>
                                    <Input 
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        type="email" 
                                        placeholder="official@company.com" 
                                        className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Tax & Financials */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tax & Financial Defaults</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">GSTIN Number</Label>
                                    <Input 
                                        value={gstNumber}
                                        onChange={e => setGstNumber(e.target.value)}
                                        placeholder="TAX REGISTRATION ID" 
                                        className="h-9 border-slate-200 bg-white font-medium text-sm uppercase rounded-md" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Opening Balance (₹)</Label>
                                    <Input 
                                        type="number" 
                                        value={netBalance}
                                        onChange={e => setNetBalance(e.target.value)}
                                        placeholder="0.00" 
                                        className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium pt-0.5">Positive: Receivable, Negative: Payable</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Address Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Address</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div className="space-y-1.5 md:col-span-1">
                                    <Label className="text-xs font-medium text-slate-600">Address Line 1</Label>
                                    <Input 
                                        value={addressLine1}
                                        onChange={e => setAddressLine1(e.target.value)}
                                        placeholder="Street, Building, Area" 
                                        className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <GeoSelect 
                                        countryValue={country}
                                        stateValue={stateVal}
                                        cityValue={city}
                                        onCountryChange={setCountry}
                                        onStateChange={setStateVal}
                                        onCityChange={setCity}
                                    />
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Pincode</Label>
                                        <Input 
                                            value={pincode}
                                            onChange={e => setPincode(e.target.value)}
                                            placeholder="6-digit" 
                                            className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                    <Button 
                        type="button"
                        variant="ghost" 
                        onClick={() => setIsOpen(false)} 
                        className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                        Discard Entry
                    </Button>
                    <Button
                        type="button"
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95 whitespace-nowrap"
                        style={{ background: 'var(--primary)' }}
                    >
                        {isLoading ? "Syncing..." : "Save Customer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
