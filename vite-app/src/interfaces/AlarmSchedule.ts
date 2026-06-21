export default interface AlarmSchedule {
    id: number
    time: string // "HH:MM" im 24h-Format, z.B. "07:30"
    led_color: string // Hex ohne #, z.B. "FF5733"
    duration_minutes: number
    is_active: boolean
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
}