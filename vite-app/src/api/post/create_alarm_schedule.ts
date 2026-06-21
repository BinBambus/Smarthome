import type AlarmSchedule from "@/interfaces/AlarmSchedule"

export default async function createAlarmSchedule(alarmSchedule: AlarmSchedule): Promise<AlarmSchedule> {
    const response = await fetch("/api/alarm/schedule", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(alarmSchedule),
    })

    if (!response.ok) {
        throw new Error(`Failed to create alarm schedule: ${response.statusText}`)
    }

    return response.json()
}