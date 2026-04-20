"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { ThemeCustomizerFAB } from "@/components/shared/theme-customizer-fab"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [isAuthChecking, setIsAuthChecking] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("erp_token")
        if (!token) {
            router.push("/login")
        } else {
            setIsAuthChecking(false)
        }
    }, [router])

    if (isAuthChecking) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4 font-sans">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Verifying Security Session...</p>
            </div>
        )
    }

    return (
        <SidebarProvider className="font-sans text-slate-900 antialiased">
            <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-slate-950">
                <AppSidebar />
                <SidebarInset className="flex flex-col min-w-0 flex-1 h-screen overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 p-0 md:p-6 min-w-0">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

