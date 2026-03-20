"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export type ModulePermission = "view" | "create" | "edit" | "delete" | "approve"

export interface Permissions {
    [module: string]: ModulePermission[]
}

interface PermissionContextType {
    permissions: Permissions
    hasPermission: (module: string, action: ModulePermission) => boolean
    isAdmin: boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

// Default permissions for a sample "Manager" role
const defaultPermissions: Permissions = {
    dashboard: ["view"],
    hr: ["view", "edit"],
    sales: ["view", "create", "edit"],
    inventory: ["view", "create", "edit"],
    production: ["view", "edit"],
    finance: ["view"],
}

export function PermissionProvider({ children }: { children: ReactNode }) {
    // In a real app, this would come from your Auth provider / API
    const [permissions] = useState<Permissions>(defaultPermissions)
    const [role] = useState<string>("Administrator")

    const isAdmin = role === "Administrator"

    const hasPermission = (module: string, action: ModulePermission) => {
        if (isAdmin) return true
        return permissions[module]?.includes(action) || false
    }

    return (
        <PermissionContext.Provider value={{ permissions, hasPermission, isAdmin }}>
            {children}
        </PermissionContext.Provider>
    )
}

export function usePermissions() {
    const context = useContext(PermissionContext)
    if (context === undefined) {
        throw new Error("usePermissions must be used within a PermissionProvider")
    }
    return context
}

export function Can({ I, a, children, fallback = null }: { I: ModulePermission, a: string, children: ReactNode, fallback?: ReactNode }) {
    const { hasPermission } = usePermissions()
    if (hasPermission(a, I)) return <>{children}</>
    return <>{fallback}</>
}
