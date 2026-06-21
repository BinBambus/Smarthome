import { Slider } from "@/components/ui/slider"
import { Sun } from "lucide-react"
import { useState } from "react"
import { ColorDisk } from "@/components/ui/color-disk"

export function App() {
    const [ledColor, setLedColor] = useState("FF0000") // Startfarbe Rot

    return (
        // mx-auto zentriert den gesamten Block horizontal auf der Seite
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 mt-6">
            
            {/* Überschrift mit einer feinen Trennlinie */}
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight">LED Control</h1>
                <p className="text-sm text-muted-foreground mt-1">
                Customize the appearance of your LED lights.
                </p>
            </div>

            <div className="flex flex-row items-center justify-between p-4 rounded-xl border bg-card shadow-sm gap-4">
                <Sun className="h-4 w-4" />
                <Slider defaultValue={[33]} max={255} step={1} />
            </div>

            <div className="flex flex-row items-center justify-between p-4 rounded-xl border">
              <div className="flex flex-col gap-0.5">
                <label className="text-base font-semibold">Color</label>
                <span className="text-sm text-muted-foreground">Color for the led light</span>
              </div>

              {/* Runder Colorpicker */}
              <ColorDisk value={ledColor} onChange={setLedColor} />
            </div>

        </div>
    )
}

export default App