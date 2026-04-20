"use client"

import React, { useState, useMemo, useEffect } from "react"
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
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "./date-range-picker"

export type ColumnDef<T> = {
    key: string // Allows non-field keys like 'actions'
    label: string
    type?: 'text' | 'number' | 'date' | 'select'
    render?: (val: any, item: T, viewMode: 'table' | 'card') => React.ReactNode
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
    enableDateRange?: boolean
    dateFilterKey?: string // The key to use for global date range filtering
    isLoading?: boolean
}

export function DataGrid<T extends Record<string, any>>({
    data,
    columns,
    title,
    hideTitle,
    toolbarClassName,
    icon,
    onExport,
    pageSizeOptions = [10, 20, 50, 90, 150],
    initialPageSize = 20,
    searchPlaceholder = "Search...",
    enableSelection = true,
    onSelectionChange,
    enableCardView = true,
    cardRender,
    enableDateRange = false,
    dateFilterKey = "date",
    isLoading = false,
}: DataGridProps<T>) {
    const [viewMode, setViewMode] = useState<"table" | "card">("table")

    // Automatically switch to Card View on mobile devices (screens < 768px)
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768 && enableCardView) {
            setViewMode("card")
        }
    }, [enableCardView])
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
    const [globalDateRange, setGlobalDateRange] = useState<DateRange | undefined>()

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

            // Global Date Range
            if (enableDateRange && globalDateRange?.from && item[dateFilterKey]) {
                const itemDateStr = String(item[dateFilterKey])
                // Attempt to parse date strings properly 
                const itemDate = new Date(Date.parse(itemDateStr))
                if (!isNaN(itemDate.getTime())) {
                    // Reset time portions for comparison
                    const compareDate = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())
                    const fromDate = new Date(globalDateRange.from.getFullYear(), globalDateRange.from.getMonth(), globalDateRange.from.getDate())

                    if (compareDate < fromDate) return false

                    if (globalDateRange.to) {
                        const toDate = new Date(globalDateRange.to.getFullYear(), globalDateRange.to.getMonth(), globalDateRange.to.getDate())
                        if (compareDate > toDate) return false
                    }
                }
            }

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
    }, [data, search, columnFilters, sortKey, sortOrder, globalDateRange, enableDateRange, dateFilterKey])

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

    const toolbarActions = (
        <>
            {enableCardView && (
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 shrink-0 shadow-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 rounded-md transition-all ${viewMode === 'table' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        style={viewMode === 'table' ? { background: 'var(--primary)' } : {}}
                        onClick={() => setViewMode('table')}
                    >
                        <TableProperties className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 rounded-md transition-all ${viewMode === 'card' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        style={viewMode === 'card' ? { background: 'var(--primary)' } : {}}
                        onClick={() => setViewMode('card')}
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 hover:bg-slate-50 rounded-lg group/sett shadow-sm">
                        <Settings2 className="h-3.5 w-3.5 text-slate-500 group-hover/sett:text-primary transition-colors" style={{ '--primary': 'var(--primary)' } as any} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200 p-1.5">
                    <DropdownMenuLabel className="text-[11px] font-bold text-slate-500 font-sans px-2 py-1.5">Table Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
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

            <Button
                variant={showFilters || Object.values(columnFilters).some(v => v) ? "secondary" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 border-slate-200 rounded-lg transition-all shadow-sm ${Object.values(columnFilters).some(v => v) ? 'bg-amber-50 border-amber-200 text-amber-600' : showFilters ? 'bg-white border-slate-300' : ''}`}
                style={showFilters && !Object.values(columnFilters).some(v => v) ? { color: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
                onClick={() => setShowFilters(!showFilters)}
            >
                <Filter className="h-3.5 w-3.5" style={showFilters || Object.values(columnFilters).some(v => v) ? {} : { color: 'var(--primary)' }} />
            </Button>
        </>
    )

    return (
        <div className="w-full border-y sm:border border-slate-200 sm:rounded-xl overflow-hidden shadow-sm bg-white flex flex-col">
            {/* ── Toolbar Row (Sticky) ─────────────────────────────────── */}
            <div className={`sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-3 py-2.5 sm:p-2 border-b border-slate-200 shadow-sm ${toolbarClassName || ''}`}>
                {/* Stats & Selected Count */}
                <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center gap-1">
                        <p className="text-[12px] font-bold text-slate-500 font-sans shrink-0 tracking-tight">
                            {filteredData.length} Records
                        </p>
                        {enableSelection && selectedIds.length > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                                <span className="text-[10px] font-black font-sans">{selectedIds.length}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 px-1 text-[9px] font-bold text-blue-400 hover:text-blue-800"
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
                    
                    {/* Mobile Only: Action Buttons (moved to first row on mobile to keep search full width below) */}
                    <div className="flex sm:hidden items-center gap-2">
                        {toolbarActions}
                    </div>
                </div>

                {/* Search, DateRange & Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {enableDateRange && (
                        <div className="w-[120px] sm:w-auto shrink-0">
                            <DatePickerWithRange
                                date={globalDateRange}
                                setDate={setGlobalDateRange}
                            />
                        </div>
                    )}
                    <div className="relative flex-1 sm:w-64 lg:w-80 group">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" style={{ '--primary': 'var(--primary)' } as any} />
                        <Input
                            placeholder={searchPlaceholder}
                            className="pl-8 h-9 bg-slate-50 border-slate-200 transition-all rounded-xl text-[12px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 shadow-inner-sm"
                            style={{ '--ring': 'var(--primary)', borderColor: 'var(--primary)/20' } as any}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    
                    {/* Desktop Only: Action Buttons */}
                    <div className="hidden sm:flex items-center gap-2 ml-1">
                        {toolbarActions}
                    </div>
                </div>
            </div>

            {/* ── Table Grid ───────────────────────────────────────────── */}
            {
                viewMode === "table" ? (
                    <div className={`w-full max-w-full rounded-xl border border-slate-200 shadow-sm bg-white font-sans relative flex flex-col ${isResizing ? 'select-none pointer-events-none' : ''}`}>
                        <Table 
                            containerClassName="max-h-[70vh] overflow-y-auto custom-scrollbar-enhanced"
                            style={{ tableLayout: 'auto', minWidth: '100%', width: 'auto' }}
                        >
                                <TableHeader className="z-20 shadow-sm border-b border-slate-200">
                                        <TableRow className="bg-transparent hover:bg-transparent border-0">
                                            {enableSelection && (
                                                <TableHead className="w-[60px] pl-6 border-0 sticky top-0 bg-slate-50 z-30" style={{ width: '60px', minWidth: '60px' }}>
                                                    <Checkbox
                                                        checked={isAllSelected}
                                                        onCheckedChange={(v) => toggleSelectAll(!!v)}
                                                        className="h-5 w-5 rounded-md border-slate-300 transition-all opacity-80"
                                                        style={{ backgroundColor: isAllSelected ? 'var(--primary)' : 'transparent', borderColor: isAllSelected ? 'var(--primary)' : '' } as React.CSSProperties}
                                                    />
                                                </TableHead>
                                            )}
                                            {columns.map(col => visibleCols[col.key] && (
                                                <TableHead
                                                    key={col.key}
                                                    className={`font-sans text-xs p-0 group/head select-none relative !border-0 text-black font-semibold sticky top-0 bg-slate-50 z-20 ${col.headerClassName || ""} ${col.sortable !== false ? 'cursor-pointer hover:text-slate-900 transition-all' : ''}`}
                                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                                    style={{ minWidth: `${columnWidths[col.key]}px` }}
                                                >
                                                    <div className="flex flex-col h-full">
                                                        <div className="flex items-center gap-1.5 h-10 px-4">
                                                            <span className="truncate whitespace-nowrap font-sans font-semibold text-[13px] text-slate-800">{col.label}</span>
                                                            {col.sortable !== false && (
                                                                <div className="shrink-0 transition-all opacity-40 group-hover/head:opacity-100 flex items-center">
                                                                    {sortKey === col.key ? (
                                                                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-slate-700" /> : <ArrowDown className="h-3 w-3 text-slate-700" />
                                                                    ) : (
                                                                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {showFilters && col.filterable !== false && (
                                                            <div className="px-4 pb-2" onClick={(e) => e.stopPropagation()}>
                                                                <div className="relative group/filter w-full">
                                                                    {!(col.type === 'date' || col.key.toLowerCase().includes('date')) && (
                                                                        <Search className="absolute left-2 top-2 h-2.5 w-2.5 text-slate-400 transition-colors z-10" style={{ color: 'var(--primary)' } as any} />
                                                                    )}
                                                                    <Input
                                                                        type={col.type === 'date' || col.key.toLowerCase().includes('date') ? 'date' : 'text'}
                                                                        placeholder="FILTER..."
                                                                        value={columnFilters[col.key] || ""}
                                                                        onChange={e => setColumnFilter(col.key, e.target.value)}
                                                                        className={`h-6 text-[10px] py-0 bg-white border-slate-200 transition-all shadow-none font-sans font-semibold tracking-tight w-full text-slate-500 focus-visible:ring-1 ${col.type === 'date' || col.key.toLowerCase().includes('date') ? 'pl-2' : 'pl-6'}`}
                                                                        style={{ '--ring': 'var(--primary)', borderColor: 'var(--primary)/20' } as any}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
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
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={`skeleton-${i}`} className="border-b border-slate-50/50">
                                                    {enableSelection && <TableCell className="pl-6"><div className="h-5 w-5 bg-slate-100 rounded animate-pulse" /></TableCell>}
                                                    {columns.map(col => visibleCols[col.key] && (
                                                        <TableCell key={`skeleton-col-${col.key}-${i}`} className="p-4"><div className="h-4 bg-slate-50 rounded animate-pulse" /></TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={(enableSelection ? 1 : 0) + columns.filter(c => visibleCols[c.key]).length} className="text-center py-24 sm:py-32">
                                                    <div className="flex flex-col items-center justify-center gap-4 text-slate-300">
                                                        <div className="p-4 sm:p-6 rounded-[28px] bg-slate-50 border-2 border-dashed border-slate-100">
                                                            <Search className="h-8 w-8 sm:h-10 sm:w-10 opacity-40" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs sm:text-sm font-bold text-slate-400 font-sans">No Records Found</p>
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
                                                        <TableCell className="pl-6" style={{ width: '60px' }}>
                                                            <Checkbox
                                                                checked={selectedIds.includes(String(item.id))}
                                                                onCheckedChange={(v) => toggleSelectRow(String(item.id), !!v)}
                                                                className="h-5 w-5 rounded-md border-slate-200 transition-all"
                                                                style={selectedIds.includes(String(item.id)) ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
                                                            />
                                                        </TableCell>
                                                    )}
                                                    {columns.map(col => visibleCols[col.key] && (
                                                        <TableCell key={col.key} className={`p-0 font-sans ${col.className || ""}`} style={{ minWidth: `${columnWidths[col.key]}px` }}>
                                                            <div className={`min-h-[26px] flex items-center px-3 transition-transform duration-300 ${col.key.toLowerCase().includes('action') ? '' : ''}`}>
                                                                {col.render ? col.render(item[col.key], item, viewMode) : (
                                                                    <span className="text-[10px] text-slate-800 font-sans font-medium whitespace-nowrap">
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
                                </Table>
                        </div>
                    ) : (
                    /* ── Card View ───────────────────────────────────────────── */
                    /* card-view-internal-scroll */
                    <div className="flex-1 min-h-0 overflow-y-auto px-2 py-4 bg-slate-50/20" style={{ maxHeight: 'calc(100vh - 260px)' }}>
                        {paginatedData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-4 text-slate-300">
                                <div className="p-6 rounded-[28px] bg-slate-50 border-2 border-dashed border-slate-100">
                                    <Search className="h-10 w-10 opacity-40" />
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-sm font-bold text-slate-400 font-sans">No Records Found</p>
                                    <p className="text-[10px] font-bold opacity-60">Try adjusting your query or filters</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {paginatedData.map((item, idx) => (
                                    cardRender ? (
                                        <div key={item.id || idx}>{cardRender(item)}</div>
                                    ) : (
                                        <div
                                            key={item.id || idx}
                                            className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all p-4 space-y-3"
                                        >
                                            {columns.filter(col => visibleCols[col.key]).map(col => (
                                                <div key={col.key} className="flex items-start justify-between gap-3 border-b border-slate-50 last:border-0 pb-1.5 last:pb-0">
                                                    <span className="text-[11px] font-semibold text-slate-500 font-sans shrink-0 pt-0.5">{col.label}</span>
                                                    <div className={`text-right ${col.key.toLowerCase().includes('action') ? 'flex-1' : 'max-w-[70%] overflow-hidden'}`}>
                                                        {col.render ? col.render(item[col.key], item, viewMode) : (
                                                            <span className="text-sm font-semibold text-slate-700 truncate block">{item[col.key]}</span>
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

            {/* ── Pagination Footer ─────────────────────────────────── */}
            <div className="border-t border-slate-200 bg-white px-3 py-4 pb-8 sm:pb-3 sm:px-6 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)] rounded-b-xl">
                {/* Records Summary - Left Side */}
                <div className="text-[12px] font-medium text-slate-500 font-sans">
                    Showing <span className="text-slate-900 font-black">{(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredData.length)}</span> <span className="mx-1 text-slate-300">|</span> Total <span className="text-slate-900 font-black">{filteredData.length}</span>
                </div>

                {/* Controls Group - Right Side */}
                <div className="flex items-center gap-2">
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 font-sans">Show:</span>
                        <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                            <SelectTrigger className="h-7 w-20 px-3 border-slate-200 bg-white rounded text-[11px] font-bold text-slate-900 focus:ring-1 focus:ring-primary/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="min-w-[60px] rounded-lg shadow-xl border-slate-200">
                                {pageSizeOptions.map(size => (
                                    <SelectItem key={size} value={String(size)} className="text-[11px] rounded cursor-pointer font-bold">{size}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-[11px] font-semibold text-slate-400 font-sans">Rows</span>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        {/* First Page */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-white transition-all rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            onClick={() => setPage(1)}
                            disabled={safePage === 1}
                            title="First Page"
                        >
                            <ChevronsLeft className="h-3.5 w-3.5" />
                        </Button>

                        {/* Previous Page */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-white transition-all rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            onClick={() => setPage(p => p - 1)}
                            disabled={safePage === 1}
                            title="Previous Page"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-0.5 px-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => {
                                    if (p === 1 || p === totalPages) return true
                                    if (p >= safePage - 1 && p <= safePage + 1) return true
                                    return false
                                })
                                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                                        acc.push("...")
                                    }
                                    acc.push(p)
                                    return acc
                                }, [])
                                .map((p, i) => p === "..." ? (
                                    <span key={`dots-${i}`} className="px-1.5 text-slate-300 font-black text-xs select-none">
                                        ···
                                    </span>
                                ) : (
                                    <Button
                                        key={`page-${p}`}
                                        variant={safePage === p ? "default" : "ghost"}
                                        size="sm"
                                        className={`h-7 min-w-[28px] px-2 rounded text-xs font-bold transition-all ${
                                            safePage === p
                                                ? "text-white shadow-sm"
                                                : "text-slate-600 hover:bg-white hover:text-slate-900"
                                        }`}
                                        style={safePage === p ? { background: 'var(--primary)' } : {}}
                                        onClick={() => setPage(p as number)}
                                    >
                                        {p}
                                    </Button>
                                ))
                            }
                        </div>

                        {/* Next Page */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-white transition-all rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            onClick={() => setPage(p => p + 1)}
                            disabled={safePage === totalPages}
                            title="Next Page"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>

                        {/* Last Page */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-white transition-all rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            onClick={() => setPage(totalPages)}
                            disabled={safePage === totalPages}
                            title="Last Page"
                        >
                            <ChevronsRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
