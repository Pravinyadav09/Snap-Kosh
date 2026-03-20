"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"

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
}

interface SearchableSelectProps {
  options: Option[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
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
            "w-full justify-between h-10 bg-white font-medium border-slate-200 hover:bg-slate-50/50 transition-all",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width] border-slate-200 shadow-xl rounded-lg overflow-hidden" align="start">
        <div className="flex flex-col h-[300px]">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
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
          <ScrollArea className="flex-1">
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500 font-medium italic">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium group",
                      value === option.value
                        ? "bg-primary text-white"
                        : "hover:bg-slate-100 text-slate-700"
                    )}
                    onClick={() => {
                      onValueChange(option.value)
                      setOpen(false)
                      setSearchQuery("")
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
