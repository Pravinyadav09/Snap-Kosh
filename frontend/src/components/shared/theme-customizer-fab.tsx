"use client"

import React from "react"
import { Palette } from "lucide-react"
import { useThemeCustomizer } from "@/components/shared/theme-customizer-context"
import { ThemeCustomizerPanel } from "@/components/shared/theme-customizer-panel"

/**
 * Floating Action Button + Panel — mounts globally on every page.
 * Shows a small floating "Palette" button in the bottom-right corner
 * so users can open the Theme Customizer from any page.
 */
export function ThemeCustomizerFAB() {
    const { setOpen, state } = useThemeCustomizer()

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setOpen(true)}
                title="Customize Theme"
                className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg ring-2 ring-white/30 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                style={{ background: state.colors.primary }}
            >
                <Palette className="h-5 w-5 text-white" />
            </button>

            {/* The slide-out panel */}
            <ThemeCustomizerPanel />
        </>
    )
}
