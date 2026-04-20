"use client"

import React, { useState, useEffect } from "react"
import { API_BASE } from "@/lib/api"
import { SearchableSelect } from "./searchable-select"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Option {
    value: string
    label: string
}

interface DropdownRegistrySelectProps {
    category: string
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    fallbackOptions?: Option[]
    className?: string
    disabled?: boolean
    required?: boolean
}

/**
 * Universal Dropdown Component
 * Automatically fetches data from the Dropdown Master registry.
 * Falls back to hardcoded options if the registry is empty or API fails.
 */
export function DropdownRegistrySelect({
    category,
    value,
    onValueChange,
    placeholder = "Select...",
    fallbackOptions = [],
    className,
    disabled = false,
}: DropdownRegistrySelectProps) {
    const [options, setOptions] = useState<Option[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        let isMounted = true
        setIsLoading(true)

        const fetchDropdownData = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/dropdowns/${category}`)
                if (!res.ok) throw new Error("Registry Error")
                
                const data = await res.json()
                if (isMounted) {
                    if (Array.isArray(data) && data.length > 0) {
                        const mapped = data.map((d: any) => ({
                            value: d.value,
                            label: d.label
                        }))
                        setOptions(mapped)
                    } else {
                        // Use fallbacks if registry is empty
                        setOptions(fallbackOptions)
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error(`Error fetching category ${category}:`, err)
                    setError(true)
                    setOptions(fallbackOptions)
                }
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        fetchDropdownData()
        return () => { isMounted = false }
    }, [category])


    return (
        <div className="relative w-full">
            <SearchableSelect
                options={options}
                value={value}
                onValueChange={onValueChange}
                placeholder={placeholder}
                disabled={disabled}
                className={className}
                searchPlaceholder={`Search ${category}...`}
            />
            {isLoading && (
                <div className="absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Loader2 className="h-3 w-3 animate-spin text-slate-300" />
                </div>
            )}
            {error && options.length === 0 && (
                <div className="absolute -bottom-4 left-0 flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-tighter">
                    <AlertCircle className="h-2.5 w-2.5" /> Registry Link Broken — Using Local Defaults
                </div>
            )}
        </div>
    )
}
