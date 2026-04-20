"use client"

import { API } from "@/lib/api"
import React, { useState, useEffect, useMemo } from "react"
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    ListChecks,
    RefreshCcw,
    Settings2,
    Database,
    UploadCloud,
    Save,
    X,
    ChevronRight,
    Filter
} from "lucide-react"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataGrid, type ColumnDef } from "@/components/shared/data-grid"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type DropdownItem = {
    id: number
    category: string
    label: string
    value: string
    sortOrder: number
    isActive: boolean
}

const CATEGORIES = [
    "JobStatus",
    "MachineType",
    "DeliveryMode",

    "IndianStates",
    "PaymentMode",
    "PaperProductName"


]

export default function DropdownsPage() {
    const [items, setItems] = useState<DropdownItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<string>("All")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Partial<DropdownItem> | null>(null)

    const fetchItems = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(API.dropdowns.list)
            if (res.ok) {
                const data = await res.json()
                setItems(data)
            }
        } catch {
            toast.error("Failed to sync dropdown repository")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const filteredData = useMemo(() => {
        if (selectedCategory === "All") return items
        return items.filter(i => i.category.toLowerCase() === selectedCategory.toLowerCase())
    }, [items, selectedCategory])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem?.category || !editingItem?.label || !editingItem?.value) {
            toast.error("Please fill all required fields")
            return
        }

        const method = editingItem.id ? "PUT" : "POST"
        const url = editingItem.id ? `${API.dropdowns.list}/${editingItem.id}` : API.dropdowns.list

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingItem)
            })

            if (res.ok) {
                toast.success(editingItem.id ? "Dropdown item updated" : "New record committed")
                setIsModalOpen(false)
                fetchItems()
            } else {
                toast.error("Operation failed")
            }
        } catch {
            toast.error("Network synchronization error")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this master record?")) return
        try {
            const res = await fetch(`${API.dropdowns.list}/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Record purged from database")
                fetchItems()
            }
        } catch {
            toast.error("Delete operation failed")
        }
    }

    const openModal = (item?: DropdownItem) => {
        setEditingItem(item || { category: selectedCategory !== "All" ? selectedCategory : "JobStatus", isActive: true, sortOrder: 0 })
        setIsModalOpen(true)
    }

    const columns: ColumnDef<DropdownItem>[] = [
        {
            key: "category",
            label: "Category",
            render: (val) => (
                <Badge variant="outline" className="font-sans font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md border-indigo-100 bg-indigo-50/50 text-indigo-700">
                    {val as string}
                </Badge>
            )
        },
        {
            key: "label",
            label: "Display Label",
            className: "font-bold text-slate-800",
        },
        {
            key: "value",
            label: "System Value",
            className: "font-mono text-xs text-slate-500",
        },
        {
            key: "sortOrder",
            label: "Order",
            render: (val) => <span className="text-xs font-bold text-slate-400"># {val as number}</span>
        },
        {
            key: "isActive",
            label: "Status",
            render: (val) => (
                <Badge className={`font-bold text-[9px] uppercase border-none px-2 rounded-md ${val ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                    {val ? "Active" : "Disabled"}
                </Badge>
            )
        },
        {
            key: "actions",
            label: "Control Hub",
            className: "text-right pr-4 min-w-[150px] w-[150px]",
            render: (_, row) => (
                <div className="flex justify-end gap-3 pr-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-lg border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-bold text-[10px] uppercase px-3"
                        onClick={() => openModal(row)}
                    >
                        <Edit2 className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-lg border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm font-bold text-[10px] uppercase px-3"
                        onClick={() => handleDelete(row.id)}
                    >
                        <Trash2 className="h-3 w-3" /> Del
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6 font-sans">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm text-indigo-600">
                        <ListChecks className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">Dropdown Master</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={fetchItems}
                        className="h-9 w-9 p-0 rounded-lg border-slate-200 text-slate-500 hover:text-slate-800 transition-all shadow-sm"
                    >
                        <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                    <Button
                        onClick={() => openModal()}
                        className="h-9 px-5 text-white font-bold text-xs shadow-sm rounded-lg gap-2 transition-all active:scale-95 whitespace-nowrap"
                        style={{ background: 'var(--primary)' }}
                    >
                        <Plus className="h-4 w-4" /> Register Record
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Category Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                        <Filter className="h-3 w-3" /> Filter Categories
                    </p>
                    {["All", ...Array.from(new Set([...CATEGORIES, ...items.map(i => i.category)]))].map(cat => {
                        const isSystem = cat === "All" || CATEGORIES.includes(cat);
                        const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();

                        return (
                            <div key={cat} className="group/cat relative">
                                <button
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-xs font-bold
                                        ${isActive
                                            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 border border-indigo-500 translate-x-1"
                                            : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                                        }
                                    `}
                                >
                                    <span className="uppercase tracking-widest">{cat}</span>
                                    {isActive && <ChevronRight className="h-4 w-4" />}
                                </button>

                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const warning = isSystem
                                            ? `WARNING: This is a SYSTEM CATEGORY ("${cat}"). Deleting it may affect production dropdowns. Are you absolutely sure?`
                                            : `CRITICAL: Remove entire category "${cat}" and all its records?`;

                                        if (confirm(warning)) {
                                            const toDelete = items.filter(i =>
                                                i.category.toLowerCase() === cat.toLowerCase() &&
                                                i.id > 0
                                            );

                                            if (toDelete.length === 0) {
                                                toast.info("No database records to remove in this group (Inventory items cannot be deleted here).");
                                                return;
                                            }

                                            setIsLoading(true);
                                            try {
                                                await Promise.all(toDelete.map(i => fetch(`${API.dropdowns.list}/${i.id}`, { method: "DELETE" })));
                                                toast.success(`Category ${cat} purged (${toDelete.length} records removed).`);
                                                fetchItems();
                                                if (selectedCategory === cat) setSelectedCategory("All");
                                            } catch {
                                                toast.error("Deletion failed");
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                                    title="Delete entire category"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Data Grid */}
                <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{filteredData.length} Records</span>
                            {selectedCategory !== "All" && !CATEGORIES.includes(selectedCategory) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-3 text-[9px] font-bold uppercase tracking-tight border-rose-200 text-rose-500 hover:bg-rose-600 hover:text-white transition-all bg-white"
                                    onClick={async () => {
                                        if (confirm(`CRITICAL: Purge entire "${selectedCategory}" category? This will delete all associated parameters permanently.`)) {
                                            const toDelete = items.filter(i => i.category === selectedCategory);
                                            setIsLoading(true);
                                            try {
                                                await Promise.all(toDelete.map(i => fetch(`${API.dropdowns.list}/${i.id}`, { method: "DELETE" })));
                                                toast.success(`Category ${selectedCategory} has been completely removed.`);
                                                fetchItems();
                                                setSelectedCategory("All");
                                            } catch {
                                                toast.error("Group deletion failed.");
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }
                                    }}
                                >
                                    <Trash2 className="h-3 w-3 mr-1" /> Purge Entire Group
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="min-w-[800px]">
                        <DataGrid
                            columns={columns}
                            data={filteredData}
                            isLoading={isLoading}
                            searchPlaceholder={`Search within ${selectedCategory === 'All' ? 'Parameters' : selectedCategory}...`}
                            hideTitle={true}
                        />
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-[440px] p-0 border border-slate-200 overflow-hidden shadow-2xl rounded-xl bg-white font-sans flex flex-col">
                    <form onSubmit={handleSave} className="flex flex-col h-full">
                        <DialogHeader className="px-6 py-4 text-left border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                    <ListChecks className="h-4 w-4" />
                                </div>
                                <div>
                                    <DialogTitle className="text-sm font-bold text-slate-800 leading-none">
                                        {editingItem?.id ? 'Edit Master Record' : 'Commit New Parameter'}
                                    </DialogTitle>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Registry Synchronization</p>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="p-6 space-y-6 flex-1">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Registry Category</Label>
                                    <SearchableSelect
                                        options={CATEGORIES.map(c => ({ value: c, label: c }))}
                                        value={editingItem?.category || ""}
                                        onValueChange={(val: string) => setEditingItem(p => ({ ...p, category: val }))}
                                        className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md text-slate-700"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Display Label</Label>
                                        <Input
                                            placeholder="e.g. In Production"
                                            className="h-9 rounded-md border-slate-200 font-medium text-slate-900 text-sm shadow-none"
                                            value={editingItem?.label || ""}
                                            onChange={e => setEditingItem(p => ({ ...p, label: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">System Value</Label>
                                        <Input
                                            placeholder="PRODUCTION"
                                            className="h-9 rounded-md border-slate-200 font-mono text-xs shadow-none"
                                            value={editingItem?.value || ""}
                                            onChange={e => setEditingItem(p => ({ ...p, value: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Sort Order</Label>
                                        <Input
                                            type="number"
                                            className="h-9 rounded-md border-slate-200 font-bold text-sm shadow-none"
                                            value={editingItem?.sortOrder || 0}
                                            onChange={e => setEditingItem(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end pb-1">
                                        <div className="flex items-center gap-3 h-9 px-1">
                                            <Switch
                                                checked={editingItem?.isActive}
                                                onCheckedChange={checked => setEditingItem(p => ({ ...p, isActive: checked }))}
                                            />
                                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Status</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="h-9 px-4 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800 uppercase tracking-wider">
                                Abandon
                            </Button>
                            <Button
                                type="submit"
                                className="h-9 px-8 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95 whitespace-nowrap"
                                style={{ background: 'var(--primary)' }}
                            >
                                <Save className="h-4 w-4 mr-2" /> Commit Record
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
