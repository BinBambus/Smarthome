import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar"
// Icons für dein Smarthome (musst du ggf. installieren: npm i lucide-react)
import { Clock, Sun, Settings } from "lucide-react" 

export function AppSidebar() {
  return (
    <Sidebar>
      {/* Header-Bereich der Sidebar */}
      <SidebarHeader className="p-4 border-b">
        <span className="font-bold text-lg text-primary">SmartLight</span>
      </SidebarHeader>

      {/* Hauptinhalt */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Control</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              {/* Entry 1: LED Control */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/" className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>LED Control</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Entry 2: Alarms */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/alarms" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Alarms</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}