"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    Calculator,
    Plus,
    Trash2,
    Save,
    Printer,
    FileText,
    User,
    Calendar,
    Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CostEstimator } from "@/components/shared/cost-estimator"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { SearchableSelect } from "@/components/shared/searchable-select"

type QuoteItem = {
    id: string
    description: string
    qty: number
    rate: number
    amount: number
}

export default function CreateQuotationPage() {
    const router = useRouter()
    const [items, setItems] = useState<QuoteItem[]>([
        { id: "1", description: "Standard Business Cards - 300 GSM Art Card, Front & Back Printing, Matte Lamination", qty: 1000, rate: 2.5, amount: 2500 }
    ])

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: "", qty: 1, rate: 0, amount: 0 }])
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const subtotal = items.reduce((acc, item) => acc + item.amount, 0)
    const taxRate = 0.18
    const taxAmount = subtotal * taxRate
    const grandTotal = subtotal + taxAmount

    return (
        <div className="space-y-3 pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 font-sans">
                <div className="flex items-center gap-2.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border bg-background shadow-sm rounded-full shrink-0"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none uppercase italic">Create Quotation</h1>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none mt-1">Digital Proposal Console</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border border-slate-200 flex-1 sm:flex-none" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button
                        className="h-9 font-black px-5 text-[10px] uppercase tracking-widest shadow-md gap-2 text-white transition-all active:scale-95 flex-1 sm:flex-none"
                        style={{ background: 'var(--primary)' }}
                        onClick={() => {
                            toast.success("Quotation Saved", { description: "Quotation QT-2026-0063 has been saved successfully." })
                            router.push("/estimator")
                        }}
                    >
                        <Save className="h-3.5 w-3.5" /> <span className="sm:inline">Save Draft</span>
                    </Button>
                </div>
            </div>

            {/* Main Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-12">
                    <Card className="shadow-lg border-none ring-1 ring-slate-200 ring-inset">
                        <CardHeader className="bg-slate-50 border-b py-3 px-5">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Quotation No.</Label>
                                    <Input className="h-8 text-xs font-bold bg-white" defaultValue="QT-2026-0063" readOnly />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Customer <span className="text-rose-500">*</span></Label>
                                    <SearchableSelect
                                        options={[
                                            { value: "c1", label: "Bailey-Champlin" },
                                            { value: "c2", label: "Crona Group" },
                                            { value: "c3", label: "Denesik-Keeling" },
                                        ]}
                                        placeholder="Select Customer"
                                        onValueChange={(val: string) => console.log(val)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Date</Label>
                                    <Input type="date" className="h-8 text-xs bg-white py-1" defaultValue="2026-02-26" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Valid Until</Label>
                                    <Input type="date" className="h-8 text-xs bg-white py-1" defaultValue="2026-03-13" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-4 bg-slate-50/50">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items & Estimation</h3>
                                    <Button size="sm" variant="outline" className="h-7 gap-1.5 font-bold px-3 bg-white border text-[10px]" onClick={addItem}>
                                        <Plus className="h-3 w-3 text-primary" /> Add Item
                                    </Button>
                                </div>

                                <div className="rounded-lg border bg-white overflow-hidden shadow-sm overflow-x-auto no-scrollbar">
                                    <Table className="min-w-[800px]">
                                        <TableHeader>
                                            <TableRow className="bg-white hover:bg-white border-b border-slate-100 italic">
                                                <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[9px] py-2 px-5 h-10">Description</TableHead>
                                                <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[9px] text-center w-[100px] h-10">Qty</TableHead>
                                                <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[9px] text-center w-[120px] h-10">Rate (₹)</TableHead>
                                                <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[9px] text-center w-[140px] h-10">Amount (₹)</TableHead>
                                                <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[9px] text-right px-5 w-[70px] h-10">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={item.id} className="group border-b last:border-0 hover:bg-slate-50/50">
                                                    <TableCell className="p-2 px-5">
                                                        <div className="relative group/field">
                                                            <Textarea
                                                                placeholder="Item Details, Specs, Sizes..."
                                                                className="min-h-[40px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-[13px] font-medium pr-8"
                                                                value={item.description}
                                                                onChange={(e) => {
                                                                    const newItems = [...items]
                                                                    newItems[index].description = e.target.value
                                                                    setItems(newItems)
                                                                }}
                                                            />
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute top-0 right-0 h-6 w-6 text-primary hover:bg-primary/10 opacity-0 group-hover/field:opacity-100 transition-opacity"
                                                                    >
                                                                        <Calculator className="h-3 w-3" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[1200px] md:w-[1200px] p-0 overflow-hidden rounded-lg border border-slate-200 shadow-2xl bg-white">
                                                                    <DialogHeader className="px-5 py-3 text-left border-b border-slate-100 bg-white font-sans italic">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="p-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                                                                                <Calculator className="h-3.5 w-3.5" />
                                                                            </div>
                                                                            <DialogTitle className="text-xs font-bold tracking-tight text-slate-800 uppercase">Production Cost Estimator</DialogTitle>
                                                                        </div>
                                                                    </DialogHeader>
                                                                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                                                        <CostEstimator />
                                                                    </div>
                                                                    <DialogFooter className="p-3 flex flex-row items-center justify-end gap-2 px-5 border-t border-slate-100 bg-slate-50/50">
                                                                        <DialogTrigger asChild>
                                                                            <Button variant="outline" className="h-7 px-3 rounded-md text-[10px] font-medium text-slate-500 border-slate-200 bg-white">
                                                                                Close
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogTrigger asChild>
                                                                            <Button className="h-7 px-4 rounded-md bg-primary hover:opacity-90 font-semibold text-[10px] text-white shadow-sm transition-all text-primary-foreground">
                                                                                Apply Estimates
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center p-2">
                                                        <Input
                                                            type="number"
                                                            className="h-8 text-center text-xs font-bold border-none shadow-none focus-visible:ring-1 bg-transparent px-1"
                                                            value={item.qty}
                                                            onChange={(e) => {
                                                                const newItems = [...items]
                                                                newItems[index].qty = Number(e.target.value)
                                                                newItems[index].amount = newItems[index].qty * newItems[index].rate
                                                                setItems(newItems)
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center p-2">
                                                        <Input
                                                            type="number"
                                                            className="h-8 text-center text-xs font-medium border-none shadow-none focus-visible:ring-1 bg-transparent px-1"
                                                            value={item.rate}
                                                            onChange={(e) => {
                                                                const newItems = [...items]
                                                                newItems[index].rate = Number(e.target.value)
                                                                newItems[index].amount = newItems[index].qty * newItems[index].rate
                                                                setItems(newItems)
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center p-2 font-black text-slate-800 text-xs">
                                                        ₹{item.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right p-2 px-5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-12 border-t">
                            <div className="md:col-span-8 p-4 bg-slate-50/30">
                                <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Quotations Terms & Notes</Label>
                                <Textarea
                                    placeholder="Enter payment terms, delivery time, etc..."
                                    className="min-h-[80px] bg-white border-slate-200 text-xs rounded-lg resize-none p-3 font-medium"
                                />
                            </div>
                            <div className="md:col-span-4 p-5 space-y-3 border-l bg-slate-50/10">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-slate-500 uppercase tracking-wider">Subtotal:</span>
                                    <span className="font-bold text-slate-800 text-xs">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-slate-500 uppercase tracking-wider">Tax Type:</span>
                                        <SearchableSelect
                                            options={[
                                                { value: "gst-18", label: "GST 18%" },
                                                { value: "gst-12", label: "GST 12%" },
                                                { value: "no-tax", label: "No Tax" }
                                            ]}
                                            value="gst-18"
                                            onValueChange={(val: any) => console.log(val)}
                                            placeholder="Tax Type"
                                            className="h-7 w-28 text-[9px] font-bold py-0 bg-white"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-slate-500 uppercase tracking-wider">Tax Amount:</span>
                                        <span className="font-bold text-slate-800 text-xs">₹{taxAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                                <Separator className="bg-slate-200" />
                                <div className="flex justify-between items-center pt-1">
                                    <span className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Grand Total:</span>
                                    <span className="font-black text-xl text-primary tabular-nums">₹{grandTotal.toLocaleString()}</span>
                                </div>
                                <Button className="w-full h-10 bg-primary hover:opacity-90 text-primary-foreground font-bold uppercase tracking-widest text-[10px] gap-2 rounded-lg shadow-sm transition-all active:scale-95">
                                    <Printer className="h-3.5 w-3.5" /> Print Quotation
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
