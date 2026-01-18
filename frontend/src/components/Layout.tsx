import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useAuth } from "@/context/AuthContext"
import { authService } from "@/services/auth.service"

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    // Verificar si la sesión sigue siendo válida al navegar
    const currentUser = authService.getCurrentUser()
    
    // Si el token expiró (getCurrentUser devuelve null) pero la app cree que hay usuario
    if (!currentUser && user) {
        logout()
        navigate("/login")
    }
  }, [location, user, logout, navigate])

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