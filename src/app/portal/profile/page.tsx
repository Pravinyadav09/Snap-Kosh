"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function ProfilePage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase tracking-wider">My Profile</h1>
            </div>

            <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white p-8 space-y-10">
                {/* ── Personal Information ── */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                            <Input defaultValue="Praveen Kumar" className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                            <Input defaultValue="praveen.1986.cahuhan@gmail.com" className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
                            <Input defaultValue="+919540046568" className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-slate-700" />
                        </div>
                    </div>
                </div>

                {/* ── Business Details ── */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Business Details <span className="text-[10px] text-slate-400 normal-case italic ml-2">(Optional)</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name</Label>
                            <Input defaultValue="JAY GEMINI POLYMERS" className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">GST Number</Label>
                            <Input defaultValue="07AWRPG5864D1Z9" className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-slate-700" />
                        </div>
                    </div>
                </div>

                {/* ── Change Password ── */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password <span className="normal-case italic ml-1">(leave blank to keep current)</span></Label>
                            <Input type="password" placeholder="••••••••" className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</Label>
                            <Input type="password" placeholder="Enter new password" className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm New Password</Label>
                            <Input type="password" placeholder="Confirm new password" className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button className="h-12 px-10 text-white font-black uppercase tracking-widest rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95" style={{ background: 'var(--primary)' }}>
                        Update Profile
                    </Button>
                </div>
            </Card>
        </div>
    )
}
