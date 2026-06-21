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

export function Alarms() {
    const [isLoading, setLoading] = useState<boolean>(true) // Startfarbe Rot
    const [isUpdatingAlarmInstance, setUpdatingAlarmInstance] = useState<boolean>(false)
    const [isUpdatingAlarmSchedule, setUpdatingAlarmSchedule] = useState<boolean>(false)
    const [alarmInstances, setAlarmInstances] = useState<AlarmInstance[]>([])
    const [alarmSchedules, setAlarmSchedules] = useState<AlarmSchedule[]>([])

    useEffect(() => {
        async function retrieveAlarms() {
            try {
                const dataInstances = await get_alarm_instances()
                setAlarmInstances(dataInstances)
                console.log("Instances geladen:", dataInstances) 

                const dataSchedules = await get_alarm_schedules()
                setAlarmSchedules(dataSchedules)
                console.log("Schedules geladen:", dataSchedules)
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
        retrieveAlarms()
    }, [])

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
                
                {/* Überschrift mit einer feinen Trennlinie */}
                <div className="border-b pb-4 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">Alarms</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                    Customize the appearance of your Smarthome app.
                    </p>
                </div>

                {/* Einstellungs-Box (flex & justify-between schiebt Text nach links, Select nach rechts) */}
                <AddAlarmDialog />

                {/* SKELETON-LOADER */}
                {isLoading && (
                    <>
                        <Skeleton className="h-16 w-full p-4 rounded-xl border shadow-sm" />
                        <Skeleton className="h-16 w-full p-4 rounded-xl border shadow-sm" />
                    </>
                )}

                {!isLoading && (
                    <>
                        <p>Weekly Schedules</p>
                        {alarmSchedules.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic pl-1">No weekly schedules found.</p>
                        ) : (
                            alarmSchedules.map((schedule: any) => (
                                <Card className="mt-2" key={schedule.id || schedule.time}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <Label className="text-base font-semibold leading-none">
                                                {formatTime(schedule.time)}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {formatScheduleDays(schedule)}
                                            </p>
                                        </div>
                                        <Switch
                                            id={`schedule-${schedule.id}`}
                                            checked={schedule.is_active}
                                            onCheckedChange={() => handleToggleSchedule(schedule.id, schedule.is_active)}
                                        />
                                    </CardHeader>
                                </Card>
                            ))
                        )}


                        <p>Alarms</p>
                        {alarmInstances.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic pl-1">No single alarms set.</p>
                        ) : (
                            alarmInstances.map((instance: any) => (
                                <Card className="mt-2" key={instance.id || instance.time}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <Label className="text-base font-semibold leading-none">
                                                {formatTime(instance.time)}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {formatInstanceDate(instance.date)}
                                            </p>
                                        </div>
                                        <Switch
                                            id={`instance-${instance.id}`}
                                            checked={instance.is_active}
                                            onCheckedChange={() => handleToggleInstance(instance.id, instance.is_active)}
                                        />
                                    </CardHeader>
                                </Card>
                            ))
                        )}
                    </>
                )}
                

            </div>
        </>
    )
}

export default Alarms