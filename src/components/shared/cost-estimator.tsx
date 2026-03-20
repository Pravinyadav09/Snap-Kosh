"use client"

import React, { useState } from "react"
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
    Layout
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

export function CostEstimator() {
    const [quantity, setQuantity] = useState(1000)
    const [ups, setUps] = useState(2)
    const [wastage, setWastage] = useState(20)
    const [margin, setMargin] = useState(30)

    // Derived values for standard
    const calculatedSheets = Math.ceil(quantity / ups) + wastage
    const paperCost = calculatedSheets * 3.66
    const printCost = calculatedSheets * 1.04
    const postPressCost = 1300
    const baseCost = paperCost + printCost + postPressCost
    const ratePerUnit = (baseCost + (baseCost * margin / 100)) / quantity

    return (
        <div className="bg-white flex flex-col h-full max-h-[85vh]">
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <Tabs defaultValue="standard" className="w-full">
                    <TabsList className="w-full flex items-center justify-start bg-white border border-slate-200 p-1 h-11 rounded-xl shadow-sm mb-8 overflow-x-auto overflow-y-hidden no-scrollbar flex-nowrap shrink-0">
                        <TabsTrigger
                            value="standard"
                            className="rounded-lg px-6 text-[11px] font-black uppercase tracking-wider data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 transition-all h-9 gap-2 whitespace-nowrap"
                            style={{ ['--active-bg' as any]: 'var(--primary)' }}
                        >
                            <style jsx>{`
                                [data-state=active] { background-color: var(--active-bg) !important; color: white !important; }
                                [data-state=active] :global(svg) { color: white !important; }
                            `}</style>
                            <Printer className="h-4 w-4" /> <span className="hidden xs:inline">Standard Print</span><span className="xs:hidden">Standard</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="book"
                            className="rounded-lg px-6 text-[11px] font-black uppercase tracking-wider data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 transition-all h-9 gap-2 whitespace-nowrap"
                            style={{ ['--active-bg' as any]: 'var(--primary)' }}
                        >
                            <BookOpen className="h-4 w-4" /> <span className="hidden xs:inline">Book Estimation</span><span className="xs:hidden">Book</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="wide"
                            className="rounded-lg px-6 text-[11px] font-black uppercase tracking-wider data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 transition-all h-9 gap-2 whitespace-nowrap"
                            style={{ ['--active-bg' as any]: 'var(--primary)' }}
                        >
                            <Maximize className="h-4 w-4" /> <span className="hidden xs:inline">Wide Format</span><span className="xs:hidden">Wide</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Standard Print Content */}
                    <TabsContent value="standard" className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            <div className="md:col-span-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Select Paper Stock</Label>
                                        <Select defaultValue="300-art">
                                            <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md shadow-sm text-sm">
                                                <SelectValue placeholder="Select Paper" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="300-art">300 GSM Art Card (Gloss)</SelectItem>
                                                <SelectItem value="170-art">170 GSM Art Paper</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Select Machine & Mode</Label>
                                        <div className="flex items-center gap-3">
                                            <Select defaultValue="konica">
                                                <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md shadow-sm flex-1 text-sm">
                                                    <SelectValue placeholder="Select Machine" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="konica">Konica Minolta AccurioPress C7100</SelectItem>
                                                    <SelectItem value="xerox">Xerox Versant 180</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <RadioGroup defaultValue="bw" className="flex items-center gap-3">
                                                <div className="flex items-center space-x-1.5">
                                                    <RadioGroupItem value="color" id="color" className="h-3.5 w-3.5 text-primary border-slate-300" />
                                                    <Label htmlFor="color" className="text-xs font-medium text-slate-600 cursor-pointer">Col</Label>
                                                </div>
                                                <div className="flex items-center space-x-1.5">
                                                    <RadioGroupItem value="bw" id="bw" className="h-3.5 w-3.5 text-primary border-slate-300" />
                                                    <Label htmlFor="bw" className="text-xs font-medium text-slate-600 cursor-pointer">B/W</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-lg border border-slate-200">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Quantity</Label>
                                        <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="h-9 font-bold border-slate-200 bg-white rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Ups</Label>
                                        <Input type="number" value={ups} onChange={e => setUps(Number(e.target.value))} className="h-9 font-bold border-slate-200 bg-white rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Wastage</Label>
                                        <Input type="number" value={wastage} onChange={e => setWastage(Number(e.target.value))} className="h-9 font-bold border-slate-200 bg-white rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Sheets</Label>
                                        <div className="h-9 flex items-center px-3 font-bold text-primary bg-white rounded-md border border-slate-200">
                                            {calculatedSheets}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Post-Press & Finishing</Label>
                                        <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold text-primary uppercase tracking-wider hover:bg-slate-50 border-slate-200">
                                            <Plus className="h-3 w-3 mr-1" /> Add Process
                                        </Button>
                                    </div>
                                    <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
                                        <div className="p-3 flex items-center gap-4 bg-white border-b border-slate-100 last:border-0">
                                            <div className="flex-1 space-y-0.5">
                                                <p className="text-[11px] font-semibold text-slate-800">Gloss Lamination</p>
                                                <p className="text-[9px] text-slate-400">₹2.50 / SQ FT</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">Cost</p>
                                                    <p className="text-xs font-bold text-slate-900">₹1,300</p>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-7 w-7 text-slate-300 hover:text-rose-500 hover:bg-rose-50">
                                                    <Trash className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="p-3 rounded-md border border-slate-200 bg-white shadow-sm flex flex-col justify-between h-16">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Paper Cost</p>
                                        <div className="flex items-end justify-between">
                                            <p className="text-[10px] font-medium text-slate-300">@ ₹3.66</p>
                                            <p className="text-base font-bold text-primary">₹{paperCost.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-md border border-slate-200 bg-white shadow-sm flex flex-col justify-between h-16">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Print Cost</p>
                                        <div className="flex items-end justify-between">
                                            <p className="text-[10px] font-medium text-slate-300">@ ₹1.04</p>
                                            <p className="text-base font-bold text-slate-700">₹{printCost.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-md border border-slate-200 bg-white shadow-sm flex flex-col justify-between h-16">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Post-Press</p>
                                        <div className="flex items-end justify-between">
                                            <p className="text-[10px] font-medium text-slate-300">VARIOUS</p>
                                            <p className="text-base font-bold text-slate-700">₹{postPressCost.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Standard Summary Card */}
                            <div className="md:col-span-4 sticky top-0 space-y-6">
                                <Card className="shadow-sm border border-slate-200 rounded-md overflow-hidden bg-white">
                                    <CardHeader className="bg-slate-50 py-3 px-4 border-b border-slate-200">
                                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Base Estimation</CardTitle>
                                        <div className="mt-1 flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-slate-900 tracking-tight">₹{baseCost.toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Net</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-medium text-slate-600">Margin %</Label>
                                            <Input
                                                type="number"
                                                value={margin}
                                                onChange={e => setMargin(Number(e.target.value))}
                                                className="h-8 w-16 text-center font-bold border-slate-200 rounded-md text-sm"
                                            />
                                        </div>
                                        <Separator className="opacity-50" />
                                        <div className="bg-primary p-3 rounded-md text-white shadow-md shadow-primary/10 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Final Rate/Unit</p>
                                            <div className="text-2xl font-bold tracking-tight">₹{ratePerUnit.toFixed(2)}</div>
                                        </div>
                                    </CardContent>
                                </Card>
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
                                        <Input type="number" defaultValue={100} className="h-9 border-slate-200 font-bold rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">No. of Pages (Inner)</Label>
                                        <Input type="number" defaultValue={100} className="h-9 border-slate-200 font-bold rounded-md" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-600">Size</Label>
                                        <Input placeholder="e.g. A5 or 5.5x8.5" className="h-9 border-slate-200 font-bold rounded-md" />
                                    </div>
                                </div>

                                {/* Cover Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-l-2 border-primary pl-3">1. Cover Configuration</h3>
                                    <div className="grid grid-cols-1 gap-4 p-5 rounded-md border border-slate-200 bg-white shadow-sm">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Cover Paper</Label>
                                            <Select defaultValue="300">
                                                <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm">
                                                    <SelectValue placeholder="Select Paper" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="300">300 GSM Art Card (Gloss)</SelectItem>
                                                    <SelectItem value="250">250 GSM Art Card</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Ups</Label>
                                                <Input type="number" defaultValue={2} className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Wastage</Label>
                                                <Input type="number" defaultValue={10} className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Print Machine (Cover)</Label>
                                            <Select defaultValue="konica">
                                                <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm">
                                                    <SelectValue placeholder="Select Machine" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="konica">Konica Minolta AccurioPress C7100</SelectItem>
                                                    <SelectItem value="offset">Offset 4 Color Machine</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Lamination</Label>
                                                <Select defaultValue="none">
                                                    <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm">
                                                        <SelectValue placeholder="Select Lamination" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="gloss">Gloss Lamination</SelectItem>
                                                        <SelectItem value="matte">Matte Lamination</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Special Finishes</Label>
                                                <Select defaultValue="none">
                                                    <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm">
                                                        <SelectValue placeholder="Select Finishes" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="uv">Spot UV (Logo)</SelectItem>
                                                        <SelectItem value="foil">Gold Foiling</SelectItem>
                                                        <SelectItem value="emboss">Embossing</SelectItem>
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
                                            <Select defaultValue="100">
                                                <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm">
                                                    <SelectValue placeholder="Select Paper" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="100">100 GSM Maplitho Paper</SelectItem>
                                                    <SelectItem value="130">130 GSM Art Paper (Matte)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Ups per Sheet</Label>
                                                <Input type="number" defaultValue="4" className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Wastage (Sheets)</Label>
                                                <Input type="number" defaultValue="50" className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-600">Print Machine (Inner)</Label>
                                            <Select defaultValue="konica">
                                                <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm">
                                                    <SelectValue placeholder="Select Machine" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="konica">Konica Minolta AccurioPress C7100</SelectItem>
                                                    <SelectItem value="offset">Offset 4 Color Machine</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Color Mode</Label>
                                                <Select defaultValue="bw">
                                                    <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="bw">Black & White</SelectItem>
                                                        <SelectItem value="color">Full Color (CMYK)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-600">Binding Style</Label>
                                                <Select defaultValue="perfect">
                                                    <SelectTrigger className="h-9 bg-white border-slate-200 rounded-md font-medium text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="perfect">Perfect Binding</SelectItem>
                                                        <SelectItem value="staple">Center Pin / Staple</SelectItem>
                                                        <SelectItem value="spiral">Spiral / Wire-O</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                                <span className="font-bold text-slate-800">₹4,250</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Inners:</span>
                                                <span className="font-bold text-slate-800">₹18,600</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Binding:</span>
                                                <span className="font-bold text-slate-800">₹2,800</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 text-center">
                                        <div className="space-y-1 mb-6">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Total Book Cost</p>
                                            <p className="text-4xl font-bold tracking-tight text-slate-900 leading-none">₹25,650</p>
                                        </div>
                                        <Button className="w-full h-10 bg-primary hover:opacity-90 text-white font-semibold text-xs rounded-md shadow-sm">
                                            Generate Proposal
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Wide Format Content */}
                    <TabsContent value="wide" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-10 duration-600">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            <div className="md:col-span-8 space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-l-2 border-primary pl-3">Job Details (Wide Format)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-md border border-slate-200 shadow-sm">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-bold text-slate-500 uppercase">Width (In)</Label>
                                                <Input placeholder="36" className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-bold text-slate-500 uppercase">Height (In)</Label>
                                                <Input placeholder="24" className="h-9 border-slate-200 font-bold rounded-md" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase">Quantity</Label>
                                            <Input defaultValue="1" className="h-9 border-slate-200 font-bold rounded-md" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase">Media Type</Label>
                                            <Select defaultValue="flex">
                                                <SelectTrigger className="h-9 border-slate-200 font-medium rounded-md text-sm">
                                                    <SelectValue placeholder="Select Media" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="flex">Frontlit Flex (Standard)</SelectItem>
                                                    <SelectItem value="vinyl">Star Vinyl (Gloss/Matte)</SelectItem>
                                                    <SelectItem value="backlit">Backlit Media</SelectItem>
                                                    <SelectItem value="canvas">Art Canvas</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase">Machine</Label>
                                            <Select defaultValue="eco">
                                                <SelectTrigger className="h-9 border-slate-200 font-medium rounded-md text-sm">
                                                    <SelectValue placeholder="Select Machine" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="eco">Eco-Solvent (High Res)</SelectItem>
                                                    <SelectItem value="solvent">Solvent Printing</SelectItem>
                                                    <SelectItem value="uv">UV Wide Format</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col h-full bg-slate-50/50 rounded-md p-5 border border-slate-100">
                                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-200 pb-2">Real-time Calculation</p>
                                        <div className="space-y-3 flex-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Total Area:</span>
                                                <span className="font-bold text-slate-800">6.00 Sq. Ft</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Media Cost:</span>
                                                <span className="font-bold text-slate-800">₹120.00</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Print Cost:</span>
                                                <span className="font-bold text-slate-800">₹300.00</span>
                                            </div>
                                            <Separator className="bg-slate-200" />
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-xs font-bold uppercase text-primary">Subtotal:</span>
                                                <span className="text-lg font-bold text-slate-900">₹420.00</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 space-y-4">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center mb-1">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Margin %</Label>
                                                    <span className="text-[10px] font-bold text-primary">30%</span>
                                                </div>
                                                <Input type="range" defaultValue="30" className="h-1.5 accent-primary" />
                                            </div>
                                            <Button className="w-full h-8 bg-slate-900 hover:bg-black font-bold uppercase tracking-widest text-[10px] rounded-md shadow-sm">
                                                Calculate Final Price
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Wide Summary (Compact) */}
                            <div className="md:col-span-4 sticky top-0">
                                <div className="p-6 rounded-md bg-white border border-slate-200 text-center space-y-6 shadow-sm">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Wide Format Rate</p>
                                        <p className="text-5xl font-bold tracking-tight text-slate-900">₹546</p>
                                    </div>
                                    <Button className="bg-primary text-white hover:opacity-90 font-semibold h-10 w-full rounded-md shadow-sm text-xs">
                                        Add to Quote
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
