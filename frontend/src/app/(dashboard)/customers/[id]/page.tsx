import React from "react"
import { CustomerDetailsClient } from "./customer-details-client"

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <CustomerDetailsClient customerId={id} />
}
