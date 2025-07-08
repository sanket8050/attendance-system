"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if user is authenticated on mount
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true"
    setIsAuthenticated(authStatus)
    
    // Redirect to login if not authenticated and not on public routes
    const publicRoutes = ["/login", "/mark-attendance"]
    if (!authStatus && !publicRoutes.includes(pathname)) {
      router.push("/login")
    }
  }, [pathname, router])

  const login = async (username: string, password: string) => {
    // In a real app, this would be an API call
    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true)
      localStorage.setItem("isAuthenticated", "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("isAuthenticated")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
