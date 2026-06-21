import type AlarmInstance from "@/interfaces/AlarmInstance"

export default async function createAlarmInstance(alarmInstance: AlarmInstance): Promise<AlarmInstance> {
    const response = await fetch("/api/alarm/instance", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(alarmInstance),
    })

    if (!response.ok) {
        throw new Error(`Failed to create alarm instance: ${response.statusText}`)
    }

    return response.json()
}