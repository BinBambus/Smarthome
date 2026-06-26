import type LedStatus from "@/interfaces/LedStatus"

export default async function get_led_status(): Promise<LedStatus[]> {
    const response = await fetch("/api/led/status", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to retrieve led status: ${response.statusText}`)
    }

    return response.json()
}