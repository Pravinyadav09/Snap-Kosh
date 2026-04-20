"use client"

import { API_BASE } from '@/lib/api'

import React, { useState, useEffect } from "react"
import {
    Target,
    Printer,
    Plus,
    Trash,
    Calculator,
    Zap,
    BookOpen,
    Maximize,
    Hash,
    Minus,
    Layers,
    Scissors,
    FileText,
    Layout,
    Trash2
} from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { DropdownRegistrySelect } from "./dropdown-registry-select"
import { SearchableSelect } from "./searchable-select"
import { MasterAutocomplete } from "./master-autocomplete"

export function CostEstimator({
    onChange,
    initialQty,
    initialRate,
    initialDescription = ""
}: {
    onChange?: (data: { 
        qty: number, 
        rate: number, 
        description: string,
        splitItems?: { qty: number, rate: number, description: string }[] 
    }) => void,
    initialQty?: number,
    initialRate?: number,
    initialDescription?: string
}) {
    const [activeTab, setActiveTab] = useState("standard")
    const [hasInitialized, setHasInitialized] = useState(false)

    // Master Selection States (Categorized Linkage)
    const [processCategory, setProcessCategory] = useState("")
    const [processProductName, setProcessProductName] = useState("")
    const [processGsm, setProcessGsm] = useState("")
    const [processSize, setProcessSize] = useState("")
    const [localSizeGsm, setLocalSizeGsm] = useState("")

    const [masterProcesses, setMasterProcesses] = useState<any[]>([])
    const [manualRate, setManualRate] = useState<number | string>(initialRate || "")

    // Standard Print States
    const [quantity, setQuantity] = useState<number | string>("")
    const [ups, setUps] = useState<number | string>(2)
    const [wastage, setWastage] = useState<number | string>(20)
    const [margin, setMargin] = useState<number | string>("")
    
    // Book Estimation States
    const [bookQuantity, setBookQuantity] = useState<number | string>("")
    const [bookPages, setBookPages] = useState(100)
    const [bookSize, setBookSize] = useState("A5")
    const [bookCoverPaper, setBookCoverPaper] = useState("")
    const [bookInnerPaper, setBookInnerPaper] = useState("")
    const [bookCoverUps, setBookCoverUps] = useState(2)
    const [bookInnerUps, setBookInnerUps] = useState(4)
    const [bookCoverWastage, setBookCoverWastage] = useState(10)
    const [bookInnerWastage, setBookInnerWastage] = useState(50)
    const [bookBinding, setBookBinding] = useState("perfect")
    const [bookLamination, setBookLamination] = useState("none")
    const [bookCoverMachine, setBookCoverMachine] = useState("")
    const [bookSpecialFinishes, setBookSpecialFinishes] = useState("none")
    
    // Wide Format States
    const [wideWidth, setWideWidth] = useState<number | string>(36)
    const [wideHeight, setWideHeight] = useState<number | string>(24)
    const [wideQuantity, setWideQuantity] = useState<number | string>("")
    const [wideMedia, setWideMedia] = useState("flex")
    const [wideMachine, setWideMachine] = useState("eco")
    const [wideMargin, setWideMargin] = useState<number | string>("")

    const [papers, setPapers] = useState<any[]>([])
    const [machines, setMachines] = useState<any[]>([])
    const [availableProcesses, setAvailableProcesses] = useState<any[]>([])
    const [processes, setProcesses] = useState<{id: string, category: string, productName: string, quantity: number | string, rate: number | string, size?: string, gsm?: string}[]>([])
    
    // Selection State
    const [selectedPaperStr, setSelectedPaperStr] = useState("")
    const [selectedMachineStr, setSelectedMachineStr] = useState("")
    const [colorMode, setColorMode] = useState("bw")

    const addProcess = () => {
        setProcesses([...processes, {
            id: Math.random().toString(),
            category: "",
            productName: "",
            quantity: "",
            rate: "0.00"
        }])
    }

    const removeProcess = (id: string) => {
        setProcesses(processes.filter((p) => p.id !== id))
    }

    const updateProcessVal = (id: string, field: string, val: any) => {
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    }

    const updateProcessMulti = (id: string, updates: Record<string, any>) => {
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }

    // 1. Data Loading Effect (Run Once)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [procRes, paperRes, machineRes] = await Promise.all([
                    fetch(`${API_BASE}/api/processes`),
                    fetch(`${API_BASE}/api/SpecializedInventory/paper`),
                    fetch(`${API_BASE}/api/machines`)
                ]);
                
                const procs = await procRes.json();
                const papersData = await paperRes.json();
                const machinesData = await machineRes.json();

                const safeProcs = Array.isArray(procs) ? procs : [];
                setAvailableProcesses(safeProcs);
                setMasterProcesses(safeProcs); 
                setPapers(Array.isArray(papersData) ? papersData : []);
                setMachines(Array.isArray(machinesData) ? machinesData : []);
            } catch (err) {
                console.error("Failed to load calculator master data", err);
            }
        };
        loadInitialData();
    }, []);

    // 1.1 Master Logic Effect (Auto-Pricing - Enhanced Slab Support)
    useEffect(() => {
        if (activeTab !== 'standard' || !processCategory || !processProductName) return;
        
        // Search in BOTH Processes and Papers for pricing
        const match = [...availableProcesses, ...papers].find(p => {
            // Identify source to avoid field collision (Paper uses name for Category, type for Product)
            const isPaper = p.unitPrice !== undefined || p.UnitPrice !== undefined || p.itemCode?.startsWith('STK');
            
            const cat = (isPaper ? (p.name || p.Name) : (p.type || p.Type || p.name || p.Name) || "").toLowerCase().trim();
            const prod = (isPaper ? (p.type || p.Type) : (p.productName || p.ProductName || p.type || p.Type) || "").toLowerCase().trim();
            
            // Fuzzy match for Size (X vs x and spaces)
            const cleanSize = (val: any) => (val || "").toString().toLowerCase().replace(/\s+/g, '').replace(/x/g, 'x').replace(/×/g, 'x');
            const pSize = cleanSize(p.size || p.Size);
            const targetSize = cleanSize(processSize);

            const catMatches = cat === processCategory.toLowerCase().trim();
            const prodMatches = prod === processProductName.toLowerCase().trim();
            const gsmMatches = processGsm ? (p.gsm || p.GSM || "").toString() === processGsm.toString() : true;
            const sizeMatches = processSize ? pSize === targetSize : true;

            return catMatches && prodMatches && gsmMatches && sizeMatches;
        });

        if (match) {
            let price = Number(match.unit || match.Unit || match.unitPrice || match.UnitPrice || 0);
            const slabsJson = match.priceSlabsJson || match.PriceSlabsJson;
            
            if (slabsJson) {
                try {
                    const slabs = JSON.parse(slabsJson);
                    const qtyNum = Number(quantity);
                    
                    // Sort slabs by 'from' to ensure correct range matching
                    const sortedSlabs = [...slabs].sort((a, b) => (Number(a.from) || 0) - (Number(b.from) || 0));
                    
                    // Find matching slab
                    let matchedSlab = sortedSlabs.find((s: any) => qtyNum >= Number(s.from) && qtyNum <= Number(s.to));

                    // Fallback: If quantity exceeds highest slab, take highest slab rate
                    if (!matchedSlab && sortedSlabs.length > 0 && qtyNum > Number(sortedSlabs[sortedSlabs.length - 1].to)) {
                        matchedSlab = sortedSlabs[sortedSlabs.length - 1];
                    }

                    if (matchedSlab) {
                        price = Number(matchedSlab.price || matchedSlab.Rate || matchedSlab.rate);
                    }
                } catch (e) {
                    console.error("Slab parsing error", e);
                }
            }
            
            // Sync with manualRate input immediately
            setManualRate(price.toString());
        } else {
            // Default to 0 if no match found
            setManualRate("0.00");
        }
    }, [processCategory, processProductName, processGsm, processSize, quantity, availableProcesses, papers, activeTab]);

    // 2. State Reconstruction from initialDescription
    useEffect(() => {
        if (hasInitialized || !initialDescription) return;

        const desc = initialDescription.toUpperCase();
        if (desc.includes("BOOK")) {
            setActiveTab("book");
            const matches = desc.match(/(\d+)\s*QTY\s*\|\s*(\d+)\s*PGS/);
            if (matches) {
                setBookQuantity(parseInt(matches[1]));
                setBookPages(parseInt(matches[2]));
            }
            if (desc.includes("PERFECT")) setBookBinding("perfect");
            else if (desc.includes("STAPLE") || desc.includes("CENTER PIN")) setBookBinding("staple");
            else if (desc.includes("SPIRAL")) setBookBinding("spiral");

            const coverMatch = desc.match(/COVER:\s*([^|]+)/);
            if (coverMatch) setBookCoverPaper(coverMatch[1].trim().toLowerCase());

            const innerMatch = desc.match(/INNER:\s*([^|]+)/);
            if (innerMatch) setBookInnerPaper(innerMatch[1].trim().toLowerCase());
            
            const machineMatch = desc.match(/MACHINE:\s*([^|]+)/);
            if (machineMatch) setBookCoverMachine(machineMatch[1].trim().toLowerCase());

            const lamMatch = desc.match(/LAMINATION:\s*([^|]+)/);
            if (lamMatch) setBookLamination(lamMatch[1].trim().toLowerCase());

            const finishMatch = desc.match(/FINISH:\s*([^|]+)/);
            if (finishMatch) {
                if (desc.includes("SPOT-UV") || desc.includes("SPOT UV")) setBookSpecialFinishes("spot-uv");
                else if (desc.includes("FOILING")) setBookSpecialFinishes("foiling");
                else setBookSpecialFinishes("none");
            }
        } else if (desc.includes("WIDE")) {
            setActiveTab("wide");
            const qtyMatch = desc.match(/(\d+)\s*QTY/);
            if (qtyMatch) setWideQuantity(parseInt(qtyMatch[1]));
            
            const dimMatch = desc.match(/(\d+)"X(\d+)"/);
            if (dimMatch) {
                setWideWidth(parseInt(dimMatch[1]));
                setWideHeight(parseInt(dimMatch[2]));
            }
            
            if (desc.includes("FLEX")) setWideMedia("flex");
            else if (desc.includes("VINYL")) setWideMedia("vinyl");
            else if (desc.includes("BACKLIT")) setWideMedia("backlit");
            else if (desc.includes("CANVAS")) setWideMedia("canvas");

            const mMatch = desc.match(/MACHINE:\s*([^|]+)/);
            if (mMatch) setWideMachine(mMatch[1].trim().toLowerCase());
        } else {
            setActiveTab("standard");
            if (desc.includes("COLOR")) setColorMode("color");
            else if (desc.includes("BW")) setColorMode("bw");
            
            const qtyMatch = desc.match(/(\d+)\s*QTY/);
            if (qtyMatch) setQuantity(parseInt(qtyMatch[1]));

            const paperMatch = desc.match(/QTY ON ([^|]+)/);
            if (paperMatch) setSelectedPaperStr(paperMatch[1].trim().toLowerCase());

            const machineMatch = desc.match(/MACHINE:\s*([^|]+)/);
            if (machineMatch) setSelectedMachineStr(machineMatch[1].trim().toLowerCase());

            const procMatch = desc.match(/PROCESSES: ([^|]+)/);
            if (procMatch) {
                const procNames = procMatch[1].split(',').map(s => s.trim());
                setProcesses(procNames.map(name => ({ 
                    id: Math.random().toString(), 
                    category: "", 
                    productName: name, 
                    quantity: "",
                    rate: "0.00" 
                })));
            }
        }
        setHasInitialized(true);
    }, [initialDescription, hasInitialized]);

    // 3. Simple State sync for new items without description
    useEffect(() => {
        if (!initialDescription && initialQty && !hasInitialized) {
            setQuantity(initialQty);
            setBookQuantity(initialQty);
            setWideQuantity(initialQty);
        }
    }, [initialQty, initialDescription, hasInitialized]);

    const bindingStylesFallback = [
        { value: "perfect", label: "Perfect Binding" },
        { value: "staple", label: "Center Pin / Staple" },
        { value: "spiral", label: "Spiral / Wire-O" }
    ];
    const laminationTypesFallback = [
        { value: "none", label: "None" },
        { value: "gloss", label: "Gloss Lamination" },
        { value: "matte", label: "Matte Lamination" }
    ];
    const wideMediaOptionsFallback = [
        { value: "flex", label: "Frontlit Flex (Standard)" },
        { value: "vinyl", label: "Star Vinyl (Gloss/Matte)" },
        { value: "backlit", label: "Backlit Media" },
        { value: "canvas", label: "Art Canvas" }
    ];

    // 4. Standard Calculations
    const qtyVal = parseFloat(quantity.toString()) || 0;
    const upsVal = parseFloat(ups.toString()) || 1;
    const wastageVal = parseFloat(wastage.toString()) || 0;
    const calculatedSheets = Math.ceil(qtyVal / upsVal) + wastageVal;
    const selectedPaperObj = papers.find(p => p.id?.toString() === selectedPaperStr || p.name === selectedPaperStr);
    const paperCostPerSheet = selectedPaperObj ? (selectedPaperObj.unitPrice || 2.50) : 0;
    const paperCost = calculatedSheets * paperCostPerSheet;
    const clickRate = colorMode === "color" ? 5.00 : 1.20;
    const printCost = calculatedSheets * clickRate;
    const postPressCost = processes.reduce((acc, p) => acc + (Number(p.rate) || 0), 0);
    const baseCost = paperCost + printCost + postPressCost;
    const marginVal = parseFloat(margin.toString()) || 0;
    const quantityVal = parseFloat(quantity.toString()) || 0;
    const ratePerUnit = quantityVal > 0 ? (baseCost + (baseCost * (marginVal / 100))) / quantityVal : 0;

    // 5. Book Calculations
    const coverPaperObj = papers.find(p => p.id?.toString() === bookCoverPaper || p.name === bookCoverPaper);
    const innerPaperObj = papers.find(p => p.id?.toString() === bookInnerPaper || p.name === bookInnerPaper);
    
    const coverPrice = coverPaperObj ? coverPaperObj.unitPrice : 8.00;
    const innerPrice = innerPaperObj ? innerPaperObj.unitPrice : 1.50;
    
    const bookQtyVal = parseFloat(bookQuantity.toString()) || 0;
    const totalCoverSheets = Math.ceil(bookQtyVal / bookCoverUps) + bookCoverWastage;
    const coverCost = (totalCoverSheets * coverPrice) + (totalCoverSheets * 10); 
    const laminationPrice = bookLamination === "none" ? 0 : 2 * bookQtyVal;
    
    const innerSheetsPerBook = Math.ceil(bookPages / (bookInnerUps * 2)); 
    const totalInnerSheets = (bookQtyVal * innerSheetsPerBook) + bookInnerWastage;
    const innerCost = (totalInnerSheets * innerPrice) + (totalInnerSheets * 2.5); 
    
    const bindingPrice = bookBinding === "perfect" ? 15 : (bookBinding === "staple" ? 3 : 10);
    const totalBinding = bookQtyVal * bindingPrice;
    
    const bookTotalNet = coverCost + innerCost + totalBinding + laminationPrice;
    const marginValBook = parseFloat(margin.toString()) || 0;
    const bookFinalRate = bookQtyVal > 0 ? (bookTotalNet + (bookTotalNet * (marginValBook / 100))) / bookQtyVal : 0;

    // 6. Wide Format Calculations
    const wWidth = parseFloat(wideWidth.toString()) || 0;
    const wHeight = parseFloat(wideHeight.toString()) || 0;
    const wQty = parseFloat(wideQuantity.toString()) || 0;
    const totalSqFt = (wWidth * wHeight / 144) * wQty;
    const mediaPrice = wideMedia === "flex" ? 15 : (wideMedia === "vinyl" ? 25 : 45);
    const wideNet = totalSqFt * mediaPrice;
    const wideMarginVal = parseFloat(wideMargin.toString()) || 0;
    const wideQtyVal = parseFloat(wideQuantity.toString()) || 0;
    const wideFinalRate = wideQtyVal > 0 ? (wideNet + (wideNet * (wideMarginVal / 100))) / wideQtyVal : 0;

    // 7. Output Result sync
    useEffect(() => {
        if (onChange) {
            if (activeTab === "standard") {
                const paperName = processProductName || (selectedPaperObj ? selectedPaperObj.name : (selectedPaperStr ? selectedPaperStr : ''));
                const catStr = processCategory ? `[${processCategory}] ` : '';
                const gsmStr = processGsm ? ` (${processGsm} GSM)` : '';
                const sizeAppend = processSize ? ` | Size: ${processSize}` : (selectedPaperObj?.size ? ` | Size: ${selectedPaperObj.size}` : '');
                const machineObj = machines.find(m => m.id?.toString() === selectedMachineStr || m.name?.toLowerCase() === selectedMachineStr?.toLowerCase());
                const machineAppend = machineObj ? ` | Machine: ${machineObj.name}` : (selectedMachineStr ? ` | Machine: ${selectedMachineStr}` : '');
                
                // Combined description for fallback
                let combinedDesc = `${quantity} Qty ${catStr}${paperName}${gsmStr}${sizeAppend}${machineAppend}`;
                const postPressNames = processes.filter(p => p.productName || p.category).map(p => p.productName || p.category);
                if (postPressNames.length > 0) combinedDesc += ` | Processes: ${postPressNames.join(', ')}`;
                
                const finalRateValue = Number(manualRate) > 0 ? Number(manualRate) : Number(ratePerUnit);
                
                // MAIN ITEM (excluding processes for split)
                const marginMultiplier = (1 + (marginVal / 100));
                const mainBaseRatePerSheet = (paperCost + printCost) / (parseFloat(quantity.toString()) || 1);
                const mainRateFinal = Number(manualRate) > 0 ? Number(manualRate) : (mainBaseRatePerSheet * marginMultiplier);
                
                const mainItem = {
                    qty: parseFloat(quantity.toString()) || 0,
                    rate: mainRateFinal,
                    description: `${catStr}${paperName}${gsmStr}${sizeAppend}${machineAppend}`.trim()
                };

                // PROCESS ITEMS
                const splitItems = processes.filter(p => p.productName || p.category).map(p => {
                    const pRate = parseFloat(p.rate.toString()) || 0;
                    const szStr = p.size ? ` | Size: ${p.size}` : '';
                    const gsmStr = p.gsm ? ` (${p.gsm} GSM)` : '';
                    return {
                        qty: parseFloat(p.quantity.toString()) || 0,
                        rate: pRate,
                        description: `Process: ${p.category}${p.category && p.productName ? ' - ' : ''}${p.productName}${gsmStr}${szStr}`.trim()
                    };
                });

                onChange({ 
                    qty: mainItem.qty, 
                    rate: finalRateValue, // Keep combined rate for backward compatibility if needed
                    description: combinedDesc.trim(),
                    splitItems: [mainItem, ...splitItems]
                });
            } else if (activeTab === "book") {
                const machineObj = machines.find(m => m.id?.toString() === bookCoverMachine || m.name?.toLowerCase() === bookCoverMachine?.toLowerCase());
                const machineAppend = machineObj ? ` | Machine: ${machineObj.name}` : '';
                const coverStr = coverPaperObj?.name || bookCoverPaper;
                const innerStr = innerPaperObj?.name || bookInnerPaper;
                const lamStr = bookLamination !== "none" ? ` | Lamination: ${bookLamination}` : '';
                const finishStr = bookSpecialFinishes !== "none" ? ` | Finish: ${bookSpecialFinishes}` : '';
                const desc = `BOOK | ${bookQuantity} Qty | ${bookPages} Pgs | ${bookBinding.toUpperCase()} | Cover: ${coverStr} | Inner: ${innerStr}${machineAppend}${lamStr}${finishStr}`;
                onChange({ qty: bookQtyVal, rate: Number(bookFinalRate) || 0, description: desc, splitItems: [{ qty: bookQtyVal, rate: Number(bookFinalRate) || 0, description: desc }] });
            } else if (activeTab === "wide") {
                const machineObj = machines.find(m => m.id?.toString() === wideMachine || m.name?.toLowerCase() === wideMachine?.toLowerCase());
                const machineAppend = machineObj ? ` | Machine: ${machineObj.name}` : '';
                const desc = `WIDE | ${wideQuantity} Qty | ${wideWidth}"x${wideHeight}" | ${wideMedia.toUpperCase()}${machineAppend}`;
                onChange({ qty: parseFloat(wideQuantity.toString()) || 0, rate: Number(wideFinalRate) || 0, description: desc, splitItems: [{ qty: parseFloat(wideQuantity.toString()) || 0, rate: Number(wideFinalRate) || 0, description: desc }] });
            }
        }
    }, [activeTab, ratePerUnit, quantity, selectedPaperStr, colorMode, processes, bookFinalRate, bookQuantity, bookPages, bookBinding, wideFinalRate, wideQuantity, wideWidth, wideHeight, wideMedia, onChange, selectedPaperObj, coverPaperObj, selectedMachineStr, bookCoverMachine, wideMachine, machines, bookCoverPaper, bookLamination, bookSpecialFinishes]);

    return (
        <div className="bg-white flex flex-col h-full max-h-[85vh]">
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3 bg-white border border-slate-200 p-1 h-11 rounded-xl shadow-sm mb-8">
                        <TabsTrigger
                            value="standard"
                            className="rounded-lg px-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight sm:tracking-wider data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 transition-all h-9 gap-1.5 whitespace-nowrap"
                        >
                            <Printer className="h-4 w-4" /> <span className="hidden xs:inline">Standard</span><span className="xs:hidden">Std</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="book"
                            className="rounded-lg px-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight sm:tracking-wider data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 transition-all h-9 gap-1.5 whitespace-nowrap"
                        >
                            <BookOpen className="h-4 w-4" /> <span className="hidden xs:inline">Book</span><span className="xs:hidden">Book</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="wide"
                            className="rounded-lg px-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight sm:tracking-wider data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 transition-all h-9 gap-1.5 whitespace-nowrap"
                        >
                            <Maximize className="h-4 w-4" /> <span className="hidden xs:inline">Wide</span><span className="xs:hidden">Wide</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="standard" className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            <div className="md:col-span-12 space-y-6">                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600 flex justify-between">
                                            Category <span className="text-primary italic normal-case text-[10px]">Linked to Paper Master</span>
                                        </Label>
                                        <MasterAutocomplete
                                            category="PaperCategory"
                                            value={processCategory}
                                            onChange={setProcessCategory}
                                            placeholder="Select Category"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Product Name</Label>
                                        <MasterAutocomplete
                                            category="PaperProductName"
                                            value={processProductName}
                                            onChange={setProcessProductName}
                                            placeholder="Select Product"
                                            filters={{ category: processCategory }}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Size & GSM : *</Label>
                                        <MasterAutocomplete
                                            category="PaperSizeGSM"
                                            value={localSizeGsm}
                                            onChange={(val) => {
                                                setLocalSizeGsm(val);
                                                if (!val) {
                                                    setProcessSize("");
                                                    setProcessGsm("");
                                                    return;
                                                }
                                                // Background sync: Try to parse but don't force the input text
                                                if (val.includes(' - ')) {
                                                    const parts = val.split(' - ');
                                                    setProcessSize(parts[0].trim());
                                                    if (parts[1]) setProcessGsm(parts[1].replace(/ GSM/i, '').trim());
                                                } else {
                                                    setProcessSize(val.replace(/ GSM/i, '').trim());
                                                }
                                            }}
                                            placeholder="eg. 12x18 - 300 Gsm"
                                            filters={{ category: processCategory, productName: processProductName }}
                                        />
                                    </div>
                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-lg border border-slate-200">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Quantity</Label>
                                        <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Unit Price (₹)</Label>
                                        <Input type="number" value={manualRate} onChange={e => setManualRate(e.target.value)} className="h-9 font-bold border-slate-200 bg-white rounded-md text-primary" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Amount</Label>
                                        <div className="h-9 flex items-center px-3 font-bold text-slate-700 bg-slate-100/50 rounded-md border border-slate-200">
                                            ₹{(Number(quantity) * Number(manualRate)).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                
                                {activeTab === "standard" && (
                                    <div className="pt-2 pb-1 bg-slate-50/30 p-5 rounded-xl border border-slate-100 mt-2">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                                                <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fast Selection</span>
                                                <span className="text-[9px] font-bold text-slate-400 -mt-1">Options linked to {processCategory || "selected paper"}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            {Array.from(new Set(availableProcesses
                                                .filter(ap => !processCategory || (ap.type || ap.Type || ap.name || ap.Name || "").toLowerCase().trim() === processCategory.toLowerCase().trim())
                                                .map(ap => ap.name || ap.Name)
                                            )).map(type => {
                                                const isSelected = processes.some(p => p.category.toLowerCase().trim() === type.toLowerCase().trim());
                                                return (
                                                    <label key={type} className={`
                                                        flex items-center gap-2.5 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer select-none group/opt
                                                        ${isSelected 
                                                            ? 'bg-primary border-primary text-white shadow-md scale-105' 
                                                            : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30 hover:shadow-sm'}
                                                    `}>
                                                        <input 
                                                            type="checkbox" 
                                                            className="hidden" 
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    const match = availableProcesses.find(ap =>
                                                                        (ap.name || ap.Name || "").toLowerCase().trim() === type.toLowerCase().trim()
                                                                    );
                                                                    const newId = Math.random().toString();
                                                                    setProcesses(prev => [...prev, {
                                                                        id: newId,
                                                                        category: type,
                                                                        productName: match?.productName || match?.ProductName || "",
                                                                        quantity: quantity,
                                                                        rate: "0.00"
                                                                    }]);
                                                                    
                                                                    setTimeout(() => {
                                                                        if (match) {
                                                                            const sj = match.priceSlabsJson || match.PriceSlabsJson;
                                                                            if (sj) {
                                                                                try {
                                                                                    const slabs = JSON.parse(sj);
                                                                                    const qNum = Number(quantity);
                                                                                    const sorted = [...slabs].sort((a, b) => Number(a.from) - Number(b.from));
                                                                                    let mSlab = sorted.find((s: any) => qNum >= Number(s.from) && qNum <= Number(s.to));
                                                                                    if (!mSlab && sorted.length > 0 && qNum > Number(sorted[sorted.length-1].to)) mSlab = sorted[sorted.length-1];
                                                                                    if (mSlab) updateProcessVal(newId, 'rate', (mSlab.price || mSlab.rate).toString());
                                                                                } catch {}
                                                                            }
                                                                        }
                                                                    }, 150);
                                                                } else {
                                                                    setProcesses(prev => prev.filter(p => p.category.toLowerCase().trim() !== type.toLowerCase().trim()));
                                                                }
                                                            }}
                                                        />
                                                        <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-white' : 'bg-slate-50 border border-slate-200'}`}>
                                                            {isSelected && <Plus className="h-3 w-3 text-primary stroke-[3]" />}
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{type}</span>
                                                    </label>
                                                )
                                            })}

                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-medium text-slate-600">Post-Press & Finishing</Label>
                                        <Button onClick={addProcess} size="sm" variant="outline" className="h-7 text-[10px] font-bold text-primary uppercase tracking-wider hover:bg-slate-50 border-slate-200 transition-colors">
                                            <Plus className="h-3 w-3 mr-1" /> Add Add-on Process
                                        </Button>
                                    </div>
                                    
                                    {processes.length === 0 ? (
                                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                                                <Layers className="h-5 w-5 opacity-20" />
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">No additional processes defined</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {processes.map((p, i) => (
                                                <div key={p.id} className="relative p-6 border border-slate-200 bg-white rounded-xl shadow-sm hover:border-primary/20 transition-all group space-y-5">
                                                    {/* Header/Remove Row */}
                                                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                                {i + 1}
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Add-on Process</span>
                                                        </div>
                                                        <Button onClick={() => removeProcess(p.id)} size="sm" variant="ghost" className="h-7 px-2 text-[10px] font-bold text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                                            <Trash2 className="h-3 w-3 mr-1" /> REMOVE
                                                        </Button>
                                                    </div>

                                                    {/* Row 1: Cat | Prod | Size */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-medium text-slate-600">Category</Label>
                                                            <MasterAutocomplete
                                                                category="OperationCategory"
                                                                value={p.category}
                                                                onChange={(val) => {
                                                                    const match = availableProcesses.find(ap =>
                                                                        (ap.Name || ap.name || ap.Type || ap.type || "").toLowerCase().trim() === val.toLowerCase().trim()
                                                                    );
                                                                    const updates: Record<string, any> = { category: val };
                                                                    if (match) {
                                                                        updates.productName = match.ProductName || match.productName || match.Name || match.name || "";
                                                                        updates.size = match.Size || match.size || "";
                                                                        updates.gsm = match.GSM || match.gsm || match.gSM || "";
                                                                        let rate = Number(match.Unit || match.unit || 0);
                                                                        const sj = match.PriceSlabsJson || match.priceSlabsJson;
                                                                        if (sj) {
                                                                            try {
                                                                                const slabs = JSON.parse(sj);
                                                                                const qNum = Number(p.quantity);
                                                                                const sorted = [...slabs].sort((a, b) => Number(a.from) - Number(b.from));
                                                                                let mSlab = sorted.find((s: any) => qNum >= Number(s.from) && qNum <= Number(s.to));
                                                                                if (!mSlab && sorted.length > 0 && qNum > Number(sorted[sorted.length-1].to)) mSlab = sorted[sorted.length-1];
                                                                                if (mSlab) rate = Number(mSlab.price || mSlab.rate);
                                                                            } catch {}
                                                                        }
                                                                        updates.rate = rate.toString();
                                                                    }
                                                                    updateProcessMulti(p.id, updates);
                                                                }}
                                                                placeholder="Select Category"
                                                                filters={{}}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-medium text-slate-600">Product Name</Label>
                                                            <MasterAutocomplete
                                                                category="OperationName"
                                                                value={p.productName}
                                                                onChange={(val) => {
                                                                    const match = availableProcesses.find(ap => {
                                                                        const apProd = (ap.ProductName || ap.productName || ap.Name || ap.name || "").toLowerCase();
                                                                        const apCat = (ap.Name || ap.name || ap.Type || ap.type || "").toLowerCase();
                                                                        const catOk = !p.category || apCat === p.category.toLowerCase();
                                                                        return apProd === val.toLowerCase() && catOk;
                                                                    });
                                                                    const updates: Record<string, any> = { productName: val };
                                                                    if (match) {
                                                                        updates.size = match.Size || match.size || "";
                                                                        updates.gsm = match.GSM || match.gsm || match.gSM || "";
                                                                        let priceVal = Number(match.Unit || match.unit || 0);
                                                                        const slabsJson = match.PriceSlabsJson || match.priceSlabsJson;
                                                                        if (slabsJson) {
                                                                            try {
                                                                                const slabs = JSON.parse(slabsJson);
                                                                                const qNum = Number(p.quantity);
                                                                                const sorted = [...slabs].sort((a, b) => Number(a.from) - Number(b.from));
                                                                                let mSlab = sorted.find((s: any) => qNum >= Number(s.from) && qNum <= Number(s.to));
                                                                                if (!mSlab && sorted.length > 0 && qNum > Number(sorted[sorted.length-1].to)) mSlab = sorted[sorted.length-1];
                                                                                if (mSlab) priceVal = Number(mSlab.price || mSlab.rate);
                                                                            } catch {}
                                                                        }
                                                                        updates.rate = priceVal.toString();
                                                                    }
                                                                    updateProcessMulti(p.id, updates);
                                                                }}
                                                                placeholder="Select Product"
                                                                filters={{ category: p.category }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5 min-h-[58px]">
                                                            <Label className="text-xs font-medium text-slate-600">Size & GSM : *</Label>
                                                            <div className="h-9 flex items-center px-4 text-xs font-bold text-slate-500 bg-slate-50/50 rounded-md border border-slate-200 italic">
                                                                {(() => {
                                                                    const sz = p.size;
                                                                    const gsm = p.gsm;
                                                                    return (sz || gsm) ? `${sz || '—'} - ${gsm || '—'} GSM` : "N/A for Process";
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Row 2: Qty | Price | Amount */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-lg border border-slate-200">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-medium text-slate-600">Quantity</Label>
                                                            <Input 
                                                                type="number" 
                                                                value={p.quantity} 
                                                                onChange={(e) => {
                                                                    const q = e.target.value;
                                                                    updateProcessVal(p.id, 'quantity', q);
                                                                    // Re-trigger slab lookup
                                                                    const match = availableProcesses.find(ap =>
                                                                        ((ap.productName || ap.ProductName || ap.name || ap.Name || "").toLowerCase().trim() === (p.productName || "").toLowerCase().trim()) &&
                                                                        ((ap.name || ap.Name || ap.type || ap.Type || "").toLowerCase().trim() === (p.category || "").toLowerCase().trim())
                                                                    );
                                                                    if (match) {
                                                                        const sj = match.priceSlabsJson || match.PriceSlabsJson;
                                                                        if (sj) {
                                                                            try {
                                                                                const slabs = JSON.parse(sj);
                                                                                const qNum = Number(q);
                                                                                const sorted = [...slabs].sort((a, b) => Number(a.from) - Number(b.from));
                                                                                let mSlab = sorted.find((s: any) => qNum >= Number(s.from) && qNum <= Number(s.to));
                                                                                if (!mSlab && sorted.length > 0 && qNum > Number(sorted[sorted.length-1].to)) mSlab = sorted[sorted.length-1];
                                                                                if (mSlab) updateProcessVal(p.id, 'rate', (mSlab.price || mSlab.rate).toString());
                                                                            } catch {}
                                                                        }
                                                                    }
                                                                }} 
                                                                className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md" 
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-medium text-slate-600">Unit Price (₹)</Label>
                                                            <Input 
                                                                type="number" 
                                                                value={p.rate} 
                                                                onChange={(e) => updateProcessVal(p.id, 'rate', e.target.value)} 
                                                                className="h-9 border-slate-200 bg-white font-medium text-sm rounded-md text-primary" 
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-medium text-slate-600">Amount</Label>
                                                            <div className="h-9 flex items-center px-4 font-bold text-slate-700 bg-white rounded-md border border-slate-200 shadow-sm">
                                                                ₹{(Number(p.quantity) * Number(p.rate)).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>

                        </div>
                    </TabsContent>

                    {/* Book Estimation Content */}
                    <TabsContent value="book" className="mt-0 outline-none animate-in fade-in slide-in-from-right-10 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            <div className="md:col-span-8 space-y-6">
                                {/* General Book Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-md border border-slate-200 bg-white shadow-sm">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Quantity</Label>
                                        <Input type="number" value={bookQuantity} onChange={e => setBookQuantity(Number(e.target.value))} className="h-9 border-slate-200 font-bold rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">No. of Pages (Inner)</Label>
                                        <Input type="number" value={bookPages} onChange={e => setBookPages(Number(e.target.value))} className="h-9 border-slate-200 font-bold rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Size</Label>
                                        <Input placeholder="e.g. A5 or 5.5x8.5" value={bookSize} onChange={e => setBookSize(e.target.value)} className="h-9 border-slate-200 font-bold rounded-md" />
                                    </div>
                                </div>

                                {/* Cover Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-l-2 border-primary pl-3">1. Cover Configuration</h3>
                                    <div className="grid grid-cols-1 gap-4 p-5 rounded-md border border-slate-200 bg-white shadow-sm">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Cover Paper</Label>
                                            <SearchableSelect
                                                options={papers.map(p => ({ value: p.id?.toString() || p.name, label: p.name }))}
                                                value={bookCoverPaper}
                                                onValueChange={setBookCoverPaper}
                                                placeholder="Select Paper"
                                                className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Ups</Label>
                                                <Input type="number" value={bookCoverUps} onChange={e => setBookCoverUps(Number(e.target.value))} className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Wastage</Label>
                                                <Input type="number" value={bookCoverWastage} onChange={e => setBookCoverWastage(Number(e.target.value))} className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Print Machine (Cover)</Label>
                                            <SearchableSelect
                                                options={machines.map(m => ({ value: m.id?.toString() || m.name, label: m.name }))}
                                                value={bookCoverMachine}
                                                onValueChange={setBookCoverMachine}
                                                placeholder="Select Machine"
                                                className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Lamination</Label>
                                                <DropdownRegistrySelect
                                                    category="Lamination"
                                                    value={bookLamination}
                                                    onValueChange={setBookLamination}
                                                    placeholder="Select Lamination"
                                                    className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm"
                                                    fallbackOptions={laminationTypesFallback}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Special Finishes</Label>
                                                <Select value={bookSpecialFinishes} onValueChange={setBookSpecialFinishes}>
                                                    <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm">
                                                        <SelectValue placeholder="Select Finishes" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="spot-uv">Spot UV (Logo)</SelectItem>
                                                        <SelectItem value="foiling">Gold Foiling</SelectItem>
                                                        <SelectItem value="embossing">Embossing</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Inner Pages Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-l-2 border-primary pl-3">2. Inner Pages</h3>
                                    <div className="grid grid-cols-1 gap-4 p-5 rounded-md border border-slate-200 bg-white shadow-sm">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Inner Paper Type</Label>
                                            <SearchableSelect
                                                options={papers.map(p => ({ value: p.id?.toString() || p.name, label: p.name }))}
                                                value={bookInnerPaper}
                                                onValueChange={setBookInnerPaper}
                                                placeholder="Select Paper"
                                                className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Ups per Sheet</Label>
                                                <Input type="number" value={bookInnerUps} onChange={e => setBookInnerUps(Number(e.target.value))} className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Wastage (Sheets)</Label>
                                                <Input type="number" value={bookInnerWastage} onChange={e => setBookInnerWastage(Number(e.target.value))} className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Binding Style</Label>
                                                <DropdownRegistrySelect
                                                    category="BookBinding"
                                                    value={bookBinding}
                                                    onValueChange={setBookBinding}
                                                    className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm"
                                                    fallbackOptions={bindingStylesFallback}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Book Summary Card */}
                             <div className="md:col-span-4 sticky top-0">
                                 <Card className="shadow-sm border border-slate-200 rounded-md overflow-hidden bg-white">
                                     <CardHeader className="py-4 px-5 border-b border-slate-100 bg-slate-50/50">
                                         <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Book Summary</CardTitle>
                                         <div className="mt-3 space-y-2">
                                             <div className="flex justify-between items-center text-xs">
                                                 <span className="text-slate-500">Cover:</span>
                                                 <span className="font-bold text-slate-800">₹{coverCost.toLocaleString()}</span>
                                             </div>
                                             <div className="flex justify-between items-center text-xs">
                                                 <span className="text-slate-500">Inners:</span>
                                                 <span className="font-bold text-slate-800">₹{innerCost.toLocaleString()}</span>
                                             </div>
                                             <div className="flex justify-between items-center text-xs">
                                                 <span className="text-slate-500">Binding:</span>
                                                 <span className="font-bold text-slate-800">₹{totalBinding.toLocaleString()}</span>
                                             </div>
                                         </div>
                                     </CardHeader>
                                     <CardContent className="p-6 text-center">
                                         <div className="space-y-1 mb-6">
                                             <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Total Book Cost</p>
                                             <p className="text-4xl font-bold tracking-tight text-slate-900 leading-none">₹{bookTotalNet.toLocaleString()}</p>
                                         </div>
                                         <div className="p-3 bg-slate-50 rounded-md mb-4 flex justify-between items-center">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">Rate / Book</span>
                                            <span className="text-xl font-bold text-primary">₹{bookFinalRate.toFixed(2)}</span>
                                         </div>
                                         <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest px-2 leading-relaxed">
                                            Inc. {margin}% margin calculation
                                         </div>
                                     </CardContent>
                                 </Card>
                             </div>
                        </div>
                    </TabsContent>

                    {/* Wide Format Content */}
                    <TabsContent value="wide" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-10 duration-600">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            <div className="md:col-span-8 space-y-6">
                                {/* Job Details (Wide Format) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-md border border-slate-200 shadow-sm">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-bold text-slate-500 uppercase">Width (In)</Label>
                                                <Input type="number" value={wideWidth} onChange={e => setWideWidth(e.target.value)} className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-bold text-slate-500 uppercase">Height (In)</Label>
                                                <Input type="number" value={wideHeight} onChange={e => setWideHeight(e.target.value)} className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase">Quantity</Label>
                                            <Input type="number" value={wideQuantity} onChange={e => setWideQuantity(e.target.value)} className="h-9 border-slate-200 font-bold rounded-md" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase">Media Type</Label>
                                            <DropdownRegistrySelect
                                                category="WideMedia"
                                                value={wideMedia}
                                                onValueChange={setWideMedia}
                                                placeholder="Select Media"
                                                className="h-9 border-slate-200 font-medium rounded-md text-sm"
                                                fallbackOptions={wideMediaOptionsFallback}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase">Select Machine</Label>
                                            <SearchableSelect
                                                options={machines.map(m => ({ value: m.id?.toString() || m.name, label: m.name }))}
                                                value={wideMachine}
                                                onValueChange={setWideMachine}
                                                placeholder="Select Wide Format Machine"
                                                className="h-9 bg-white border-slate-200 rounded-md shadow-sm text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col h-full bg-slate-50/50 rounded-md p-5 border border-slate-100">
                                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-200 pb-2">Real-time Calculation</p>
                                        <div className="space-y-3 flex-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Total Area:</span>
                                                <span className="font-bold text-slate-800">{totalSqFt.toFixed(2)} Sq. Ft</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Base Cost:</span>
                                                <span className="font-bold text-slate-800">₹{wideNet.toLocaleString()}</span>
                                            </div>
                                            <Separator className="bg-slate-200" />
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-xs font-bold uppercase text-primary">Margin:</span>
                                                <span className="text-lg font-bold text-slate-900">{wideMargin}%</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 space-y-4">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center mb-1">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Profit Margin %</Label>
                                                </div>
                                                <Input type="number" value={wideMargin} onChange={e => setWideMargin(e.target.value)} className="h-8 w-full border-slate-200 font-bold rounded-md" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Wide Summary (Compact) */}
                            <div className="md:col-span-4 sticky top-0">
                                <div className="p-6 rounded-md bg-white border border-slate-200 text-center space-y-6 shadow-sm">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Wide Format Rate</p>
                                        <p className="text-5xl font-bold tracking-tight text-slate-900">₹{wideFinalRate.toFixed(2)}</p>
                                    </div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                        Total Job: ₹{(wideFinalRate * (parseFloat(wideQuantity.toString()) || 0)).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
