import type AlarmInstance from "@/interfaces/AlarmInstance"

export default async function deleteAlarmInstance(alarmInstance: AlarmInstance): Promise<void> {
    const response = await fetch("/api/alarm/instance", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(alarmInstance),
    })

    if (!response.ok) {
        throw new Error(`Failed to delete alarm instance: ${response.statusText}`)
    }
}