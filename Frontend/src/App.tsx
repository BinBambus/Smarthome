import { Slider } from "@/components/ui/slider"
import { Sun, Power, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect, useRef } from "react"
import { ColorDisk } from "@/components/ui/color-disk"
import type LedStatus from "./interfaces/LedStatus"
import get_led_status from "./api/get/get_led_status"
import { toast } from "sonner"

export function App() {
    const [ledColor, setLedColor] = useState("FF0000")
    const [brightness, setBrightness] = useState(100)
    const [isOn, setPower] = useState(false)
    const [wsReady, setWsReady] = useState(false)
    const [bluetoothReady, setBluetoothReady] = useState(false)

    const wsRef = useRef<WebSocket | null>(null)
    const isThrottledRef = useRef<boolean>(false)
    const pendingUpdateRef = useRef<{ color?: string; brightness?: number } | null>(null)

    useEffect(() => {
        async function fetchInitialLedStatus() {
            try {
                const led: LedStatus[] = await get_led_status()
                if (led && led.length > 0) {
                    setBrightness(led[0].brightness)
                    setLedColor(led[0].led_color)
                    setPower(led[0].is_on)
                }
            } catch (error) {
                console.error("Error fetching LED-Status:", error)
            }
        }
        fetchInitialLedStatus()
    }, [])

    useEffect(() => {
        let isUnmounted = false
        let reconnectTimeout: ReturnType<typeof setTimeout>

        const isDevelopment = window.location.port === "5173"
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"

        const wsUrl = isDevelopment
            ? `ws://127.0.0.1:5000/api/ws/led`
            : `${wsProtocol}//${window.location.host}/api/ws/led`;

        function connectWebSocket() {
            if (isUnmounted) return

            console.log("Versuche WebSocket zu verbinden...")
            const ws = new WebSocket(wsUrl)

            ws.onopen = () => {
                toast.success("Connected to WebSocket!")
                setWsReady(true)
            }

            ws.onclose = () => {
                setBluetoothReady(false)
                setWsReady(false)

                if (!isUnmounted) {
                    toast.error("WebSocket disconnected. Retrying in 3s...")
                    reconnectTimeout = setTimeout(connectWebSocket, 3000)
                }
            }

            ws.onerror = (err) => {
                console.error("WS Fehler:", err)
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.type === "bluetooth_status") {
                        if (data.connected) {
                            setBluetoothReady(true)
                            toast.success("Connected to Bluetooth!")
                        }
                    }
                } catch (err) {
                    console.error("Error on parsing of WebSocket-Message:", err)
                }
            }

            wsRef.current = ws
        }

        connectWebSocket()

        // Cleanup
        return () => {
            isUnmounted = true
            clearTimeout(reconnectTimeout)
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [])

    const sendUpdate = (data: { color?: string; brightness?: number; is_on?: boolean }) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data))
        }
    }

    const sendThrottledUpdate = (data: { color?: string; brightness?: number }) => {
        // If locked, cache last value
        if (isThrottledRef.current) {
            pendingUpdateRef.current = { ...pendingUpdateRef.current, ...data }
            return
        }

        sendUpdate(data)
        isThrottledRef.current = true

        // Lock for 400mss
        setTimeout(() => {
            isThrottledRef.current = false
            
            // If new values were recieved by gui during lock, send them now!
            if (pendingUpdateRef.current) {
                const nextUpdate = pendingUpdateRef.current
                pendingUpdateRef.current = null  // Clear Cache
                sendThrottledUpdate(nextUpdate)  // Recursive Call for last value
            }
        }, 400)
    }

    const handleColorChange = (newColor: string) => {
        setLedColor(newColor)
        sendThrottledUpdate({ color: newColor })
    }

    const handleBrightnessChange = (value: number[]) => {
        const newBrightness = value[0]
        setBrightness(newBrightness)
        sendThrottledUpdate({ brightness: newBrightness })
    }

    const handlePowerToggle = (checked: boolean) => {
        setPower(checked)
        sendUpdate({ is_on: checked })
    }

    return (
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 mt-6">
            
            <div className="border-b pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">LED Control</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Customize the appearance of your LED lights in real-time.
                    </p>
                </div>
                {/* Connection Updates */}
                {!wsReady && (
                    <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connect WebSocket...
                    </div>
                )}
                {(!bluetoothReady && wsReady) && (
                    <div className="flex items-center gap-2 text-sm text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connect Bluetooth...
                    </div>
                )}
            </div>

           <div className={`flex flex-col gap-6 transition-all duration-300 ${!wsReady || !bluetoothReady ? "opacity-40 pointer-events-none filter blur-[1px]" : ""}`}>
                
                {/* Power Switch */}
                <div className="flex flex-row items-center justify-between p-4 rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center gap-3">
                        <Power className={`h-5 w-5 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="flex flex-col gap-0.5">
                            <label className="text-base font-semibold">Power</label>
                            <span className="text-sm text-muted-foreground">LED-Strip toggle ON or OFF</span>
                        </div>
                    </div>
                    <Switch checked={isOn} onCheckedChange={handlePowerToggle} />
                </div>

                {/* Brightness-Slider */}
                <div className={`flex flex-row items-center justify-between p-4 rounded-xl border bg-card shadow-sm gap-4 transition-opacity ${!isOn && "opacity-50 pointer-events-none"}`}>
                    <Sun className="h-4 w-4" />
                    <Slider value={[brightness]} max={255} step={1} onValueChange={handleBrightnessChange} />
                </div>

                {/* Color-Picker */}
                <div className={`flex flex-row items-center justify-between p-4 rounded-xl border transition-opacity ${!isOn && "opacity-50 pointer-events-none"}`}>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-base font-semibold">Color</label>
                    <span className="text-sm text-muted-foreground">Color for the led light</span>
                  </div>
                  <ColorDisk value={ledColor} onChange={handleColorChange} />
                </div>

            </div>
        </div>
    )
}

export default App