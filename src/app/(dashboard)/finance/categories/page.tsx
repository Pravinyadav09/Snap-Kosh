"use client"

import React, { useState } from "react"
import {
    Plus, Tag, Trash2, Edit,
    Download, Info, MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/shared/searchable-select"

// ─── Types ──────────────────────────────────────────────────────────────────
type ExpenseCategory = {
    id: string
    name: string
    description: string
    status: "Active" | "Inactive"
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialCategories: ExpenseCategory[] = [
    { id: "1", name: "Electricity", description: "Monthly electricity bills and DG set maintenance", status: "Active" },
    { id: "2", name: "Internet", description: "Broadband and leased line charges", status: "Active" },
    { id: "3", name: "Labor Wages", description: "Daily wages for helper staff and casual labor", status: "Active" },
    { id: "4", name: "Machine Maintenance", description: "Spare parts, oiling and AMC charges", status: "Active" },
    { id: "5", name: "Rent", description: "Office and warehouse monthly rent", status: "Active" },
    { id: "6", name: "Tea & Pantry", description: "Office snacks, tea, coffee and guest refreshments", status: "Active" },
    { id: "7", name: "Transport", description: "Local delivery and material pickup charges", status: "Active" },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExpenseCategoriesPage() {
    const [categories] = useState<ExpenseCategory[]>(initialCategories)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newCategoryData, setNewCategoryData] = useState({ name: "", description: "", status: "Active" })

    const handleAddCategory = () => {
        if (!newCategoryData.name) return
        // Form submisison logic here
        setIsAddModalOpen(false)
        setNewCategoryData({ name: "", description: "", status: "Active" })
    }

    const columns: ColumnDef<ExpenseCategory>[] = [
        {
            key: "name",
            label: "Category Name",
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <Tag className="h-4 w-4 text-[#4C1F7A]" />
                    </div>
                    <span className="font-bold text-slate-800">{val}</span>
                </div>
            )
        },

        {
            key: "status",
            label: "Status",
            render: (val) => (
                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none text-[10px] font-black uppercase tracking-widest px-2 resize-none">
                    {val}
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            filterable: false,
            render: () => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-indigo-200 bg-white text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-none" title="Edit Category">
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-md border-rose-200 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-none" title="Delete Category">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">Expense Categories</h1>
                </div>
                <div className="flex items-center justify-end gap-3 w-full md:w-auto">
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 px-5 rounded-md font-bold gap-2 shadow-sm transition-all text-white text-xs active:scale-95" style={{ background: 'var(--primary)' }}>
                                <Plus className="h-4 w-4" /> New Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white max-h-[85vh] flex flex-col">
                            <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                        <Tag className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-sm font-bold tracking-tight text-slate-800">Add New Category</DialogTitle>
                                        <DialogDescription className="text-[10px] text-slate-400 font-medium">Create a new expense category to classify your spending effectively.</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="px-6 py-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Info className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Details</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="category-name" className="text-xs font-medium text-slate-600">Category Name <span className="text-rose-500">*</span></Label>
                                                <Input
                                                    id="category-name"
                                                    placeholder="e.g. Office Supplies"
                                                    className="h-9 border-slate-200 bg-slate-50/50 font-bold text-sm focus:bg-white transition-all rounded-md"
                                                    value={newCategoryData.name}
                                                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="description" className="text-xs font-medium text-slate-600">Short Description</Label>
                                                <Textarea
                                                    id="description"
                                                    placeholder="Brief details about this category..."
                                                    className="min-h-[90px] border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-600 px-3 py-2 resize-none focus:bg-white transition-all rounded-md"
                                                    value={newCategoryData.description}
                                                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Operational Status</Label>
                                                <SearchableSelect
                                                    options={[
                                                        { value: "Active", label: "● Active" },
                                                        { value: "Inactive", label: "○ Inactive" }
                                                    ]}
                                                    value={newCategoryData.status}
                                                    onValueChange={(val: any) => setNewCategoryData(prev => ({ ...prev, status: val }))}
                                                    placeholder="Select status"
                                                    className="h-9 rounded-md border-slate-200 bg-white font-medium text-xs shadow-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800"
                                >
                                    Discard Entry
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                                    style={{ background: 'var(--primary)' }}
                                    disabled={!newCategoryData.name}
                                >
                                    Save Category
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <DataGrid
                data={categories}
                columns={columns}
                searchPlaceholder="Search categories or descriptions..."
            />
        </div>
    )
}

