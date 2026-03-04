"use client"

import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { Toaster } from "sonner"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <SidebarInset className="flex flex-col font-sans min-w-0">
                    <Header />
                    <main className="flex-1 overflow-y-auto bg-muted/20 p-2 md:p-4 min-w-0">
                        <Breadcrumbs />
                        {children}
                    </main>
                </SidebarInset>
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "var(--popover)",
                        color: "var(--popover-foreground)",
                        border: "1px solid var(--border)",
                    },
                }}
                richColors
                closeButton
            />
        </SidebarProvider>
    )
}

