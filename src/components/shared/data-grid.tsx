"use client"

import React, { useState, useMemo } from "react"
import {
    Search,
    Download,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Columns,
    FileText,
    FileSpreadsheet,
    Printer,
    Settings2,
    Filter,
    LayoutGrid,
    TableProperties,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export type ColumnDef<T> = {
    key: string // Allows non-field keys like 'actions'
    label: string
    type?: 'text' | 'number' | 'date' | 'select'
    render?: (val: any, item: T) => React.ReactNode
    className?: string
    headerClassName?: string
    filterable?: boolean
    sortable?: boolean
    initialWidth?: number
}

type DataGridProps<T> = {
    data: T[]
    columns: ColumnDef<T>[]
    title?: string
    hideTitle?: boolean
    toolbarClassName?: string
    icon?: React.ReactNode
    onExport?: (data: T[], format: "csv" | "json" | "print") => void
    pageSizeOptions?: number[]
    initialPageSize?: number
    searchPlaceholder?: string
    enableSelection?: boolean
    onSelectionChange?: (selectedIds: string[]) => void
    enableCardView?: boolean
    cardRender?: (item: T) => React.ReactNode
}

export function DataGrid<T extends Record<string, any>>({
    data,
    columns,
    title,
    hideTitle,
    toolbarClassName,
    icon,
    onExport,
    pageSizeOptions = [5, 10, 20, 50],
    initialPageSize = 10,
    searchPlaceholder = "Search...",
    enableSelection = true,
    onSelectionChange,
    enableCardView = true,
    cardRender,
}: DataGridProps<T>) {
    const [viewMode, setViewMode] = useState<"table" | "card">("table")
    const [search, setSearch] = useState("")
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
    const [pageSize, setPageSize] = useState(initialPageSize)
    const [page, setPage] = useState(1)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(
        columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    )
    const [showFilters, setShowFilters] = useState(false)
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
        columns.reduce((acc, col) => {
            const isAction = col.key.toLowerCase().includes('action')
            return { ...acc, [col.key]: col.initialWidth || (isAction ? 220 : 180) }
        }, {})
    )
    const [isResizing, setIsResizing] = useState(false)

    const totalTableWidth = useMemo(() => {
        let width = enableSelection ? 60 : 0
        columns.forEach(col => {
            if (visibleCols[col.key]) {
                const isAction = col.key.toLowerCase().includes('action')
                width += columnWidths[col.key] || (isAction ? 220 : 180)
            }
        })
        return width
    }, [columns, visibleCols, columnWidths, enableSelection])

    // Filtering and Sorting logic
    const filteredData = useMemo(() => {
        let result = data.filter(item => {
            // Global search
            const globalMatch = Object.values(item).some(val =>
                String(val).toLowerCase().includes(search.toLowerCase())
            )
            if (!globalMatch) return false

            // Column filters
            const columnMatch = Object.entries(columnFilters).every(([key, filterVal]) => {
                if (!filterVal) return true
                const val = item[key]
                if (val === undefined || val === null) return true

                const col = columns.find(c => c.key === key)
                const isDate = col?.type === 'date' || key.toLowerCase().includes('date')

                if (isDate && filterVal) {
                    // Try to handle YYYY-MM-DD from date input vs various string formats in data
                    const itemDateStr = String(val).toLowerCase()
                    const filterDateStr = filterVal.toLowerCase()

                    // Simple logic: if it's a date input value (YYYY-MM-DD), try to see if the year/month/day exists in the source string
                    // This is a basic fallback for when data strings aren't standard ISO.
                    if (filterDateStr.includes('-')) {
                        const [y, m, d] = filterDateStr.split('-')
                        // Check if parts of the date exist in the formatted string (e.g. "2026", "Jan", etc.)
                        // This is naive but often works for "05 Jan, 2026" type strings
                        return itemDateStr.includes(y) && (itemDateStr.includes(d) || itemDateStr.includes(String(parseInt(d))))
                    }
                }

                return String(val).toLowerCase().includes(filterVal.toLowerCase())
            })

            return columnMatch
        })

        // Sorting
        if (sortKey && sortOrder) {
            result.sort((a, b) => {
                const valA = a[sortKey]
                const valB = b[sortKey]

                if (valA === valB) return 0

                const multiplier = sortOrder === "asc" ? 1 : -1

                if (typeof valA === "number" && typeof valB === "number") {
                    return (valA - valB) * multiplier
                }

                return String(valA).localeCompare(String(valB)) * multiplier
            })
        }

        return result
    }, [data, search, columnFilters, sortKey, sortOrder])

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize)

    // Reset page on search or filter change
    React.useEffect(() => {
        setPage(1)
    }, [search, columnFilters, pageSize])

    const handleExport = (format: "csv" | "json" | "print") => {
        if (onExport) {
            onExport(filteredData, format)
            return
        }

        // Default Export logic
        if (format === "print") {
            window.print()
        } else if (format === "csv") {
            const headers = columns.filter(c => visibleCols[c.key]).map(c => c.label)
            const rows = filteredData.map(item =>
                columns.filter(c => visibleCols[c.key]).map(c => String(item[c.key]))
            )
            const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
            const blob = new Blob([csv], { type: "text/csv" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${title || "export"}_${new Date().toISOString().slice(0, 10)}.csv`
            a.click()
            URL.revokeObjectURL(url)
            toast.success("CSV Exported")
        } else if (format === "json") {
            const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${title || "export"}_${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
            toast.success("JSON Exported")
        }
    }

    const toggleCol = (key: string) =>
        setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }))

    const setColumnFilter = (key: string, val: string) => {
        setColumnFilters(prev => ({ ...prev, [key]: val }))
    }

    const handleSort = (key: string) => {
        if (sortKey === key) {
            if (sortOrder === "asc") setSortOrder("desc")
            else if (sortOrder === "desc") {
                setSortOrder(null)
                setSortKey(null)
            }
        } else {
            setSortKey(key)
            setSortOrder("asc")
        }
    }

    const handleResizeStart = (key: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(true)

        const startX = e.pageX
        const startWidth = columnWidths[key]

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.pageX - startX
            setColumnWidths(prev => ({
                ...prev,
                [key]: Math.max(80, startWidth + deltaX) // Min width 80px
            }))
        }

        const onMouseUp = () => {
            setIsResizing(false)
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
            document.body.style.cursor = "default"
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
        document.body.style.cursor = "col-resize"
    }

    // Selection handlers
    const toggleSelectAll = (checked: boolean) => {
        const pageIds = paginatedData.map(item => String(item.id))
        let newSelected = [...selectedIds]

        if (checked) {
            // Add all item IDs on the current page to selection
            pageIds.forEach(id => {
                if (!newSelected.includes(id)) newSelected.push(id)
            })
        } else {
            // Remove current page IDs from selection
            newSelected = newSelected.filter(id => !pageIds.includes(id))
        }

        setSelectedIds(newSelected)
        onSelectionChange?.(newSelected)
    }

    const toggleSelectRow = (id: string, checked: boolean) => {
        let newSelected = [...selectedIds]
        if (checked) {
            newSelected.push(id)
        } else {
            newSelected = newSelected.filter(sid => sid !== id)
        }
        setSelectedIds(newSelected)
        onSelectionChange?.(newSelected)
    }

    const isAllSelected = paginatedData.length > 0 && paginatedData.every(item => selectedIds.includes(String(item.id)))

    return (
        <div className="space-y-2">
            {/* ── Toolbar Row ───────────────────────────────────────── */}
            <div className={`flex flex-col md:flex-row gap-2 items-center justify-between bg-slate-50/50 p-1.5 rounded-xl border border-slate-100/50 mb-1 ${toolbarClassName || ''}`}>
                <div className="flex items-center gap-3">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-2 border-r border-slate-200">
                        {filteredData.length} Records
                    </p>

                    {enableSelection && selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg animate-in fade-in zoom-in duration-200">
                            <span className="text-[10px] font-black uppercase tracking-wider">{selectedIds.length} Selected</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 px-1 text-[10px] font-bold text-blue-400 hover:text-blue-800 hover:bg-transparent"
                                onClick={() => {
                                    setSelectedIds([])
                                    onSelectionChange?.([])
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-1 md:flex-initial w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" style={{ '--primary': 'var(--primary)' } as any} />
                        <Input
                            placeholder={searchPlaceholder}
                            className="pl-8 h-8 bg-white border-slate-200 transition-all rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-2"
                            style={{ '--ring': 'var(--primary)', borderColor: 'var(--primary)' } as any}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {/* View Toggle */}
                    {enableCardView && (
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 p-0 rounded-md transition-all ${viewMode === 'table' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                style={viewMode === 'table' ? { background: 'var(--primary)' } : {}}
                                onClick={() => setViewMode('table')}
                                title="Table View"
                            >
                                <TableProperties className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 p-0 rounded-md transition-all ${viewMode === 'card' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                style={viewMode === 'card' ? { background: 'var(--primary)' } : {}}
                                onClick={() => setViewMode('card')}
                                title="Card View"
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 hover:bg-slate-50 rounded-lg group/sett">
                                <Settings2 className="h-3.5 w-3.5 text-slate-500 group-hover/sett:text-primary transition-colors" style={{ '--primary': 'var(--primary)' } as any} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200 p-1.5">
                            <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 px-2 py-1.5">Table Settings</DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            {/* Column Selection Submenu */}
                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-600 px-2 py-1 flex items-center gap-2">
                                <Columns className="h-3 w-3" /> Visible Columns
                            </DropdownMenuLabel>
                            <div className="max-h-[200px] overflow-y-auto py-1">
                                {columns.map(col => (
                                    <DropdownMenuCheckboxItem
                                        key={col.key}
                                        checked={visibleCols[col.key]}
                                        onCheckedChange={() => toggleCol(col.key)}
                                        className="text-xs py-1.5 cursor-pointer"
                                    >
                                        {col.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </div>

                            <DropdownMenuSeparator />

                            {/* Export Submenu */}
                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-600 px-2 py-1 flex items-center gap-2">
                                <Download className="h-3 w-3" /> Export Options
                            </DropdownMenuLabel>
                            <DropdownMenuItem className="gap-2 text-xs cursor-pointer rounded-lg px-2 py-2" onClick={() => handleExport("csv")}>
                                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Save as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-xs cursor-pointer rounded-lg px-2 py-2" onClick={() => handleExport("json")}>
                                <FileText className="h-3.5 w-3.5 text-blue-600" /> Save as JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-xs cursor-pointer rounded-lg px-2 py-2" onClick={() => handleExport("print")}>
                                <Printer className="h-3.5 w-3.5 text-slate-600" /> Print Table
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Filter Action */}
                    <Button
                        variant={showFilters || Object.values(columnFilters).some(v => v) ? "secondary" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 border-slate-200 rounded-lg transition-all ${Object.values(columnFilters).some(v => v) ? 'bg-amber-50 border-amber-200 text-amber-600' : showFilters ? 'bg-white border-slate-300' : ''}`}
                        style={showFilters && !Object.values(columnFilters).some(v => v) ? { color: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
                        onClick={() => setShowFilters(!showFilters)}
                        title={showFilters ? "Hide Column Filters" : "Filter Columns"}
                    >
                        <Filter className="h-3.5 w-3.5" style={showFilters || Object.values(columnFilters).some(v => v) ? {} : { color: 'var(--primary)' }} />
                    </Button>

                </div>
            </div>



            {/* ── Table Grid ───────────────────────────────────────────── */}
            {
                viewMode === "table" ? (
                    <div className={`w-full max-w-full rounded-xl border border-slate-200 shadow-sm bg-white font-sans relative flex flex-col ${isResizing ? 'select-none pointer-events-none' : ''}`}>
                        <div className="w-full overflow-x-auto overflow-y-auto max-h-[65vh] custom-scrollbar pb-4 rounded-xl flex-1">
                            <Table style={{ tableLayout: 'fixed', width: `${totalTableWidth}px`, minWidth: '100%' }}>
                                <colgroup>
                                    {enableSelection && <col style={{ width: '60px' }} />}
                                    {columns.map(col => visibleCols[col.key] && (
                                        <col key={col.key} style={{ width: `${columnWidths[col.key]}px` }} />
                                    ))}
                                </colgroup>
                                <TableHeader className="sticky top-0 z-20 shadow-md border-0" style={{ background: 'var(--primary)' }}>
                                    <TableRow className="bg-transparent hover:bg-transparent border-0">
                                        {enableSelection && (
                                            <TableHead className="w-[60px] pl-6 border-0">
                                                <Checkbox
                                                    checked={isAllSelected}
                                                    onCheckedChange={(v) => toggleSelectAll(!!v)}
                                                    className="h-5 w-5 rounded-md border-white/20 data-[state=checked]:bg-white data-[state=checked]:border-white/50 transition-all opacity-80"
                                                    style={{ '--tw-text-opacity': '1', color: 'var(--primary)' } as React.CSSProperties}
                                                />
                                            </TableHead>
                                        )}
                                        {columns.map(col => visibleCols[col.key] && (
                                            <TableHead
                                                key={col.key}
                                                className={`font-black text-[11px] uppercase tracking-[0.12em] py-3.5 font-sans group/head select-none relative !border-0 ${col.headerClassName || ""} ${col.sortable !== false ? 'cursor-pointer hover:opacity-80 transition-all' : ''}`}
                                                onClick={() => col.sortable !== false && handleSort(col.key)}
                                                style={{
                                                    color: '#ffffff',
                                                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                                    width: `${columnWidths[col.key]}px`
                                                }}
                                            >
                                                <div className="flex flex-col gap-1 pr-4 h-full pt-1">
                                                    <div className="flex items-center gap-1.5 pt-0.5">
                                                        <span className="font-sans leading-none" style={{ color: '#ffffff' }}>{col.label}</span>
                                                        {col.sortable !== false && (
                                                            <div className="shrink-0 transition-all opacity-40 group-hover/head:opacity-100 flex items-center">
                                                                {sortKey === col.key ? (
                                                                    sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-white" /> : <ArrowDown className="h-3 w-3 text-white" />
                                                                ) : (
                                                                    <ArrowUpDown className="h-3 w-3 text-white/40" />
                                                                )}
                                                            </div>
                                                        )}
                                                        {sortKey === col.key && (
                                                            <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse opacity-100" />
                                                        )}
                                                    </div>
                                                    {showFilters && col.filterable !== false && (
                                                        <div className="relative group/filter max-w-full mt-1" onClick={(e) => e.stopPropagation()}>
                                                            {!(col.type === 'date' || col.key.toLowerCase().includes('date')) && (
                                                                <Search className="absolute left-2 top-2 h-2.5 w-2.5 text-slate-400 transition-colors z-10" style={{ '--tw-text-opacity': '1', color: 'var(--primary)' } as any} />
                                                            )}
                                                            <Input
                                                                type={col.type === 'date' || col.key.toLowerCase().includes('date') ? 'date' : 'text'}
                                                                placeholder={`Filter...`}
                                                                value={columnFilters[col.key] || ""}
                                                                onChange={e => setColumnFilter(col.key, e.target.value)}
                                                                className={`h-7 text-[10px] py-0 bg-white border-white/50 transition-all shadow-md placeholder:text-slate-400 font-bold uppercase tracking-widest w-full text-slate-900 focus-visible:ring-2 focus-visible:bg-white ${col.type === 'date' || col.key.toLowerCase().includes('date') ? 'pl-2' : 'pl-6'}`}
                                                                style={{ '--ring': 'var(--primary)', borderColor: 'var(--primary)' } as any}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Resize Handle */}
                                                <div
                                                    className={`absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-white/20 transition-colors z-10 ${isResizing ? 'bg-white/30' : ''}`}
                                                    onMouseDown={(e) => handleResizeStart(col.key, e)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={(enableSelection ? 1 : 0) + columns.filter(c => visibleCols[c.key]).length} className="text-center py-32">
                                                <div className="flex flex-col items-center justify-center gap-4 text-slate-300 animate-in fade-in zoom-in duration-500">
                                                    <div className="p-6 rounded-[28px] bg-slate-50 border-2 border-dashed border-slate-100">
                                                        <Search className="h-10 w-10 opacity-40 shrink-0" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Intelligence Found</p>
                                                        <p className="text-[10px] font-bold opacity-60">Try adjusting your query or filters</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((item, idx) => (
                                            <TableRow
                                                key={item.id || idx}
                                                className={`group hover:bg-slate-50/40 transition-all border-b border-slate-50/50 last:border-0 ${selectedIds.includes(String(item.id)) ? 'bg-slate-100/50' : ''}`}
                                                style={selectedIds.includes(String(item.id)) ? { background: 'color-mix(in srgb, var(--primary), transparent 90%)' } : {}}
                                            >
                                                {enableSelection && (
                                                    <TableCell className="pl-6">
                                                        <Checkbox
                                                            checked={selectedIds.includes(String(item.id))}
                                                            onCheckedChange={(v) => toggleSelectRow(String(item.id), !!v)}
                                                            className="h-5 w-5 rounded-md border-slate-200 transition-all"
                                                            style={selectedIds.includes(String(item.id)) ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
                                                        />
                                                    </TableCell>
                                                )}
                                                {columns.map(col => visibleCols[col.key] && (
                                                    <TableCell key={col.key} className={`py-3 font-sans ${col.className || ""}`} style={{ width: `${columnWidths[col.key]}px` }}>
                                                        <div className={`group-hover:translate-x-1 transition-transform duration-300 whitespace-nowrap ${col.key.toLowerCase().includes('action') ? '' : 'truncate'}`}>
                                                            {col.render ? col.render(item[col.key], item) : (
                                                                <span className="text-[13px] font-bold text-slate-600 tracking-tight">
                                                                    {item[col.key]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table >
                        </div >
                    </div >
                ) : (
                    /* ── Card View ───────────────────────────────────────────── */
                    <div className="px-2">
                        {paginatedData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-300">
                                <div className="p-6 rounded-[28px] bg-slate-50 border-2 border-dashed border-slate-100">
                                    <Search className="h-10 w-10 opacity-40" />
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Records Found</p>
                                    <p className="text-[10px] font-bold opacity-60">Try adjusting your query or filters</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginatedData.map((item, idx) => (
                                    cardRender ? (
                                        <div key={item.id || idx}>{cardRender(item)}</div>
                                    ) : (
                                        <div
                                            key={item.id || idx}
                                            className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all p-5 space-y-3 group"
                                        >
                                            {columns.filter(col => visibleCols[col.key]).map(col => (
                                                <div key={col.key} className="flex items-start justify-between gap-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pt-0.5">{col.label}</span>
                                                    <div className="text-right">
                                                        {col.render ? col.render(item[col.key], item) : (
                                                            <span className="text-sm font-semibold text-slate-700">{item[col.key]}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {/* ── Pagination ───────────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-6 px-4">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                    Record <span className="text-slate-900 mx-1">/</span> <span className="text-slate-900">{safePage}</span> of {totalPages}
                </div>

                <div className="flex items-center gap-1.5">
                    <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-50" onClick={() => setPage(1)} disabled={safePage === 1}>
                            <ChevronsLeft className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-50" onClick={() => setPage(p => p - 1)} disabled={safePage === 1}>
                            <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || (p >= safePage - 1 && p <= safePage + 1))
                            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...")
                                acc.push(p)
                                return acc
                            }, [])
                            .map((p, i) => p === "..." ? (
                                <span key={`dots-${i}`} className="px-1 text-slate-300 font-bold text-xs">...</span>
                            ) : (
                                <Button
                                    key={`page-${p}`}
                                    variant={safePage === p ? "default" : "outline"}
                                    size="sm"
                                    className={`h-7 w-7 rounded-lg text-[10px] font-bold transition-all ${safePage === p
                                        ? "text-white shadow-md border-none scale-105"
                                        : "bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300"}`}
                                    style={safePage === p ? { background: 'var(--primary)' } : {}}
                                    onClick={() => setPage(p as number)}
                                >
                                    {p}
                                </Button>
                            ))
                        }
                    </div>

                    <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-50" onClick={() => setPage(p => p + 1)} disabled={safePage === totalPages}>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-50" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>
                            <ChevronsRight className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    )
}
