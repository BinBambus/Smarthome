import type AlarmInstance from "@/interfaces/AlarmInstance"

export default async function get_alarm_instances(): Promise<AlarmInstance[]> {
    const response = await fetch("/api/alarm/instances", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to retrieve alarms: ${response.statusText}`)
    }

    return response.json()
}