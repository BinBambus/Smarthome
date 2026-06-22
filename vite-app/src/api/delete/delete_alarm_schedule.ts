import type AlarmSchedule from "@/interfaces/AlarmSchedule"

export default async function deleteAlarmSchedule(alarmSchedule: AlarmSchedule): Promise<void> {
    const response = await fetch("/api/alarm/schedule", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(alarmSchedule),
    })

    if (!response.ok) {
        throw new Error(`Failed to delete alarm schedule: ${response.statusText}`)
    }
}