import React, { useState, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface ColorDiskProps {
  value: string // Erwartet Hex wie "FF5733" (ohne #)
  onChange: (hex: string) => void
}

export function ColorDisk({ value, onChange }: ColorDiskProps) {
  const [h, setH] = useState(0)   // Hue (0-360)
  const [s, setS] = useState(100) // Saturation (0-100)
  const [l, setL] = useState(50)  // Lightness (0-100)
  const diskRef = useRef<HTMLDivElement>(null)

  // 1. Hilfsfunktion: HSL zu HEX konvertieren
  const hslToHex = (hue: number, sat: number, light: number): string => {
    const sPercent = sat / 100
    const lPercent = light / 100
    const c = (1 - Math.abs(2 * lPercent - 1)) * sPercent
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1))
    const m = lPercent - c / 2
    let r = 0, g = 0, b = 0

    if (0 <= hue && hue < 60) { r = c; g = x; b = 0 }
    else if (60 <= hue && hue < 120) { r = x; g = c; b = 0 }
    else if (120 <= hue && hue < 180) { r = 0; g = c; b = x }
    else if (180 <= hue && hue < 240) { r = 0; g = x; b = c }
    else if (240 <= hue && hue < 300) { r = x; g = 0; b = c }
    else if (300 <= hue && hue < 360) { r = c; g = 0; b = x }

    const toHex = (val: number) => Math.round((val + m) * 255).toString(16).padStart(2, "0").toUpperCase()
    return `${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // 2. Hilfsfunktion: HEX zu HSL konvertieren
  useEffect(() => {
    if (value && value.length === 6) {
      const r = parseInt(value.substring(0, 2), 16) / 255
      const g = parseInt(value.substring(2, 4), 16) / 255
      const b = parseInt(value.substring(4, 6), 16) / 255
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      let hueVal = 0, satVal = 0, lightVal = (max + min) / 2

      if (max !== min) {
        const d = max - min
        satVal = lightVal > 0.5 ? d / (2 - max - min) : d / (max + min)
        if (max === r) hueVal = (g - b) / d + (g < b ? 60 : 0)
        else if (max === g) hueVal = (b - r) / d + 2
        else if (max === b) hueVal = (r - g) / d + 4
        hueVal /= 6
      }

      setH(Math.round(hueVal * 360))
      setS(Math.round(satVal * 100))
      setL(Math.round(lightVal * 100))
    }
  }, [value])

  // 3. Klick- & Drag-Logik für den gefüllten Kreis
  const handlePointerUpdate = (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
    if (!diskRef.current) return
    const rect = diskRef.current.getBoundingClientRect()
    const radius = rect.width / 2
    
    // Position relativ zum Kreis-Mittelpunkt berechnen
    const x = e.clientX - (rect.left + radius)
    const y = e.clientY - (rect.top + radius)
    
    // 1. Farbton (Winkel) berechnen
    let angle = Math.atan2(y, x) * (180 / Math.PI)
    if (angle < 0) angle += 360
    const newH = Math.round(angle)

    // 2. Sättigung (Abstand von der Mitte) berechnen
    const distance = Math.sqrt(x * x + y * y)
    const newS = Math.min(100, Math.round((distance / radius) * 100))

    setH(newH)
    setS(newS)
    onChange(hslToHex(newH, newS, l))
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    handlePointerUpdate(e)

    const handlePointerMove = (moveEvent: PointerEvent) => handlePointerUpdate(moveEvent)
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  // Position des Pins auf dem Kreis berechnen
  const pinX = Math.cos((h * Math.PI) / 180) * (s / 100) * 80 + 80
  const pinY = Math.sin((h * Math.PI) / 180) * (s / 100) * 80 + 80

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-start gap-2 font-normal">
          <div 
            className="h-4 w-4 rounded-full border shadow-sm" 
            style={{ backgroundColor: `#${value}` }}
          />
          <span>#{value || "Farbe wählen"}</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-56 p-4 flex flex-col items-center gap-4">
        <div className="text-center space-y-1 w-full">
          <h4 className="font-medium leading-none text-sm">LED Color</h4>
          <p className="text-xs text-muted-foreground">Choose Color & Saturation</p>
        </div>

        {/* 🌟 Der gefüllte 2D-Farbkreis (Farbe + Weiß-Mischung) */}
        <div 
          ref={diskRef}
          onPointerDown={handlePointerDown}
          className="relative w-40 h-40 rounded-full cursor-crosshair select-none bg-[conic-gradient(from_90deg,red,yellow,lime,cyan,blue,magenta,red)]"
        >
          {/* Das Radial-Sättigungs-Overlay (Mitte wird weiß) */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#fff_0%,transparent_100%)]" />

          {/* 🎯 Der frei bewegliche Auswahl-Pin (fährt rein und raus) */}
          <div 
            className="absolute w-4 h-4 rounded-full bg-white border-2 border-slate-950 shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2" 
            style={{ left: `${pinX}px`, top: `${pinY}px` }}
          />
        </div>

        {/* 🌟 Der Helligkeits-Regler (Die 3. Dimension für Black / Pastelltöne) */}
        <div className="w-full space-y-1.5 mt-2">
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <Label>Saturation</Label>
            <span>{l}%</span>
          </div>
          <Slider 
            value={[l]} 
            max={100} 
            min={0}
            step={1} 
            onValueChange={(val) => {
              setL(val[0])
              onChange(hslToHex(h, s, val[0]))
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}