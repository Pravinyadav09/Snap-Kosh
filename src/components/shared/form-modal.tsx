"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { LucideIcon, X, CheckCircle2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SearchableSelect } from "./searchable-select"

export type FormField = {
    name: string
    label: string
    type: "text" | "number" | "email" | "textarea" | "select" | "date" | "custom"
    placeholder?: string
    defaultValue?: any
    options?: { label: string; value: string }[] // For select
    required?: boolean
    searchable?: boolean // For searchable select
    gridCols?: 1 | 2
    render?: (value: any, onChange: (val: any) => void) => React.ReactNode
}

type FormModalProps = {
    title: string
    description?: string
    icon?: LucideIcon
    fields: FormField[]
    onSave: (data: any) => void
    trigger: React.ReactNode
    submitLabel?: string
    variant?: "primary" | "success" | "warning"
}

export function FormModal({
    title,
    description,
    icon: Icon,
    fields,
    onSave,
    trigger,
    submitLabel = "Save Changes",
    variant = "primary"
}: FormModalProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState<Record<string, any>>(
        fields.reduce((acc, f) => ({ ...acc, [f.name]: f.defaultValue || "" }), {})
    )

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
        setOpen(false)
        setFormData(fields.reduce((acc, f) => ({ ...acc, [f.name]: f.defaultValue || "" }), {}))
    }

    const variantStyles = {
        primary: "bg-primary hover:opacity-90 shadow-primary/20 text-primary-foreground",
        success: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 text-white",
        warning: "bg-amber-600 hover:bg-amber-700 shadow-amber-100 text-white",
    }

    const iconStyles = {
        primary: "bg-primary/10 text-primary",
        success: "bg-emerald-50 text-emerald-600",
        warning: "bg-amber-50 text-amber-600",
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] p-0 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden rounded-[40px] flex flex-col max-h-[92vh] font-sans">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader className="px-10 pt-10 pb-6 border-b bg-white relative z-10">
                        <div className="flex items-center gap-5">
                            {Icon && (
                                <div className={`p-4 rounded-2xl ${iconStyles[variant]} shadow-sm border border-slate-100`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            )}
                            <div className="space-y-1">
                                <DialogTitle className="text-3xl font-black tracking-tight text-slate-800 uppercase italic leading-tight">{title}</DialogTitle>
                                {description && (
                                    <DialogDescription className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-0.5">
                                        {description}
                                    </DialogDescription>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="flex-1 overflow-y-auto bg-white">
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                                {fields.map((field) => (
                                    <div
                                        key={field.name}
                                        className={`space-y-2.5 ${field.gridCols === 2 ? 'col-span-2' : 'col-span-2 sm:col-span-1'}`}
                                    >
                                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">
                                            {field.label} {field.required && <span className="text-rose-500 font-bold">*</span>}
                                        </Label>

                                        {field.type === "textarea" ? (
                                            <Textarea
                                                placeholder={field.placeholder}
                                                value={formData[field.name]}
                                                onChange={(e) => handleChange(field.name, e.target.value)}
                                                required={field.required}
                                                className="min-h-[120px] rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-700 px-5 py-4 focus:bg-white focus:border-primary transition-all resize-none"
                                            />
                                        ) : field.type === "select" ? (
                                            field.searchable ? (
                                                <SearchableSelect
                                                    options={field.options || []}
                                                    value={formData[field.name]}
                                                    onValueChange={(val) => handleChange(field.name, val)}
                                                    placeholder={field.placeholder || `Select ${field.label}`}
                                                    className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-sm font-black text-slate-800 px-5 focus:bg-white focus:border-primary transition-all hover:bg-slate-50/50 text-left"
                                                />
                                            ) : (
                                                <Select
                                                    value={formData[field.name]}
                                                    onValueChange={(val) => handleChange(field.name, val)}
                                                >
                                                    <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-sm font-black text-slate-800 px-5 focus:bg-white focus:border-primary transition-all">
                                                        <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-slate-200 font-sans">
                                                        {field.options?.map(opt => (
                                                            <SelectItem key={opt.value} value={opt.value} className="text-sm font-bold py-3">
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )
                                        ) : field.type === "custom" ? (
                                            field.render?.(formData[field.name], (val) => handleChange(field.name, val))
                                        ) : (
                                            <Input
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={formData[field.name]}
                                                onChange={(e) => handleChange(field.name, e.target.value)}
                                                required={field.required}
                                                className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-sm font-black text-slate-800 px-5 focus:bg-white focus:border-primary transition-all"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-8 bg-slate-50/50 border-t flex flex-row items-center justify-between px-10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-transparent"
                        >
                            Cancel Entry
                        </Button>
                        <Button
                            type="submit"
                            className={`h-14 px-12 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center gap-2 ${variantStyles[variant]}`}
                        >
                            <CheckCircle2 className="h-4 w-4" /> {submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
