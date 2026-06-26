import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheme } from "@/components/theme-provider"

export function Settings() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 mt-6">
            
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                Customize the appearance of your Smarthome app.
                </p>
            </div>

            <div className="flex flex-row items-center justify-between p-4 rounded-xl border bg-card shadow-sm">
                <div className="flex flex-col gap-0.5">
                    <label className="text-base font-semibold leading-none">Theme</label>
                    <span className="text-sm text-muted-foreground">Change your theme</span>
                </div>
                
                <Select
                    value={theme}
                    onValueChange={(newValue) => setTheme(newValue as "light" | "dark" | "system")}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

        </div>
    )
}

export default Settings