import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, ChevronDownIcon } from "lucide-react"
import { useState} from "react"
import { ColorDisk } from "./ui/color-disk"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import createAlarmSchedule from "@/api/post/create_alarm_schedule"
import createAlarmInstance from "@/api/post/create_alarm_instance"

export function AddAlarmDialog() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [scheduleMode, setScheduleMode] = useState(false)
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>()
    const [color, setColor] = useState<string>("2AD5D5")
    const [timespan, setTimespan] = useState<number>(10)
    const [submitting, setSubmitting] = useState(false)
    
    // 🌟 1. Zeit-State ohne Sekunden initialisieren
    const [time, setTime] = useState<string>("07:50")

    // 🌟 2. State für die Wochentage als Booleans
    const [days, setDays] = useState({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
    })

    // Hilfsfunktion zum Umschalten der Tage
    const toggleDay = (dayKey: keyof typeof days) => {
        setDays((prev) => ({
            ...prev,
            [dayKey]: !prev[dayKey],
        }))
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        if (submitting) return; // Verhindert Mehrfach-Submits
        
        e.preventDefault();
        setSubmitting(true);
        try {
            if (scheduleMode) {
                const newAlarmSchedule = {
                    id: 0,
                    time,
                    led_color: color,
                    duration_minutes: timespan,
                    is_active: true,
                    ...days,
                }
                await createAlarmSchedule(newAlarmSchedule) // Hier würdest du die API-Funktion aufrufen, um den Zeitplan zu speichern
                const description = "Every " + Object.entries(days)
                    .filter(([_, isActive]) => isActive)
                    .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1, 3)) // "monday" -> "Mo"
                    .join(", ") + " at " + time
                toast("Alarm Schedule has been created", { description })     
            } else {
                const targetDate = date || new Date()
                const formattedDate = format(targetDate, "yyyy-MM-dd")
                const newAlarmInstance = {
                    id: 0,
                    time,
                    led_color: color,
                    duration_minutes: timespan,
                    is_active: true,
                    date: formattedDate,
                }
                await createAlarmInstance(newAlarmInstance) // Hier würdest du die API-Funktion aufrufen, um die Instanz zu speichern
                const description = "" + (date ? format(date, "PPP") : format(new Date(), "PPP")) + " at " + time
                toast("Alarm Instance has been created", { description })
            }
        } catch (error) {
            toast("Error creating alarm", {
                description: "An error occurred while creating the alarm. Please try again.",
            })
        }
        finally {
            setDialogOpen(false)
            setSubmitting(false)
        }
    }

    const isScheduleEmpty = scheduleMode && !Object.values(days).some(isActive => isActive);
  return (
    <>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <form onSubmit={handleSubmit}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-[40px] h-[40px] p-0 rounded-full">
                        <Plus className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add Alarm</DialogTitle>
                    <DialogDescription>
                        Create a new alarm here.
                    </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                    <Field className="flex flex-row gap-2 items-center">
                        <Label htmlFor="schedule-mode">Schedule Mode</Label>
                        <Switch
                            id="schedule-mode"
                            checked={scheduleMode}
                            onCheckedChange={setScheduleMode}
                        />
                    </Field>
                    <Field>
                        <Label htmlFor="color">Color</Label>
                        <ColorDisk value={color} onChange={(color) => setColor(color)} />
                    </Field>
                    <Field>
                        <Label htmlFor="timespan">Timespan (minutes)</Label>
                        <Input
                            id="timespan"
                            name="timespan"
                            type="number"
                            value={timespan}
                            onChange={(e) => setTimespan(parseInt(e.target.value) || 0)}
                        />
                    </Field>

                    {/* 🌟 3. Wochentags-Auswahl (Wenn Schedule Mode aktiv ist) */}
                    {scheduleMode && (
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
                                            type="button" // 🔒 Lebenswichtig, um ungewollte Form-Submits zu verhindern!
                                            variant={isActive ? "default" : "outline"}
                                            className="w-9 h-9 p-0 rounded-full text-xs font-medium transition-all"
                                            onClick={() => toggleDay(day.key as keyof typeof days)}
                                        >
                                            {day.label}
                                        </Button>
                                    )
                                })}
                            </div>
                        </Field>
                    )}

                    {/* Zeit- und Datumselemente */}
                    <FieldGroup className="flex flex-row gap-4 w-full">
                        {/* Datum wird NUR angezeigt, wenn wir NICHT im Schedule-Mode sind */}
                        {!scheduleMode && (
                            <Field className="flex-1">
                                <FieldLabel htmlFor="date-picker-optional">Date</FieldLabel>
                                <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date-picker-optional"
                                        className="w-full justify-between font-normal"
                                        >
                                        {date ? format(date, "PPP") : "Select date"}
                                    <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        captionLayout="dropdown"
                                        defaultMonth={date}
                                        onSelect={(date) => {
                                            setDate(date)
                                            setOpen(false)
                                        }}
                                    />
                                </PopoverContent>
                                </Popover>
                            </Field>
                        )}
                        
                        {/* 🌟 4. Der korrigierte Zeit-Picker ohne Sekunden */}
                        <Field className={scheduleMode ? "w-full" : "w-32"}>
                            <FieldLabel htmlFor="time-picker-optional">Time</FieldLabel>
                            <Input
                                type="time"
                                id="time-picker-optional"
                                step="60" // 🌟 Erzwingt Minuten-Schritte (keine Sekunden)
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            />
                        </Field>
                    </FieldGroup>
                </FieldGroup>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                        {scheduleMode ? (
                            <Button type="submit" onClick={handleSubmit} disabled={isScheduleEmpty}>
                                Create schedule
                            </Button>
                        ):(
                            <Button type="submit" onClick={handleSubmit}>
                                Create alarm
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    </>
  )
}