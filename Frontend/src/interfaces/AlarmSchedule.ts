export default interface AlarmSchedule {
    id: number
    time: string
    led_color: string
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