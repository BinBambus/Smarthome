import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router"
import { Toaster } from "@/components/ui/sonner"

export default function Layout() {
  return (
    <SidebarProvider>
      <Toaster />
      <AppSidebar />
      {/* flex-1 sorgt dafür, dass der Inhalt den Rest des Bildschirms ausfüllt */}
      <main className="flex-1 p-6"> 
        <SidebarTrigger />
        
        {/* Hier injiziert React Router gleich deine Seiten (App, Settings, etc.) */}
        <Outlet /> 
      </main>
    </SidebarProvider>
  )
}