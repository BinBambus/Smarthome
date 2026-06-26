import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { ColorDisk } from "./ui/color-disk"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import updateAlarmSchedule from "@/api/put/update_alarm_schedule"
import updateAlarmInstance from "@/api/put/update_alarm_instance"
import type AlarmInstance from "@/interfaces/AlarmInstance"
import type AlarmSchedule from "@/interfaces/AlarmSchedule"


interface EditAlarmDialogProps {
    alarm: any
    type: "instance" | "schedule"
    onRefresh: () => void
    children: React.ReactNode
}

export function EditAlarmDialog({ alarm, type, onRefresh, children }: EditAlarmDialogProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [color, setColor] = useState<string>(alarm.led_color)
    const [timespan, setTimespan] = useState<number>(alarm.duration_minutes)
    const [time, setTime] = useState<string>(alarm.time.slice(0, 5)) 
    
    const [date, setDate] = useState<Date | undefined>(
        type === "instance" ? new Date(alarm.date) : undefined
    )

    const [days, setDays] = useState({
        monday: type === "schedule" ? !!alarm.monday : false,
        tuesday: type === "schedule" ? !!alarm.tuesday : false,
        wednesday: type === "schedule" ? !!alarm.wednesday : false,
        thursday: type === "schedule" ? !!alarm.thursday : false,
        friday: type === "schedule" ? !!alarm.friday : false,
        saturday: type === "schedule" ? !!alarm.saturday : false,
        sunday: type === "schedule" ? !!alarm.sunday : false,
    })

    const toggleDay = (dayKey: keyof typeof days) => {
        setDays((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        if (submitting) return
        e.preventDefault()
        setSubmitting(true)

        try {
            if (type === "schedule") {
                const updatedSchedule: AlarmSchedule = {
                    ...alarm,
                    time,
                    led_color: color,
                    duration_minutes: timespan,
                    ...days,
                }
                await updateAlarmSchedule(updatedSchedule)
                toast.success("Schedule updated successfully")
            } else {
                const targetDate = date || new Date()
                const updatedInstance: AlarmInstance = {
                    ...alarm,
                    time,
                    led_color: color,
                    duration_minutes: timespan,
                    date: format(targetDate, "yyyy-MM-dd"),
                }
                await updateAlarmInstance(updatedInstance)
                toast.success("Alarm instance updated successfully")
            }
            onRefresh()
            setDialogOpen(false)
        } catch (error) {
            toast.error("Error updating alarm", {
                description: "Please try again later.",
            })
        } finally {
            setSubmitting(false)
        }
    }

    const isScheduleEmpty = type === "schedule" && !Object.values(days).some(isActive => isActive)

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="color">Color</Label>
                            <ColorDisk value={color} onChange={(color) => setColor(color)} />
                        </Field>
                        <Field>
                            <Label htmlFor="timespan">Timespan (minutes)</Label>
                            <Input
                                id="timespan"
                                type="number"
                                value={timespan}
                                onChange={(e) => setTimespan(parseInt(e.target.value) || 0)}
                            />
                        </Field>

                        {type === "schedule" && (
                            <Field className="flex flex-col gap-2">
                                <Label>Repeat Weekly</Label>
                                <div className="flex gap-1 justify-between w-full mt-1">
                                    {[
                                        { key: "monday", label: "Mo" },
                                        { key: "tuesday", label: "Di" },
                                        { key: "wednesday", label: "Mi" },
                                        { key: "thursday", label: "Do" },
                                        { key: "friday", label: "Fr" },
                                        { key: "saturday", label: "Sa" },
                                        { key: "sunday", label: "So" },
                                    ].map((day) => {
                                        const isActive = days[day.key as keyof typeof days]
                                        return (
                                            <Button
                                                key={day.key}
                                                type="button"
                                                variant={isActive ? "default" : "outline"}
                                                className="w-9 h-9 p-0 rounded-full text-xs font-medium"
                                                onClick={() => toggleDay(day.key as keyof typeof days)}
                                            >
                                                {day.label}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </Field>
                        )}

                        <FieldGroup className="flex flex-row gap-4 w-full">
                            {type === "instance" && (
                                <Field className="flex-1">
                                    <FieldLabel htmlFor="date-picker">Date</FieldLabel>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal">
                                                {date ? format(date, "PPP") : "Select date"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={(date) => {
                                                    setDate(date)
                                                    setOpen(false)
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </Field>
                            )}
                            
                            <Field className={type === "schedule" ? "w-full" : "w-32"}>
                                <FieldLabel htmlFor="time-picker-optional">Time</FieldLabel>
                                <Input
                                    type="time"
                                    step="60"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isScheduleEmpty || submitting}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}