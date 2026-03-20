"use client"

import React from "react"
import { Search, Bell, Palette, Globe, HelpCircle } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useThemeCustomizer } from "@/components/shared/theme-customizer-context"

export function Header() {
    const { setOpen, state } = useThemeCustomizer()

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/60 bg-white/100 px-3 sm:px-6 backdrop-blur-xl transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-4 text-slate-800">
                <SidebarTrigger className="-ml-1 size-9 rounded-xl hover:bg-slate-100 hover:text-primary transition-all duration-300" />
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
                        <Button variant="ghost" size="icon" className="size-8 sm:size-9 rounded-lg relative hover:bg-white hover:text-primary hover:shadow-sm transition-all duration-300 border border-transparent hover:border-slate-200/60">
                            <Bell className="h-4 sm:h-4.5 w-4 sm:w-4.5 text-slate-500 hover:text-primary transition-colors" />
                            <span className="absolute top-2.5 right-2 sm:right-2.5 flex h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </Button>

                        <Button variant="ghost" size="icon" className="size-8 sm:size-9 rounded-lg text-slate-500 hover:text-primary hover:bg-white hover:shadow-sm transition-all duration-300 hidden xs:flex border border-transparent hover:border-slate-200/60">
                            <HelpCircle className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
