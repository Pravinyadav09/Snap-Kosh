/**
 * Central API Configuration
 * All backend API calls should use this base URL.
 * Change the URL in .env.local (dev) or .env.production (production) only.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005"

/**
 * Generic API helper — auto-prepends the base URL
 * Usage: apiFetch("/api/customers") → fetches from API_BASE + "/api/customers"
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
    const url = `${API_BASE}${path}`
    return fetch(url, options)
}

// ─── Pre-built endpoint URLs ──────────────────────────────────────────────────
export const API = {
    // Dashboard
    dashboard: {
        summary: `${API_BASE}/api/Dashboard/admin-summary`,
    },

    // Customers
    customers: {
        list: `${API_BASE}/api/customers`,
        lookup: `${API_BASE}/api/Customers/lookup`,
        byId: (id: number | string) => `${API_BASE}/api/customers/${id}`,
    },

    // Jobs & Portal Quotations
    jobs: {
        list: `${API_BASE}/api/jobcards`,
        byId: (id: number | string) => `${API_BASE}/api/jobcards/${id}`,
        status: (id: number | string) => `${API_BASE}/api/jobcards/${id}/status`,
        nextId: `${API_BASE}/api/jobcards/next-id`,
        myJobs: (id: number | string) => `${API_BASE}/api/portal/jobs/${id}`,
        myQuotations: (id: number | string) => `${API_BASE}/api/portal/quotations/${id}`,
    },

    // Invoices
    invoices: {
        list: `${API_BASE}/api/invoices`,
        create: `${API_BASE}/api/invoices`,
    },

    // Payments
    payments: {
        create: `${API_BASE}/api/payments`,
    },

    // Quotations
    quotations: {
        list: `${API_BASE}/api/Quotations`,
        create: `${API_BASE}/api/Quotations`,
    },

    // Inventory
    inventory: {
        list: `${API_BASE}/api/inventory`,
        lookup: `${API_BASE}/api/Inventory/lookup`,
        history: `${API_BASE}/api/inventory/history`,
        alerts: `${API_BASE}/api/inventory/alerts`,
        paper: `${API_BASE}/api/SpecializedInventory/paper`,
        paperStocks: `${API_BASE}/api/inventory/paper-stocks`,
        media: `${API_BASE}/api/SpecializedInventory/media`,
    },

    // Machines
    machines: {
        list: `${API_BASE}/api/machines`,
    },

    // Management
    management: {
        users: `${API_BASE}/api/users`,
        userById: (id: number | string) => `${API_BASE}/api/users/${id}`,
        roles: `${API_BASE}/api/roles`,
        roleById: (id: number | string) => `${API_BASE}/api/roles/${id}`,
        processes: `${API_BASE}/api/processes`,
        processById: (id: number | string) => `${API_BASE}/api/processes/${id}`,
        settings: `${API_BASE}/api/settings`,
    },

    // Outsource
    outsource: {
        vendors: `${API_BASE}/api/Outsource/vendors`,
        vendorLookup: `${API_BASE}/api/Outsource/vendors/lookup`,
        vendorById: (id: number | string) => `${API_BASE}/api/Outsource/vendors/${id}`,
        jobs: `${API_BASE}/api/Outsource/jobs`,
    },

    // Purchases
    purchases: {
        list: `${API_BASE}/api/Purchases`,
        create: `${API_BASE}/api/Purchases`,
    },

    // Finance / Expenses
    expenses: {
        list: `${API_BASE}/api/expenses`,
        categories: `${API_BASE}/api/expense-categories`,
        categoryLookup: `${API_BASE}/api/expense-categories/lookup`,
    },
    // Finance / Job Finance
    finance: {
        jobs: `${API_BASE}/api/Finance/jobs`,
        jobHistory: (id: number | string) => `${API_BASE}/api/Finance/jobs/${id}/history`,
    },

    // Scheduler
    scheduler: {
        jobs: `${API_BASE}/api/jobcards?page=1&size=1000`,
    },

    // Dropdowns
    dropdowns: {
        list: `${API_BASE}/api/dropdowns`,
        byCategory: (cat: string) => `${API_BASE}/api/dropdowns/${cat}`,
    },

    // Tasks
    googleTasks: {
        list: `${API_BASE}/api/GoogleTasks`,
        byId: (id: number | string) => `${API_BASE}/api/GoogleTasks/${id}`,
        create: `${API_BASE}/api/GoogleTasks`,
        update: (id: number | string) => `${API_BASE}/api/GoogleTasks/${id}`,
        delete: (id: number | string) => `${API_BASE}/api/GoogleTasks/${id}`,
        toggle: (id: number | string) => `${API_BASE}/api/GoogleTasks/${id}/toggle`,
    },
} as const
