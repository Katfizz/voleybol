import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Outlet } from "react-router-dom"

export function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="p-2">
            <SidebarTrigger />
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  )
}