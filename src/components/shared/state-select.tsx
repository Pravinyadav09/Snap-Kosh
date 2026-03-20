"use client"

import * as React from "react"
import { SearchableSelect } from "./searchable-select"

export const INDIAN_STATES = [
    { value: "delhi", label: "Delhi (07)" },
    { value: "up", label: "Uttar Pradesh (09)" },
    { value: "hr", label: "Haryana (06)" },
    { value: "rj", label: "Rajasthan (08)" },
    { value: "pb", label: "Punjab (03)" },
    { value: "mp", label: "Madhya Pradesh (23)" },
    { value: "mh", label: "Maharashtra (27)" },
    { value: "gj", label: "Gujarat (24)" },
    { value: "br", label: "Bihar (10)" },
    { value: "jk", label: "Jharkhand (20)" },
    { value: "uk", label: "Uttarakhand (05)" },
    { value: "wb", label: "West Bengal (19)" },
    { value: "ka", label: "Karnataka (29)" },
    { value: "tn", label: "Tamil Nadu (33)" },
    { value: "tg", label: "Telangana (36)" },
    { value: "ap", label: "Andhra Pradesh (37)" },
    { value: "kl", label: "Kerala (32)" },
    { value: "ct", label: "Chhattisgarh (22)" },
    { value: "or", label: "Odisha (21)" },
    { value: "hp", label: "Himachal Pradesh (02)" },
    { value: "as", label: "Assam (18)" },
    { value: "un", label: "Other / Union Territory" }
]

interface StateSelectProps {
    value?: string
    onValueChange: (value: string) => void
    className?: string
    placeholder?: string
}

export function StateSelect({ value, onValueChange, className, placeholder = "Select State" }: StateSelectProps) {
    return (
        <SearchableSelect
            options={INDIAN_STATES}
            value={value}
            onValueChange={onValueChange}
            placeholder={placeholder}
            searchPlaceholder="Search state or code..."
            emptyMessage="No state found."
            className={className}
        />
    )
}
