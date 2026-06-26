import type AlarmInstance from "@/interfaces/AlarmInstance"

export default async function updateAlarmInstance(alarmInstance: AlarmInstance): Promise<AlarmInstance> {
    const response = await fetch("/api/alarm/instance", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(alarmInstance),
    })

    if (!response.ok) {
        throw new Error(`Failed to update alarm instance: ${response.statusText}`)
    }

    return response.json()
}