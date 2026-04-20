"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ThemeColors {
    primary: string
    primaryForeground: string
    background: string
    foreground: string
    card: string
    sidebar: string
    sidebarPrimary: string
    sidebarAccent: string
    border: string
    muted: string
    accent: string
    destructive: string
}

export interface ThemeCustomizerState {
    colors: ThemeColors
    radius: number // in rem, e.g. 0.625
    fontScale: number // 1 = default
    isOpen: boolean
}

// ─── Default values (matches current globals.css) ────────────────────────────

const DEFAULT_COLORS: ThemeColors = {
    primary: "#1E4D5C",
    primaryForeground: "#FAFAFA",
    background: "#FFFFFF",
    foreground: "#111111",
    card: "#FFFFFF",
    sidebar: "#FFFFFF",
    sidebarPrimary: "#1E4D5C",
    sidebarAccent: "#F1F5F9",
    border: "#E5E5E5",
    muted: "#F5F5F5",
    accent: "#F5F5F5",
    destructive: "#EF4444",
}

const STORAGE_KEY = "digitalerp-theme-v2"

// ─── Preset Themes ────────────────────────────────────────────────────────────

export const PRESET_THEMES: { name: string; emoji: string; colors: ThemeColors }[] = [
    {
        name: "Dark Teal",
        emoji: "🩵",
        colors: { ...DEFAULT_COLORS },
    },
    {
        name: "Ocean Blue",
        emoji: "🔵",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#1D4ED8",
            primaryForeground: "#FFFFFF",
            sidebarPrimary: "#1D4ED8",
            sidebarAccent: "#EFF6FF",
        },
    },
    {
        name: "Forest Green",
        emoji: "🟢",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#15803D",
            primaryForeground: "#FFFFFF",
            sidebarPrimary: "#15803D",
            sidebarAccent: "#F0FDF4",
        },
    },
    {
        name: "Sunset Orange",
        emoji: "🟠",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#C2410C",
            primaryForeground: "#FFFFFF",
            sidebarPrimary: "#C2410C",
            sidebarAccent: "#FFF7ED",
        },
    },
    {
        name: "Rose Red",
        emoji: "🔴",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#BE123C",
            primaryForeground: "#FFFFFF",
            sidebarPrimary: "#BE123C",
            sidebarAccent: "#FFF1F2",
        },
    },
    {
        name: "Teal",
        emoji: "🩵",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#0F766E",
            primaryForeground: "#FFFFFF",
            sidebarPrimary: "#0F766E",
            sidebarAccent: "#F0FDFA",
        },
    },
    {
        name: "Indigo",
        emoji: "🟣",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#4338CA",
            primaryForeground: "#FFFFFF",
            sidebarPrimary: "#4338CA",
            sidebarAccent: "#EEF2FF",
        },
    },
    {
        name: "Slate Dark",
        emoji: "⚫",
        colors: {
            ...DEFAULT_COLORS,
            primary: "#1E293B",
            primaryForeground: "#FFFFFF",
            sidebarPrimary: "#1E293B",
            sidebarAccent: "#F1F5F9",
        },
    },
]

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeCustomizerContextValue {
    state: ThemeCustomizerState
    setColor: (key: keyof ThemeColors, value: string) => void
    setRadius: (value: number) => void
    setFontScale: (value: number) => void
    setOpen: (open: boolean) => void
    applyPreset: (preset: typeof PRESET_THEMES[number]) => void
    resetToDefault: () => void
}

const ThemeCustomizerContext = createContext<ThemeCustomizerContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeCustomizerProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ThemeCustomizerState>({
        colors: DEFAULT_COLORS,
        radius: 0.625,
        fontScale: 1,
        isOpen: false,
    })

    // Load saved theme from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved) as Partial<ThemeCustomizerState>
                setState(prev => ({
                    ...prev,
                    colors: { ...DEFAULT_COLORS, ...(parsed.colors || {}) },
                    radius: parsed.radius ?? prev.radius,
                    fontScale: parsed.fontScale ?? prev.fontScale,
                }))
            }
        } catch {
            // ignore parse errors
        }
    }, [])

    // Apply CSS variables whenever colors/radius/fontScale change
    useEffect(() => {
        const root = document.documentElement
        const { colors, radius, fontScale } = state

        // ── General tokens ──
        root.style.setProperty("--primary", colors.primary)
        root.style.setProperty("--primary-foreground", colors.primaryForeground)
        root.style.setProperty("--background", colors.background)
        root.style.setProperty("--foreground", colors.foreground)
        root.style.setProperty("--card", colors.card)
        root.style.setProperty("--card-foreground", colors.foreground)
        root.style.setProperty("--popover", colors.card)
        root.style.setProperty("--popover-foreground", colors.foreground)
        root.style.setProperty("--border", colors.border)
        root.style.setProperty("--input", colors.border)
        root.style.setProperty("--muted", colors.muted)
        root.style.setProperty("--muted-foreground", "#6B7280")
        root.style.setProperty("--accent", colors.accent)
        root.style.setProperty("--accent-foreground", colors.foreground)
        root.style.setProperty("--destructive", colors.destructive)

        // ── Sidebar tokens ──
        root.style.setProperty("--sidebar", colors.sidebar)
        root.style.setProperty("--sidebar-foreground", colors.foreground)
        root.style.setProperty("--sidebar-border", colors.border)
        root.style.setProperty("--sidebar-primary", colors.primary)
        root.style.setProperty("--sidebar-primary-foreground", colors.primaryForeground)
        root.style.setProperty("--sidebar-accent", colors.sidebarAccent)
        root.style.setProperty("--sidebar-accent-foreground", colors.primary)
        root.style.setProperty("--sidebar-ring", colors.primary)

        // ── Radius & font ──
        root.style.setProperty("--radius", `${radius}rem`)
        root.style.setProperty("--font-scale", `${fontScale}`)
        root.style.fontSize = `${fontScale * 100}%`

        // Persist to localStorage (without isOpen)
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ colors, radius, fontScale })
            )
        } catch {
            // ignore storage errors
        }
    }, [state])

    const setColor = useCallback((key: keyof ThemeColors, value: string) => {
        setState(prev => ({
            ...prev,
            colors: { ...prev.colors, [key]: value },
        }))
    }, [])

    const setRadius = useCallback((value: number) => {
        setState(prev => ({ ...prev, radius: value }))
    }, [])

    const setFontScale = useCallback((value: number) => {
        setState(prev => ({ ...prev, fontScale: value }))
    }, [])

    const setOpen = useCallback((open: boolean) => {
        setState(prev => ({ ...prev, isOpen: open }))
    }, [])

    const applyPreset = useCallback((preset: typeof PRESET_THEMES[number]) => {
        setState(prev => ({ ...prev, colors: { ...preset.colors } }))
    }, [])

    const resetToDefault = useCallback(() => {
        setState(prev => ({
            ...prev,
            colors: { ...DEFAULT_COLORS },
            radius: 0.625,
            fontScale: 1,
        }))
    }, [])

    return (
        <ThemeCustomizerContext.Provider
            value={{ state, setColor, setRadius, setFontScale, setOpen, applyPreset, resetToDefault }}
        >
            {children}
        </ThemeCustomizerContext.Provider>
    )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useThemeCustomizer() {
    const ctx = useContext(ThemeCustomizerContext)
    if (!ctx) throw new Error("useThemeCustomizer must be used inside ThemeCustomizerProvider")
    return ctx
}
