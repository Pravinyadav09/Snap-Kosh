"use client"

import React from "react"
import { X, RotateCcw, Palette, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useThemeCustomizer, PRESET_THEMES, type ThemeColors } from "@/components/shared/theme-customizer-context"

// ─── Color Swatch Item ────────────────────────────────────────────────────────

interface ColorSwatchProps {
    label: string
    colorKey: keyof ThemeColors
    value: string
    onChange: (key: keyof ThemeColors, value: string) => void
}

function ColorSwatch({ label, colorKey, value, onChange }: ColorSwatchProps) {
    return (
        <div className="flex items-center justify-between gap-3 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
                <div
                    className="h-6 w-6 rounded-md border border-border shadow-sm flex-shrink-0"
                    style={{ backgroundColor: value }}
                />
                <span className="text-sm text-foreground truncate">{label}</span>
            </div>
            <label className="relative cursor-pointer flex-shrink-0">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(colorKey, e.target.value)}
                    className="sr-only"
                    id={`color-${colorKey}`}
                />
                <div
                    className="h-8 w-8 rounded-md border-2 border-border shadow-sm cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: value }}
                    onClick={() => document.getElementById(`color-${colorKey}`)?.click()}
                />
            </label>
        </div>
    )
}

// ─── Radius Slider ────────────────────────────────────────────────────────────

const RADIUS_STEPS = [
    { label: "None", value: 0 },
    { label: "Small", value: 0.3 },
    { label: "Medium", value: 0.625 },
    { label: "Large", value: 1 },
    { label: "Full", value: 1.5 },
]

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function ThemeCustomizerPanel() {
    const { state, setColor, setRadius, setFontScale, setOpen, applyPreset, resetToDefault } = useThemeCustomizer()
    const { colors, radius, fontScale, isOpen } = state

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Slide-out Panel */}
            <div
                className={`
                    fixed top-0 right-0 z-50 h-full w-[340px] max-w-[95vw]
                    bg-background border-l border-border shadow-2xl
                    flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: colors.primary }}>
                            <Palette className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">Theme Customizer</h2>
                            <p className="text-xs text-muted-foreground">Customize your app colors</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

                    {/* ── Preset Themes ── */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            🎨 Preset Themes
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {PRESET_THEMES.map((preset) => {
                                const isActive = colors.primary === preset.colors.primary
                                return (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyPreset(preset)}
                                        className={`
                                            relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left
                                            text-xs font-medium transition-all duration-150
                                            hover:shadow-md hover:scale-[1.02]
                                            ${isActive
                                                ? "border-2 shadow-md"
                                                : "border-border hover:border-primary/30 bg-muted/30"
                                            }
                                        `}
                                        style={isActive ? {
                                            borderColor: preset.colors.primary,
                                            background: preset.colors.sidebarAccent,
                                            color: preset.colors.primary,
                                        } : {}}
                                    >
                                        <span
                                            className="h-5 w-5 rounded-full flex-shrink-0 shadow-sm"
                                            style={{ backgroundColor: preset.colors.primary }}
                                        />
                                        <span className="truncate">{preset.name}</span>
                                        {isActive && (
                                            <Check
                                                className="h-3 w-3 absolute top-1.5 right-1.5 flex-shrink-0"
                                                style={{ color: preset.colors.primary }}
                                            />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    <Separator />

                    {/* ── Primary Colors ── */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            🖌️ Primary Colors
                        </h3>
                        <div className="space-y-0.5">
                            <ColorSwatch label="Primary Color" colorKey="primary" value={colors.primary} onChange={setColor} />
                            <ColorSwatch label="Primary Text" colorKey="primaryForeground" value={colors.primaryForeground} onChange={setColor} />
                        </div>
                    </section>

                    <Separator />

                    {/* ── Background & Text ── */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            🎭 Background & Text
                        </h3>
                        <div className="space-y-0.5">
                            <ColorSwatch label="Background" colorKey="background" value={colors.background} onChange={setColor} />
                            <ColorSwatch label="Text Color" colorKey="foreground" value={colors.foreground} onChange={setColor} />
                            <ColorSwatch label="Card Background" colorKey="card" value={colors.card} onChange={setColor} />
                            <ColorSwatch label="Muted Background" colorKey="muted" value={colors.muted} onChange={setColor} />
                        </div>
                    </section>

                    <Separator />

                    {/* ── Sidebar ── */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            📌 Sidebar
                        </h3>
                        <div className="space-y-0.5">
                            <ColorSwatch label="Sidebar Background" colorKey="sidebar" value={colors.sidebar} onChange={setColor} />
                            <ColorSwatch label="Sidebar Active Color" colorKey="sidebarPrimary" value={colors.sidebarPrimary} onChange={setColor} />
                            <ColorSwatch label="Sidebar Hover BG" colorKey="sidebarAccent" value={colors.sidebarAccent} onChange={setColor} />
                        </div>
                    </section>

                    <Separator />

                    {/* ── UI Elements ── */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            🔲 UI Elements
                        </h3>
                        <div className="space-y-0.5">
                            <ColorSwatch label="Border Color" colorKey="border" value={colors.border} onChange={setColor} />
                            <ColorSwatch label="Accent" colorKey="accent" value={colors.accent} onChange={setColor} />
                            <ColorSwatch label="Danger / Error" colorKey="destructive" value={colors.destructive} onChange={setColor} />
                        </div>
                    </section>

                    <Separator />

                    {/* ── Border Radius ── */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            ⬜ Border Radius
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            {RADIUS_STEPS.map((step) => (
                                <button
                                    key={step.label}
                                    onClick={() => setRadius(step.value)}
                                    className={`
                                        flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium
                                        transition-all duration-150 hover:scale-105
                                        ${radius === step.value
                                            ? "border-2 shadow-sm"
                                            : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                                        }
                                    `}
                                    style={radius === step.value ? {
                                        borderColor: colors.primary,
                                        color: colors.primary,
                                        background: colors.sidebarAccent,
                                    } : {}}
                                >
                                    <div
                                        className="h-5 w-5 border-2"
                                        style={{
                                            borderRadius: `${step.value}rem`,
                                            borderColor: radius === step.value ? colors.primary : "#9CA3AF",
                                        }}
                                    />
                                    {step.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* ── Font Size ── */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            🔤 Font Size
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-6 text-right">A</span>
                            <input
                                type="range"
                                min={0.8}
                                max={1.2}
                                step={0.05}
                                value={fontScale}
                                onChange={(e) => setFontScale(parseFloat(e.target.value))}
                                className="flex-1 accent-primary h-1.5 cursor-pointer"
                                style={{ accentColor: colors.primary }}
                            />
                            <span className="text-base text-muted-foreground w-6">A</span>
                            <span
                                className="text-xs font-mono px-2 py-0.5 rounded font-semibold"
                                style={{ background: colors.sidebarAccent, color: colors.sidebarPrimary }}
                            >
                                {Math.round(fontScale * 100)}%
                            </span>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-border bg-muted/20 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 text-xs"
                        onClick={resetToDefault}
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset to Default
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 text-xs"
                        style={{ background: colors.primary, color: colors.primaryForeground }}
                        onClick={() => setOpen(false)}
                    >
                        Done
                    </Button>
                </div>
            </div>
        </>
    )
}
