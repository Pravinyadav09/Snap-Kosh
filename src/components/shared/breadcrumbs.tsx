"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

const routeLabels: Record<string, string> = {
    dashboard: "Dashboard",
    users: "Customers",
    estimator: "Quotations",
    new: "New Quotation",
    invoices: "Invoices",
    jobs: "Production Jobs",
    scheduler: "Scheduler",
    "daily-readings": "Daily Readings",
    machines: "Machines",
    "paper-stocks": "Paper Stocks",
    "ink-inventory": "Ink Inventory",
    "wide-format": "Wide Format Media",
    outsource: "Vendors & Outsource",
    finance: "Finance",
    expenses: "Expenses",
    purchases: "Purchases",
    categories: "Expense Categories",
    reports: "Reports",
    gst: "GST Reports",
    ledger: "Paper Usage Ledger",
    management: "Management",
    roles: "Roles",
    processes: "Process Masters",
    tax: "Tax Slabs",
    settings: "Settings",
    inventory: "Inventory",
    sales: "Sales",
    maintenance: "Maintenance",
    tasks: "Maintenance Tasks",
    checks: "Machine Checks",
    history: "Service History",
    issues: "Equipment Issues",
}

export function Breadcrumbs() {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    if (segments.length <= 1) return null

    const crumbs = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
        const isLast = index === segments.length - 1

        return { href, label, isLast }
    })

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-4 px-1">
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Home className="h-3.5 w-3.5" />
            </Link>
            {crumbs.map((crumb) => (
                <React.Fragment key={crumb.href}>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                    {crumb.isLast ? (
                        <span className="text-foreground font-bold truncate max-w-[200px]">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="hover:text-foreground transition-colors truncate max-w-[150px]"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    )
}
