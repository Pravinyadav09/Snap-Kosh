"use client"

import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

type ActionButton = {
    label: string
    icon: LucideIcon
    onClick?: () => void
    variant?: "default" | "outline"
    className?: string
    asChild?: boolean
    children?: ReactNode
}

type PageActionButtonsProps = {
    buttons: ActionButton[]
}

export function PageActionButtons({ buttons }: PageActionButtonsProps) {
    return (
        <div className="flex items-center gap-3">
            {buttons.map((button, index) => {
                const isOutline = button.variant === "outline"

                // If asChild is true and children exists, render children wrapped in Button
                if (button.asChild && button.children) {
                    return <div key={index}>{button.children}</div>
                }

                return (
                    <Button
                        key={index}
                        onClick={button.onClick}
                        variant={button.variant}
                        className={`h-9 px-5 font-bold text-xs shadow-sm rounded-md gap-2 transition-all active:scale-95 font-sans ${
                            isOutline
                                ? "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                                : "text-white"
                        } ${button.className || ""}`}
                        style={!isOutline ? { background: 'var(--primary)' } : undefined}
                    >
                        <button.icon className="h-4 w-4" />
                        {button.label}
                    </Button>
                )
            })}
        </div>
    )
}
