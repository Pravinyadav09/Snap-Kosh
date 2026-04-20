"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export type ModulePermission = "view" | "create" | "edit" | "delete" | "approve" | "print"

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
    maintenance: ["view"],
}

export function PermissionProvider({ children }: { children: ReactNode }) {
    const [permissions, setPermissions] = useState<Permissions>({})
    const [role, setRole] = useState<string>("")

    React.useEffect(() => {
        const storedRole = localStorage.getItem("user_role") || ""
        const storedPerms = localStorage.getItem("user_permissions") || ""
        
        setRole(storedRole)
        
        if (storedPerms) {
            try {
                const parsed = JSON.parse(storedPerms)
                setPermissions(parsed)
            } catch (e) {
                console.error("Permission parse failure", e)
                setPermissions({})
            }
        }
    }, [])

    const isAdmin = role.trim().toLowerCase() === "admin" || role.trim().toLowerCase() === "administrator"

    const hasPermission = (module: string, action: ModulePermission) => {
        if (isAdmin) return true
        
        const modulePerms = permissions[module] as any
        if (!modulePerms) return false

        // Support both array ["view", "edit"] and object {view: true, edit: false} formats
        if (Array.isArray(modulePerms)) {
            return modulePerms.includes(action)
        }
        
        return !!modulePerms[action]
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
