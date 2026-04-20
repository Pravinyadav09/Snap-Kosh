"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Bell, Check, Info, AlertTriangle, XCircle, Clock, Search, Filter, Calendar, ListFilter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { API_BASE } from "@/lib/api"
import { toast } from "sonner"

type Notification = {
    id: number
    title: string
    message: string
    type: "Info" | "Success" | "Warning" | "Error"
    isRead: boolean
    createdAt: string
}

export function NotificationSheet() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<string>("All")
    const [filterDate, setFilterDate] = useState<string>("All")

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/notifications`)
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) {
                    setNotifications(data)
                    setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
                }
            }
        } catch (err) {
            console.error("Failed to fetch notifications")
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Simple polling every 30s
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const markAsRead = async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: "PATCH" })
            if (res.ok) {
                setNotifications((prev: Notification[]) => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
                setUnreadCount((prev: number) => Math.max(0, prev - 1))
            }
        } catch (err) {
            toast.error("Failed to update notification")
        }
    }

    const typeIcons = {
        Info: <Info className="h-4 w-4 text-blue-500" />,
        Success: <Check className="h-4 w-4 text-emerald-500" />,
        Warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        Error: <XCircle className="h-4 w-4 text-rose-500" />
    }

    const filteredNotifications = useMemo(() => {
        return notifications.filter((n: Notification) => {
            const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                n.message.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = filterType === "All" || n.type === filterType
            
            const date = new Date(n.createdAt)
            const matchesDate = filterDate === "All" || (
                filterDate === "Today" ? date.toDateString() === new Date().toDateString() :
                filterDate === "Week" ? (new Date().getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000 :
                true
            )
            return matchesSearch && matchesType && matchesDate
        })
    }, [notifications, searchTerm, filterType, filterDate])

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 sm:size-9 rounded-lg relative hover:bg-white hover:text-primary hover:shadow-sm transition-all duration-300 border border-transparent hover:border-slate-200/60 text-slate-500">
                    <Bell className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[380px] sm:min-w-[550px] p-0 border-l border-slate-100 flex flex-col font-sans h-full max-h-screen overflow-hidden shadow-[-20px_0_50px_rgba(0,0,0,0.05)]">
                <SheetHeader className="p-8 border-b border-slate-100 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 opacity-[0.03] rotate-12">
                        <Bell size={120} />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                             Notifications
                        </SheetTitle>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-primary/20 bg-primary/5 px-3 py-1 rounded-full">
                            {unreadCount} UNREAD
                        </Badge>
                    </div>
                    <SheetDescription className="text-xs font-semibold text-slate-400 mt-2 relative z-10">
                        System updates and critical alerts from Digital ERP Suite.
                    </SheetDescription>
                </SheetHeader>

                <div className="p-6 border-b border-slate-100 space-y-5 bg-slate-50/40 backdrop-blur-sm">
                    <div className="relative group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-primary transition-colors" />
                        <Input 
                            placeholder="Find alerts..."
                            className="h-12 pl-12 text-xs font-bold border-slate-200 bg-white rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="h-10 text-[10px] font-black uppercase tracking-widest bg-white border-slate-200 rounded-xl shadow-sm px-4">
                                <ListFilter className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="All" className="text-[10px] font-bold uppercase tracking-widest">All Types</SelectItem>
                                <SelectItem value="Info" className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Info</SelectItem>
                                <SelectItem value="Success" className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Success</SelectItem>
                                <SelectItem value="Warning" className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Warning</SelectItem>
                                <SelectItem value="Error" className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Critical</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterDate} onValueChange={setFilterDate}>
                            <SelectTrigger className="h-10 text-[10px] font-black uppercase tracking-widest bg-white border-slate-200 rounded-xl shadow-sm px-4">
                                <Calendar className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                <SelectValue placeholder="Timeline" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="All" className="text-[10px] font-bold uppercase tracking-widest">All Time</SelectItem>
                                <SelectItem value="Today" className="text-[10px] font-bold uppercase tracking-widest">Today Only</SelectItem>
                                <SelectItem value="Week" className="text-[10px] font-bold uppercase tracking-widest">Last 7 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-enhanced">
                    <div className="flex flex-col">
                        {filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-300 gap-5 grayscale opacity-40">
                                <div className="h-20 w-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                                    <Bell className="h-8 w-8" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Neural state silent</p>
                            </div>
                        ) : (
                            filteredNotifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={`p-6 border-b border-slate-100 transition-all cursor-pointer hover:bg-slate-50/80 relative group ${!n.isRead ? 'bg-primary/[0.02]' : ''}`}
                                    onClick={() => !n.isRead && markAsRead(n.id)}
                                >
                                    {!n.isRead && (
                                        <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-r-full shadow-[0_0_10px_var(--primary)]" />
                                    )}
                                    <div className="flex gap-5">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border transition-transform group-hover:scale-110 ${!n.isRead ? 'bg-white border-primary/20 text-primary' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                                            {(typeIcons as any)[n.type]}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between gap-4">
                                                <h4 className={`text-base font-bold tracking-tight leading-tight ${!n.isRead ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>{n.title}</h4>
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 whitespace-nowrap tracking-wider">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <p 
                                                className="text-[13px] text-slate-500 leading-relaxed font-medium pr-4"
                                                dangerouslySetInnerHTML={{ __html: n.message }}
                                            />
                                            <div className="pt-3 flex items-center gap-3">
                                                <Badge className={`text-[9px] font-black uppercase tracking-widest px-2.5 h-5 border-none shadow-none rounded-md ${
                                                    n.type === 'Info' ? 'bg-blue-100 text-blue-700' :
                                                    n.type === 'Success' ? 'bg-emerald-100 text-emerald-700' :
                                                    n.type === 'Warning' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {n.type}
                                                </Badge>
                                                {!n.isRead && (
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">NEW UPDATE</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-white">
                    <Button variant="outline" className="w-full text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all rounded-2xl h-12 border-slate-200 hover:border-primary/30 group bg-slate-50/50 hover:bg-white" onClick={() => toast.info("Deep archive starting...")}>
                        Clear All Notifications
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
