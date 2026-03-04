"use client"

import React, { useState } from "react"
import {
    Plus, Tag, Trash2, Edit,
    Download, Info, MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"

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
            key: "description",
            label: "Description",
            render: (val) => (
                <p className="text-xs text-slate-400 font-medium max-w-[400px] line-clamp-1 italic">
                    {val}
                </p>
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 font-heading">Expense Categories</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Classification tags for financial ledger entries</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold gap-2 hover:bg-slate-50">
                        <Download className="h-4 w-4 text-slate-400" /> Export List
                    </Button>
                    <Button className="h-11 px-8 rounded-xl bg-[#4C1F7A] hover:bg-[#3b185f] font-bold gap-2 shadow-lg shadow-indigo-100 transition-all">
                        <Plus className="h-4 w-4" /> New Category
                    </Button>
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

