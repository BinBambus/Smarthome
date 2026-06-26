import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router"
import { Toaster } from "@/components/ui/sonner"

export default function Layout() {
  return (
    <SidebarProvider>
      <Toaster />
      <AppSidebar />
      <main className="flex-1 p-6"> 
        <SidebarTrigger />        
        <Outlet /> 
      </main>
    </SidebarProvider>
  )
}