import type AlarmSchedules from "@/interfaces/AlarmSchedule"

export default async function get_alarm_schedules(): Promise<AlarmSchedules[]> {
    const response = await fetch("/api/alarm/schedules", {
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