"use client"

import * as React from "react"
import { 
    Plus, 
    Calendar as CalendarIcon, 
    CheckCircle2, 
    Circle, 
    Trash2, 
    Search,
    CalendarDays,
    Star,
    Inbox,
    RefreshCcw,
    AlertCircle,
    MoreVertical,
    Clock,
    Flag,
    ClipboardList,
    X,
    Check,
    ChevronDown
} from "lucide-react"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import { cn } from "@/lib/utils"
import { API, apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GoogleTask {
    id: number
    title: string
    description?: string
    dueDate?: string
    isCompleted: boolean
    googleEventId?: string
    priority?: string
    category?: string
    createdAt: string
}

const CATEGORIES = [
    { label: "My Tasks", icon: Inbox, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Starred", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Planned", icon: CalendarDays, color: "text-green-500", bg: "bg-green-50" },
    { label: "Urgent", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
]

export default function GoogleTasksPage() {
    const [tasks, setTasks] = React.useState<GoogleTask[]>([])
    const [loading, setLoading] = React.useState(true)
    const [activeCategory, setActiveCategory] = React.useState("My Tasks")
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Dialog states
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [isSyncing, setIsSyncing] = React.useState(false)
    
    // New Task state
    const [newTask, setNewTask] = React.useState({
        title: "",
        description: "",
        dueDate: undefined as Date | undefined,
        priority: "Medium",
        category: "My Tasks"
    })

    const fetchTasks = React.useCallback(async () => {
        try {
            const res = await fetch(API.googleTasks.list)
            if (res.ok) {
                const data = await res.json()
                setTasks(data)
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error)
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const handleAddTask = async () => {
        if (!newTask.title) {
            toast.error("Please enter a task title")
            return
        }

        try {
            const res = await fetch(API.googleTasks.create, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newTask,
                    dueDate: newTask.dueDate?.toISOString(),
                    isCompleted: false,
                    category: activeCategory
                })
            })

            if (res.ok) {
                toast.success("Task added successfully")
                setIsAddOpen(false)
                setNewTask({ title: "", description: "", dueDate: undefined, priority: "Medium", category: "My Tasks" })
                fetchTasks()
            }
        } catch (error) {
            toast.error("Failed to add task")
        }
    }

    const toggleTask = async (task: GoogleTask) => {
        try {
            const res = await fetch(API.googleTasks.toggle(task.id), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(!task.isCompleted)
            })

            if (res.ok) {
                setTasks(prev => prev.map(t => 
                    t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
                ))
                toast.success(task.isCompleted ? "Task moved to active" : "Task marked as complete")
            }
        } catch (error) {
            toast.error("Update failed")
        }
    }

    const deleteTask = async (id: number) => {
        try {
            const res = await fetch(API.googleTasks.delete(id), { method: "DELETE" })
            if (res.ok) {
                setTasks(prev => prev.filter(t => t.id !== id))
                toast.success("Task deleted")
            }
        } catch (error) {
            toast.error("Delete failed")
        }
    }

    const handleSync = () => {
        setIsSyncing(true)
        // Simulate sync logic
        setTimeout(() => {
            setIsSyncing(false)
            toast.success("Synchronized with Google Calendar")
        }, 1500)
    }

    const filteredTasks = tasks.filter(t => {
        const matchesCategory = activeCategory === "My Tasks" || t.category === activeCategory
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const activeTasks = filteredTasks.filter(t => !t.isCompleted)
    const completedTasks = filteredTasks.filter(t => t.isCompleted)

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden font-sans">
            <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <ClipboardList className="size-6 text-primary" />
                        Google Tasks
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Focus on your mission</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-white border-slate-200 shadow-sm gap-2 font-bold text-xs"
                    >
                        <RefreshCcw className={cn("size-3.5 text-blue-500", isSyncing && "animate-spin")} />
                        {isSyncing ? "Syncing..." : "Sync Google"}
                    </Button>
                    <Button size="sm" onClick={() => setIsAddOpen(true)} className="shadow-lg gap-2 font-bold text-xs">
                        <Plus className="size-4" />
                        New Task
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-slate-200 bg-white/50 p-4 space-y-2 hidden md:block">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input 
                            placeholder="Find task..." 
                            className="pl-10 h-10 bg-white border-slate-200 text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <nav className="space-y-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.label}
                                onClick={() => setActiveCategory(cat.label)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group",
                                    activeCategory === cat.label 
                                        ? "bg-white shadow-md border border-slate-200 text-primary" 
                                        : "text-slate-600 hover:bg-slate-100/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", activeCategory === cat.label ? cat.bg : "bg-slate-100 group-hover:bg-white transition-colors")}>
                                        <cat.icon className={cn("size-4", cat.color)} />
                                    </div>
                                    <span className="text-sm font-bold">{cat.label}</span>
                                </div>
                                {tasks.filter(t => (cat.label === "My Tasks" || t.category === cat.label) && !t.isCompleted).length > 0 && (
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                        {tasks.filter(t => (cat.label === "My Tasks" || t.category === cat.label) && !t.isCompleted).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main List */}
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {/* Active Tasks */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{activeCategory}</h2>
                                <span className="text-[11px] font-bold text-slate-400">{activeTasks.length} pending</span>
                            </div>
                            
                            {activeTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl opacity-60">
                                    <div className="p-4 bg-slate-100 rounded-full mb-4">
                                        <Check className="size-8 text-slate-400" />
                                    </div>
                                    <p className="font-bold text-slate-500">Zero tasks pending. Enjoy your day!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {activeTasks.map((task) => (
                                        <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task)} onDelete={() => deleteTask(task.id)} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Completed Section Toggle */}
                        {completedTasks.length > 0 && (
                            <section className="space-y-4 border-t border-slate-200 pt-8">
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Completed ({completedTasks.length})</h2>
                                <div className="space-y-2 opacity-60">
                                    {completedTasks.map((task) => (
                                        <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task)} onDelete={() => deleteTask(task.id)} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>

            {/* Add Task Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent showCloseButton={false} className="max-w-[calc(100%-1rem)] sm:max-w-[500px] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-md bg-white flex flex-col font-sans">
                    {/* Header */}
                    <DialogHeader className="px-5 py-4 text-left border-b border-slate-100 bg-white relative shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md border" style={{ background: 'var(--sidebar-accent)', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                <ClipboardList className="h-4 w-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-bold text-slate-800 leading-none uppercase tracking-tight flex items-center gap-2">
                                    Create New Task
                                </DialogTitle>
                                <DialogDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Direct Synchronization to Google Calendar</DialogDescription>
                            </div>
                        </div>
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors" onClick={() => setIsAddOpen(false)}>
                                <X className="h-4 w-4 text-slate-500" />
                            </Button>
                        </DialogClose>
                    </DialogHeader>

                    {/* Form Fields */}
                    <div className="p-5 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Focus Objective (Title)</label>
                            <Input 
                                placeholder="What needs to be done?" 
                                className="h-9 text-[11px] font-bold border-slate-200 focus:border-primary/30 rounded-md bg-white tabular-nums uppercase"
                                value={newTask.title}
                                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                autoFocus
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Contextual Notes (Optional)</label>
                            <Textarea 
                                placeholder="Add specific task details or links..." 
                                className="min-h-[80px] text-[11px] font-bold resize-none border-slate-200 rounded-md p-3 focus:border-primary/30"
                                value={newTask.description}
                                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Execution Deadline</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-between px-3 font-bold rounded-md h-9 border-slate-200 text-[11px] bg-white",
                                                !newTask.dueDate && "text-slate-400"
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                                                {newTask.dueDate ? format(newTask.dueDate, "dd MMM yyyy") : "SET DEADLINE"}
                                            </span>
                                            <ChevronDown className="h-3 w-3 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={newTask.dueDate}
                                            onSelect={(date) => setNewTask({...newTask, dueDate: date})}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Task Urgency</label>
                                <div className="relative">
                                    <select 
                                        className="w-full h-9 border border-slate-200 rounded-md bg-white px-3 font-bold text-[11px] focus:ring-1 focus:ring-primary/20 outline-none appearance-none uppercase text-slate-700"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0 font-sans">
                        <Button variant="ghost" className="h-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors" onClick={() => setIsAddOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddTask} className="h-8 px-6 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-md hover:bg-slate-800 transition-all shadow-sm">
                            Commit Task
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function TaskCard({ task, onToggle, onDelete }: { task: GoogleTask; onToggle: () => void; onDelete: () => void }) {
    return (
        <div className={cn(
            "group flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 transition-all duration-300 hover:shadow-md hover:border-primary/20",
            task.isCompleted && "bg-slate-50/50"
        )}>
            <button 
                onClick={onToggle}
                className={cn(
                    "size-6 flex items-center justify-center rounded-full border-2 transition-all duration-200 shrink-0",
                    task.isCompleted 
                        ? "bg-primary border-primary" 
                        : "border-slate-300 hover:border-primary/50 group-hover:scale-110"
                )}
            >
                {task.isCompleted && <Check className="size-3.5 text-white stroke-[4]" />}
            </button>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className={cn(
                        "text-[15px] font-bold truncate transition-all duration-300",
                        task.isCompleted ? "text-slate-400 line-through" : "text-slate-900"
                    )}>
                        {task.title}
                    </h3>
                    {!task.isCompleted && task.priority === "High" && (
                        <Flag className="size-3 text-red-500 fill-red-500" />
                    )}
                </div>
                
                <div className="flex items-center gap-3 mt-1.5">
                    {task.dueDate && (
                        <div className={cn(
                            "flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tight",
                            isPast(new Date(task.dueDate)) && !task.isCompleted && !isToday(new Date(task.dueDate))
                                ? "text-red-500" 
                                : "text-slate-400"
                        )}>
                            <Clock className="size-3" />
                            {isToday(new Date(task.dueDate)) ? "Today" : isTomorrow(new Date(task.dueDate)) ? "Tomorrow" : format(new Date(task.dueDate), "MMM d")}
                        </div>
                    )}
                    {task.category && (
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-[0.15em] font-black bg-slate-50 border-slate-200 text-slate-500 px-2 rounded-md">
                            {task.category}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={onDelete}>
                    <Trash2 className="size-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400">
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 font-bold text-xs p-1">
                        <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg hover:bg-primary/5 hover:text-primary">
                            <Star className="size-3.5" /> Star Task
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg hover:bg-primary/5 hover:text-primary">
                            <CalendarDays className="size-3.5" /> Reschedule
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
