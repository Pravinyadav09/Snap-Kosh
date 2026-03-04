import React from "react"
import { CustomerDetailsClient } from "./customer-details-client"

// ─── Static Params ──────────────────────────────────────────────────────────
export function generateStaticParams() {
    return [
        { id: "CUST-001" },
        { id: "CUST-002" },
        { id: "CUST-003" },
    ]
}

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <CustomerDetailsClient customerId={id} />
}
