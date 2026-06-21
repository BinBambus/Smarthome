export default interface AlarmInstance {
    id: number
    time: string // "HH:MM" im 24h-Format, z.B. "07:30"
    led_color: string
    duration_minutes: number
    is_active: boolean
    date: string
}