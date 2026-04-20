"use client"

import * as React from "react"
import { addDays, format, subDays } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"

interface DatePickerWithRangeProps {
    className?: string
    date?: DateRange | undefined
    setDate?: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {
    const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(date)
    const [isOpen, setIsOpen] = React.useState(false)
    const isMobile = useIsMobile()

    React.useEffect(() => {
        setInternalDate(date)
    }, [date])

    const handleApply = (range: DateRange | undefined) => {
        setInternalDate(range)
        if (setDate) setDate(range)
    }

    const setQuickSelect = (days: number) => {
        const to = new Date()
        const from = subDays(new Date(), days)
        handleApply({ from, to })
    }

    const setYesterday = () => {
        const yesterday = subDays(new Date(), 1)
        handleApply({ from: yesterday, to: yesterday })
    }

    const setToday = () => {
        const today = new Date()
        handleApply({ from: today, to: today })
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "h-8 justify-start text-left font-normal bg-white border-slate-200 text-slate-500 rounded-lg text-[12px] px-2 sm:px-3 w-full sm:w-auto",
                            !internalDate && "text-slate-400"
                        )}
                    >
                        <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="truncate">
                            {internalDate?.from ? (
                                internalDate.to ? (
                                    <>
                                        {format(internalDate.from, "LLL dd")} - {format(internalDate.to, "LLL dd")}
                                    </>
                                ) : (
                                    format(internalDate.from, "LLL dd")
                                )
                            ) : (
                                <span>Range Picker</span>
                            )}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-1.5rem)] sm:w-auto p-0 rounded-2xl border-slate-200 shadow-xl overflow-hidden" align="center" sm-align="end" sideOffset={8}>
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Date Range</span>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2" onClick={() => { handleApply(undefined); setIsOpen(false) }}>
                                    Clear
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full" onClick={() => setIsOpen(false)}>
                                    <X className="h-3 w-3 text-slate-400" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-2">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={internalDate?.from}
                                selected={internalDate}
                                onSelect={handleApply}
                                numberOfMonths={1}
                                className="p-0 [&_[data-selected-single=true]]:bg-primary [&_[data-selected-single=true]]:text-primary-foreground select-none"
                            />
                        </div>
                        <div className="border-t border-slate-100 p-3 bg-slate-50/50">
                            <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Quick Select</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold bg-white border-slate-200 text-slate-600 rounded-md shadow-sm hover:bg-slate-50 transition-colors" onClick={setYesterday}>Yesterday</Button>
                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold bg-white border-slate-200 text-slate-600 rounded-md shadow-sm hover:bg-slate-50 transition-colors" onClick={setToday}>Today</Button>
                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold bg-white border-slate-200 text-slate-600 rounded-md shadow-sm hover:bg-slate-50 transition-colors" onClick={() => setQuickSelect(7)}>Last 7 Days</Button>
                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold bg-white border-slate-200 text-slate-600 rounded-md shadow-sm hover:bg-slate-50 transition-colors" onClick={() => setQuickSelect(30)}>Last 30 Days</Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
