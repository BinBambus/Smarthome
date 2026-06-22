import { AddAlarmDialog } from "@/components/add-alarm-dialog"
import { useEffect, useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import get_alarm_instances from "@/api/get/get_alarm_instances"
import get_alarm_schedules from "@/api/get/get_alarm_schedules"
import { toast } from "sonner"
import type AlarmInstance from "@/interfaces/AlarmInstance"
import type AlarmSchedule from "@/interfaces/AlarmSchedule"
import updateAlarmInstance from "@/api/put/update_alarm_instance"
import updateAlarmSchedule from "@/api/put/update_alarm_schedule"
import deleteAlarmInstance from "@/api/delete/delete_alarm_instance"
import deleteAlarmSchedule from "@/api/delete/delete_alarm_schedule"
import { EditAlarmDialog } from "@/components/edit-alarm-dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function Alarms() {
    const [isLoading, setLoading] = useState<boolean>(true) // Startfarbe Rot
    const [isUpdatingAlarmInstance, setUpdatingAlarmInstance] = useState<boolean>(false)
    const [isUpdatingAlarmSchedule, setUpdatingAlarmSchedule] = useState<boolean>(false)
    const [alarmInstances, setAlarmInstances] = useState<AlarmInstance[]>([])
    const [alarmSchedules, setAlarmSchedules] = useState<AlarmSchedule[]>([])
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<{ id: number, type: "instance" | "schedule" } | null>(null)

    useEffect(() => {
        retrieveAlarms()
    }, [])

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return
        try {
            if (itemToDelete.type === "schedule") {
                const dummySchedule: AlarmSchedule = {
                    id: itemToDelete.id,
                    led_color: "FFFFFF",
                    time: "12:18:13.042Z",
                    monday: true,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false,
                    sunday: false,
                    is_active: false,
                    duration_minutes: 0
                }
                await deleteAlarmSchedule(dummySchedule)
            } else {
                const dummyInstance: AlarmInstance = {
                    id: itemToDelete.id,
                    date: "2026-06-22",
                    time: "12:16:37.538Z",
                    led_color: "FFFFFF",
                    is_active: true,
                    duration_minutes: 1
                }
                await deleteAlarmInstance(dummyInstance)
            }
            toast.success("Alarm successfully deleted")
            retrieveAlarms()
        } catch (error) {
            toast.error("Failed to delete alarm")
        } finally {
            setDeleteDialogOpen(false)
            setItemToDelete(null)
        }
    }
    const triggerDeleteTrigger = (id: number, type: "instance" | "schedule") => {
        setItemToDelete({ id, type })
        setDeleteDialogOpen(true)
    }

    async function retrieveAlarms() {
        try {
            const dataInstances = await get_alarm_instances()
            setAlarmInstances(dataInstances)

            const dataSchedules = await get_alarm_schedules()
            setAlarmSchedules(dataSchedules)
        } catch (error) {
            console.log(error)
            toast("Error occured:",{
                description: "Retry in 5 seconds!"
            })
        } finally {
            await new Promise(f => setTimeout(f, 500));
            setLoading(false)
        }
    }

    const handleToggleSchedule = async (id: number, currentStatus: boolean) => {
        if (isUpdatingAlarmSchedule) return
        setUpdatingAlarmSchedule(true)
        const nextStatus = !currentStatus

        const currentSchedule = alarmSchedules.find(item => item.id === id)
        if (!currentSchedule) return
        const updatedSchedule = { ...currentSchedule, is_active: nextStatus }
        
        // UI sofort aktualisieren (Optimistic Update)
        setAlarmSchedules(prev => 
            prev.map(item => item.id === id ? updatedSchedule : item)
        )

        try {
            await updateAlarmSchedule(updatedSchedule)
            toast.success("Schedule status updated")
        } catch (error) {
            // Fallback: Wenn API fehlschlägt, Zustand wieder zurückrollen
            setAlarmSchedules(prev => 
                prev.map(item => item.id === id ? { ...item, is_active: currentStatus } : item)
            )
            toast.error("Failed to update schedule in database")
        } finally{
            setUpdatingAlarmSchedule(false)
        }
    }

    const handleToggleInstance = async (id: number, currentStatus: boolean) => {
        if (isUpdatingAlarmInstance) return
        setUpdatingAlarmInstance(true)
        const nextStatus = !currentStatus

        const currentInstance = alarmInstances.find(item => item.id === id)
        if (!currentInstance) return
        const updatedInstance = { ...currentInstance, is_active: nextStatus }

        // UI sofort aktualisieren (Optimistic Update)
        setAlarmInstances(prev => 
            prev.map(item => item.id === id ? updatedInstance : item)
        )

        try {
            await updateAlarmInstance(updatedInstance)
            toast.success("Alarm status updated")
        } catch (error) {
            // Fallback bei Fehler
            setAlarmInstances(prev => 
                prev.map(item => item.id === id ? { ...item, is_active: currentStatus } : item)
            )
            toast.error("Failed to update alarm in database")
        } finally{
            setUpdatingAlarmInstance(false)
        }
    }

    const formatTime = (timeString: string) => {
        return timeString ? timeString.slice(0, 5) : "--:--"
    }

    const formatScheduleDays = (schedule: AlarmSchedule) => {
        const dayMap: { [key: string]: string } = {
            monday: "Mo", tuesday: "Tu", wednesday: "We", 
            thursday: "Th", friday: "Fr", saturday: "Sa", sunday: "Su"
        }
        const activeDays = Object.keys(dayMap)
            .filter((day) => (schedule as any)[day] === true)
            .map((day) => dayMap[day])
        
        return activeDays.length > 0 ? activeDays.join(" | ") : "One-time"
    }

    const formatInstanceDate = (dateString: string) => {
        if (!dateString) return ""
        const dateObj = new Date(dateString)
        return dateObj.toLocaleDateString("de-DE", { 
            day: "2-digit", 
            month: "2-digit", 
            year: "numeric",
            weekday: "long" 
        })
    }

    return (
        <>
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-4 mt-6">
                
                <div className="border-b pb-4 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">Alarms</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Customize the appearance of your Smarthome app.
                    </p>
                </div>

                <AddAlarmDialog />

                {isLoading && (
                    <>
                        <Skeleton className="h-16 w-full p-4 rounded-xl border shadow-sm" />
                        <Skeleton className="h-16 w-full p-4 rounded-xl border shadow-sm" />
                    </>
                )}

                {!isLoading && (
                    <>
                        <p className="font-medium text-sm text-muted-foreground mt-2">Weekly Schedules</p>
                        {alarmSchedules.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic pl-1">No weekly schedules found.</p>
                        ) : (
                            alarmSchedules.map((schedule: any) => (
                                <ContextMenu key={schedule.id || schedule.time}>
                                    <ContextMenuTrigger asChild>
                                        <Card className="mt-2" key={schedule.id || schedule.time}>
                                            <CardHeader className="flex flex-row items-center justify-between">
                                                
                                                {/* 🌟 HIER REIN: Text-Bereich ist jetzt der Trigger für den Zeitplan-Edit-Modus */}
                                                <EditAlarmDialog alarm={schedule} type="schedule" onRefresh={retrieveAlarms}>
                                                    <div className="flex-1 cursor-pointer hover:opacity-80 transition-opacity">
                                                        <Label className="text-base font-semibold leading-none cursor-pointer">
                                                            {formatTime(schedule.time)}
                                                        </Label>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {formatScheduleDays(schedule)}
                                                        </p>
                                                    </div>
                                                </EditAlarmDialog>

                                                <Switch
                                                    id={`schedule-${schedule.id}`}
                                                    checked={schedule.is_active}
                                                    onCheckedChange={() => handleToggleSchedule(schedule.id, schedule.is_active)}
                                                />
                                            </CardHeader>
                                        </Card>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent className="w-40">
                                        <ContextMenuItem 
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                            onClick={() => triggerDeleteTrigger(schedule.id, "schedule")}
                                        >
                                            Löschen
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))
                        )}

                        <p className="font-medium text-sm text-muted-foreground mt-6">Alarms</p>
                        {alarmInstances.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic pl-1">No single alarms set.</p>
                        ) : (
                            alarmInstances.map((instance: any) => (
                                <ContextMenu key={instance.id || instance.time}>
                                    <ContextMenuTrigger asChild>
                                        <Card className="mt-2" key={instance.id || instance.time}>
                                            <CardHeader className="flex flex-row items-center justify-between">
                                                
                                                {/* 🌟 HIER REIN: Text-Bereich ist der Trigger für den Instanz-Edit-Modus */}
                                                <EditAlarmDialog alarm={instance} type="instance" onRefresh={retrieveAlarms}>
                                                    <div className="flex-1 cursor-pointer hover:opacity-80 transition-opacity">
                                                        <Label className="text-base font-semibold leading-none cursor-pointer">
                                                            {formatTime(instance.time)}
                                                        </Label>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {formatInstanceDate(instance.date)}
                                                        </p>
                                                    </div>
                                                </EditAlarmDialog>

                                                <Switch
                                                    id={`instance-${instance.id}`}
                                                    checked={instance.is_active}
                                                    onCheckedChange={() => handleToggleInstance(instance.id, instance.is_active)}
                                                />
                                            </CardHeader>
                                        </Card>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent className="w-40">
                                        <ContextMenuItem 
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                            onClick={() => triggerDeleteTrigger(instance.id, "instance")}
                                        >
                                            Löschen
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))
                        )}
                    </>
                )}
            </div>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Alarm löschen?</DialogTitle>
                        <DialogDescription>
                            Möchtest du diesen Wecker wirklich dauerhaft aus deinem Smarthome entfernen?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row gap-2 mt-4 justify-end">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Abbrechen
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Ja, löschen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
export default Alarms