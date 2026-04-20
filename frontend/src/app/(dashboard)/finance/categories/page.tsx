"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Tag, Trash2, Edit, RefreshCcw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// ─── Types ──────────────────────────────────────────────────────────────────
type ExpenseCategory = {
    id: number
    name: string
    type: string
    isActive: boolean
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExpenseCategoriesPage() {
    const [categories, setCategories] = useState<ExpenseCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form states
    const [name, setName] = useState("")
    const [type, setType] = useState("Indirect")

    const fetchCategories = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/api/expense-categories`)
            if (response.ok) {
                const data = await response.json()
                const mapped: ExpenseCategory[] = data.map((c: any) => ({
                    id: c.id ?? c.Id ?? 0,
                    name: c.name ?? c.Name ?? "",
                    type: c.type ?? c.Type ?? "Indirect",
                    isActive: c.isActive ?? c.IsActive ?? true,
                }))
                setCategories(mapped)
            } else {
                toast.error("Category sync failed")
            }
        } catch {
            toast.error("Network error — check backend connection")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { fetchCategories() }, [fetchCategories])

    const handleOpenDialog = (cat?: ExpenseCategory) => {
        if (cat) {
            setSelectedCategory(cat)
            setName(cat.name)
            setType(cat.type)
        } else {
            setSelectedCategory(null)
            setName("")
            setType("Indirect")
        }
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        if (!name.trim()) { toast.error("Category name is required"); return }
        setIsSaving(true)

        const isEdit = !!selectedCategory
        const payload = { id: selectedCategory?.id ?? 0, name: name.trim(), type, isActive: true }

        try {
            const url = isEdit
                ? `${API_BASE}/api/expense-categories/${selectedCategory!.id}`
                : `${API_BASE}/api/expense-categories`
            const method = isEdit ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (res.ok || res.status === 204) {
                toast.success(isEdit ? "Category Updated" : "Category Created", {
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                })
                setIsDialogOpen(false)
                fetchCategories()
            } else {
                const errData = await res.json()
                toast.error("Operation Denied", { description: errData.message || "Could not save category" })
            }
        } catch {
            toast.error("Network communication failure")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Remove this expense category?")) return
        try {
            const res = await fetch(`${API_BASE}/api/expense-categories/${id}`, { method: "DELETE" })
            if (res.ok || res.status === 204) {
                toast.success("Category Removed")
                fetchCategories()
            } else {
                toast.error("Failed to delete category")
            }
        } catch {
            toast.error("Network error")
        }
    }

    const columns: ColumnDef<ExpenseCategory>[] = useMemo(() => [
        {
            key: "name",
            label: "Category Name",
            render: (val, row) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0">
                        <Tag className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm leading-none">{val as string}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                            ID-{String(row.id).padStart(3, "0")}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "type",
            label: "Classification",
            render: (val) => (
                <Badge
                    variant="outline"
                    className={`font-bold uppercase text-[10px] tracking-wide px-2.5 py-0.5 rounded-md border ${val === "Direct"
                        ? "bg-violet-50 text-violet-600 border-violet-100"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                >
                    {val as string}
                </Badge>
            ),
        },
        {
            key: "id",
            label: "Actions",
            headerClassName: "text-right",
            className: "text-right",
            filterable: false,
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button
                        size="icon" variant="outline"
                        className="h-7 w-7 rounded-md bg-white shadow-none transition-all hover:scale-105"
                        style={{ color: "var(--primary)", borderColor: "color-mix(in srgb, var(--primary), white 70%)" }}
                        title="Edit Category"
                        onClick={() => handleOpenDialog(row)}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="icon" variant="outline"
                        className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-none hover:scale-105"
                        title="Delete Category"
                        onClick={() => handleDelete(row.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        },
    ], [categories])

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900">Expense Categories</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={fetchCategories}
                        className="h-9 px-4 border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-50"
                    >
                        <RefreshCcw className={`h-3.5 w-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95 flex-1 sm:flex-initial"
                                style={{ background: "var(--primary)" }}
                            >
                                <Plus className="h-4 w-4" /> New Category
                            </Button>
                        </DialogTrigger>

                        {/* Dialog Modal */}
                        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[440px] p-0 overflow-hidden border border-slate-200 rounded-xl shadow-xl bg-white font-sans">
                            <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                                        <Tag className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold text-slate-800 leading-none">
                                            {selectedCategory ? "Edit Category" : "New Category"}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-slate-400 font-medium mt-1">
                                            {selectedCategory ? `Editing: ${selectedCategory.name}` : "Define a new expense classification."}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="px-6 py-6 space-y-5">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Category Name <span className="text-rose-500">*</span></Label>
                                    <Input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Factory Power Consumption"
                                        className="h-9 border-slate-200 bg-slate-50/50 font-medium text-sm rounded-lg focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-600">Financial Classification</Label>
                                    <div className="flex gap-2">
                                        {["Direct", "Indirect"].map(t => (
                                            <Button
                                                key={t}
                                                variant="outline"
                                                onClick={() => setType(t)}
                                                className={`flex-1 h-10 text-xs font-bold rounded-lg border transition-all ${type === t
                                                    ? "text-white border-transparent shadow-sm"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                                    }`}
                                                style={type === t ? { background: "var(--primary)" } : {}}
                                            >
                                                {t} Expense
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400">
                                        {type === "Direct" ? "Directly linked to production/service delivery." : "Overhead or administrative expenses."}
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-2">
                                <Button
                                    variant="ghost"
                                    className="h-9 px-4 font-medium text-xs text-slate-500 rounded-lg hover:text-slate-800"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
                                    style={{ background: "var(--primary)" }}
                                    disabled={isSaving}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    {isSaving ? "Saving..." : selectedCategory ? "Update Category" : "Save Category"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>


            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <DataGrid
                    data={categories}
                    columns={columns}
                    isLoading={isLoading}
                    searchPlaceholder="Search categories by name..."
                />
            </div>
        </div>
    )
}
