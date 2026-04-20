import { API_BASE } from '@/lib/api'
import React from "react"
import { ChevronsUpDown, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"

// Hybrid Autocomplete Component (Linked to Paper Master & Registry)
export function MasterAutocomplete({ 
    category, 
    value, 
    onChange, 
    placeholder,
    filters = {}
}: { 
    category: string, 
    value: string, 
    onChange: (val: string) => void, 
    placeholder: string,
    filters?: { [key: string]: string }
}) {
    const [options, setOptions] = React.useState<any[]>([])
    const [isOpen, setIsOpen] = React.useState(false)

    React.useEffect(() => {
        const fetchAll = async () => {
            try {
                // 1. Fetch from Local Registry (Dropdowns Table)
                const regRes = await fetch(`${API_BASE}/api/dropdowns/${category}`)
                const regData = regRes.ok ? await regRes.json() : []
                
                // 2. Fetch from Live Paper Inventory (Dynamic Linkage)
                const [liveRes, procRes] = await Promise.all([
                    fetch(`${API_BASE}/api/SpecializedInventory/paper`),
                    fetch(`${API_BASE}/api/processes`)
                ])
                
                const liveDataRaw = liveRes.ok ? await liveRes.json() : []
                const liveData = Array.isArray(liveDataRaw) ? liveDataRaw : []

                const procDataRaw = procRes.ok ? await procRes.json() : []
                const procData = Array.isArray(procDataRaw) ? procDataRaw : []
                
                // 3. APPLY DEPENDENT FILTERS on liveData & procData
                const targetPaperCat = (filters.paperCategory || "").toLowerCase().trim()
                const targetCat = (filters.category || "").toLowerCase().trim()
                const targetProd = (filters.productName || "").toLowerCase().trim()

                let filteredLive = [...liveData]
                let filteredProc = [...procData]
                
                // Paper Filters
                // Use both paperCategory (direct) and category (generic filter) for paper filtering
                const effectivePaperCat = targetPaperCat || targetCat;
                if (effectivePaperCat && category.startsWith('Paper')) {
                    filteredLive = filteredLive.filter(d => 
                        (d.name || d.Name || d.itemCode || d.ItemCode || "").toLowerCase().trim().includes(effectivePaperCat)
                    );
                }
                if (targetProd && category.startsWith('Paper')) {
                    filteredLive = filteredLive.filter(d => (d.type || d.Type || "").toLowerCase().trim() === targetProd);
                }

                // Operation/Process Filters (Linking to Paper Category)
                // Only apply paper filter for non-OperationCategory (i.e. don't restrict ADD-ON PROCESS category dropdown)
                if (targetPaperCat && category !== "OperationCategory") {
                    const exactMatches = filteredProc.filter(d =>
                        (d.name || d.Name || d.type || d.Type || "").toLowerCase().trim().includes(targetPaperCat)
                    )
                    // FALLBACK: If no exact matches for this paper, show ALL available processes to avoid empty list
                    if (exactMatches.length > 0) {
                        filteredProc = exactMatches
                    }
                }

                // Filter by Operation Category if provided
                if (targetCat && category === "OperationName") {
                    filteredProc = filteredProc.filter(d =>
                        (d.type || d.Type || "").toLowerCase().trim() === targetCat ||
                        (d.name || d.Name || "").toLowerCase().trim() === targetCat
                    )
                }

                // 4. Map values based on which field we are filling
                let masterValues: string[] = []
                
                // PAPER MASTER MAPPING (liveData/filteredLive)
                if (category === "PaperCategory") {
                    masterValues = liveData.map((d: any) => d.name || d.Name)
                } else if (category === "PaperProductName") {
                    masterValues = filteredLive.map((d: any) => d.type || d.Type)
                } else if (category === "PaperSizeGSM") {
                    masterValues = filteredLive.map((d: any) => `${d.size || d.Size || '—'} - ${d.gsm || d.GSM || '—'} GSM`)
                } 
                
                // PROCESS MASTER MAPPING (procData/filteredProc)
                else if (category === "OperationCategory") {
                    // Map both Name and Type to Category dropdown if it matches linkage
                    masterValues = filteredProc.map((d: any) => d.name || d.Name || d.type || d.Type)
                } else if (category === "OperationName") {
                    // Only show product names for that process
                    masterValues = filteredProc.map((d: any) => d.productName || d.ProductName || d.name || d.Name)
                }

                // 5. Combine and Deduplicate
                const combined = [
                    ...regData.map((d: any) => (d.label || d.Label || d.value || d.Value)),
                    ...masterValues
                ]
                
                const unique = Array.from(new Set(combined))
                    .filter(Boolean)
                    .map(label => ({ label }))

                setOptions(unique)
            } catch {
                setOptions([])
            }
        }
        fetchAll()
    }, [category, filters.category, filters.productName, filters.paperCategory])

    const filtered = options.filter(opt => 
        (opt.label || "").toLowerCase().includes((value || "").toLowerCase())
    )

    return (
        <div className="relative w-full group">
            <Input 
                className="h-9 rounded-md border-slate-200 shadow-none text-sm font-medium px-3 bg-white w-full pr-8" 
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {value && (
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange("");
                        }}
                        className="h-5 w-5 rounded-full hover:bg-slate-100 flex items-center justify-center group/clear"
                    >
                        <X className="h-3 w-3 text-slate-300 group-hover/clear:text-rose-500 transition-colors" />
                    </button>
                )}
                <ChevronsUpDown className="h-3 w-3 text-slate-300 pointer-events-none" />
            </div>
            {isOpen && filtered.length > 0 && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl max-h-48 overflow-y-auto custom-scrollbar anim-in-fade-up">
                    {filtered.map((opt: any, i: number) => (
                        <div
                            key={i}
                            className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none flex justify-between items-center group/item text-[10px]"
                            onMouseDown={(e) => {
                                e.preventDefault()
                                onChange(opt.label)
                                setIsOpen(false)
                            }}
                        >
                            {opt.label}
                            <Plus className="h-3 w-3 text-slate-300 group-hover/item:text-primary" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
