"use client"

import React from "react"
import { Search, Bell, Palette, Globe, HelpCircle, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useThemeCustomizer } from "@/components/shared/theme-customizer-context"
import { NotificationSheet } from "./notification-sheet"

function SidebarToggleButton() {
    const { toggleSidebar, state } = useSidebar()
    const isOpen = state === "expanded"

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="relative -ml-1 size-9 rounded-xl border border-slate-200/70 bg-slate-50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-slate-500 transition-all duration-300 shadow-sm group"
        >
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-300">
                {isOpen
                    ? <PanelLeftClose className="size-4.5 transition-transform duration-300 group-hover:scale-110" />
                    : <PanelLeftOpen className="size-4.5 transition-transform duration-300 group-hover:scale-110" />
                }
            </span>
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    )
}

export function Header() {
    const { setOpen, state } = useThemeCustomizer()

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/60 bg-white/100 px-1 sm:px-6 backdrop-blur-xl transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-4 text-slate-800">
                <SidebarToggleButton />
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end max-w-4xl text-slate-700">
                <form className="hidden lg:flex flex-1 max-w-md">
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            type="search"
                            placeholder="Universal Search... (/)"
                            className="w-full pl-10 h-10 bg-slate-50 border-none rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary/20 transition-all duration-300 shadow-none border border-slate-100 focus-visible:border-primary/20"
                        />
                    </div>
                </form>

                <div className="flex items-center gap-1.5 md:gap-3">
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                        <NotificationSheet />

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 sm:size-9 rounded-lg text-slate-500 hover:text-primary hover:bg-white hover:shadow-sm transition-all duration-300 border border-transparent hover:border-slate-200/60"
                            onClick={() => setOpen(true)}
                        >
                            <Palette className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 pl-2 border-l border-slate-100 ml-1">
                        <div className="hidden sm:flex flex-col items-end pr-1 font-sans">
                            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight leading-none">
                                {typeof window !== 'undefined' ? (localStorage.getItem("user_name") && localStorage.getItem("user_name") !== "undefined" ? localStorage.getItem("user_name") : "Operator") : "Operator"}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                                {typeof window !== 'undefined' ? (localStorage.getItem("user_role") && localStorage.getItem("user_role") !== "undefined" ? localStorage.getItem("user_role") : "Admin") : "Admin"}
                                {typeof window !== 'undefined' && localStorage.getItem("user_email") && localStorage.getItem("user_email") !== "undefined" && ` | ${localStorage.getItem("user_email")}`}
                            </span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 p-0 rounded-xl bg-slate-100 border border-slate-200/60 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 group transition-all duration-300 overflow-hidden"
                            onClick={() => {
                                localStorage.clear()
                                window.location.href = "/login"
                            }}
                        >
                            <div className="size-full flex items-center justify-center relative">
                                <span className="text-xs font-black text-slate-600 group-hover:opacity-0 transition-opacity">
                                    {(typeof window !== 'undefined' ? localStorage.getItem("user_name")?.[0] : "O") || "O"}
                                </span>
                                <div className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-rose-500 text-white">
                                    <Globe className="h-4 w-4" />
                                </div>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
