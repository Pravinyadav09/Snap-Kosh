"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Option {
  value: string
  label: string
  flag?: string
}

interface SearchableSelectProps {
  options: Option[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  className,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      (option.label || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

  const selectedOption = React.useMemo(() => {
    return options.find((option) => option.value === value)
  }, [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 bg-white font-medium border-slate-200 hover:bg-slate-50/50 transition-all text-left",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none bg-slate-50 border-slate-100",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate font-sans">
            {selectedOption?.flag && (
              selectedOption.flag.startsWith('http') ? (
                <img src={selectedOption.flag} alt="flag" className="h-4 w-6 object-cover rounded-sm shadow-sm shrink-0 border border-slate-100" />
              ) : (
                <span className="text-base shrink-0">{selectedOption.flag}</span>
              )
            )}
            <span className="truncate normal-case">
              {selectedOption ? selectedOption.label : (value || placeholder)}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {value && (
              <div
                role="button"
                className="h-5 w-5 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors group/clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onValueChange("");
                }}
              >
                <X className="h-3 w-3 text-slate-300 group-hover/clear:text-rose-500" />
              </div>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width] border-slate-200 shadow-xl rounded-lg overflow-hidden bg-white/95 backdrop-blur-md" align="start">
        <div className="flex flex-col font-sans max-h-[300px]">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 shrink-0">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border-none bg-transparent focus-visible:ring-0 text-sm font-medium p-0"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400 hover:text-slate-600"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div 
            className="overflow-y-auto py-1.5 px-0.5 custom-scrollbar-enhanced min-h-0 flex-1 touch-auto"
            onWheel={(e) => e.stopPropagation()}
          >
              {filteredOptions.length === 0 && searchQuery && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 text-sm font-bold text-indigo-600"
                  onClick={() => {
                    onValueChange(searchQuery)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <Plus className="h-4 w-4" /> Use "{searchQuery}"
                </div>
              )}
              {filteredOptions.length === 0 && !searchQuery ? (
                <div className="py-6 text-center text-sm text-slate-500 font-medium italic">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={`${option.value}-${index}`}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium group",
                      value === option.value
                        ? "bg-primary text-white shadow-sm"
                        : "hover:bg-slate-50 text-slate-700 font-bold"
                    )}
                    onClick={() => {
                      onValueChange(option.value)
                      setOpen(false)
                      setSearchQuery("")
                    }}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="truncate">{option.label}</span>
                    </div>
                    {value === option.value && (
                      <Check className="h-4 w-4 shrink-0 text-white" />
                    )}
                  </div>
                ))
              )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
