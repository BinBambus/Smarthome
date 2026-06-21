import type AlarmSchedule from "@/interfaces/AlarmSchedule"

export default async function updateAlarmSchedule(alarmSchedule: AlarmSchedule): Promise<AlarmSchedule> {
    const response = await fetch("/api/alarm/schedule", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(alarmSchedule),
    })

    if (!response.ok) {
        throw new Error(`Failed to update alarm schedule: ${response.statusText}`)
    }

    return response.json()
}