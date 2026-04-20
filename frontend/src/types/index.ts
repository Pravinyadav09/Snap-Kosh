export type UserRole = "Admin" | "Designer" | "Operator"

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    status: "Active" | "Inactive" | "Pending"
    avatar?: string
}

export type JobStatus = "Pending" | "Pre-Press" | "Printing" | "Post-Press" | "Done" | "Delivered"

export interface Customer {
    id: string
    name: string
    email: string
    phone: string
    address: string
    outstandingBalance: number
}

export interface InventoryItem {
    id: string
    name: string
    unit: "Sheets" | "Kg" | "SqFt" | "Pcs"
    stockQuantity: number
    lowStockThreshold: number
    costPerUnit: number
}

export interface Machine {
    id: string
    name: string
    type: "Digital" | "Offset" | "Wide Format"
    costType: "Click" | "Hourly"
    rate: number
    lastReading: number
}

export interface Quotation {
    id: string
    customerId: string
    customerName: string
    items: EstimationItem[]
    totalAmount: number
    taxAmount: number
    grandTotal: number
    status: "Draft" | "Sent" | "Confirmed" | "Cancelled"
    createdAt: Date
}

export interface EstimationItem {
    id: string
    description: string
    quantity: number
    ups: number
    wastage: number
    paperId: string
    machineId: string
    postPressCosts: {
        name: string
        cost: number
    }[]
    marginPercentage: number
    baseCost: number
    finalRate: number
}

export interface Job {
    id: string
    quotationId?: string
    customerId: string
    customerName: string
    title: string
    status: JobStatus
    deadline: Date
    specs: string
    image?: string
    stages: {
        name: string
        status: "Pending" | "In Progress" | "Completed"
        completedBy?: string
        completedAt?: Date
    }[]
}

export interface Expense {
    id: string
    category: string
    description: string
    amount: number
    date: Date
    isGstEnabled: boolean
}
