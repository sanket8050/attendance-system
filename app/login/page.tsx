"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ModeToggle } from "@/components/mode-toggle"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [employeeId, setEmployeeId] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: formData.username, password: formData.password })
      })
      const data = await response.json()
      if (response.ok && data.access_token) {
        localStorage.setItem("jwt", data.access_token)
        localStorage.setItem("userRole", "admin") // Optionally use data.role if returned
        toast({
          title: "Login successful",
          description: "Welcome to the Attendance Management System",
        })
        router.push("/")
      } else {
        toast({
          title: "Login failed",
          description: data.msg || "Invalid username or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeId) {
      toast({
        title: "ID Required",
        description: "Please enter your employee ID",
        variant: "destructive",
      })
      return
    }

    // Store the employee ID in localStorage
    localStorage.setItem("employeeId", employeeId)

    // Redirect to mark attendance page
    router.push("/mark-attendance")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/50">
      <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold">AM</span>
          </div>
          <span className="font-bold">Attendance Manager</span>
        </div>
        <ModeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Attendance Management System</h1>
            <p className="text-muted-foreground mt-2">Sign in to continue</p>
          </div>

          <Card>
            <Tabs defaultValue="employee" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee">Employee</TabsTrigger>
                <TabsTrigger value="admin">Administrator</TabsTrigger>
              </TabsList>

              <TabsContent value="employee">
                <form onSubmit={handleEmployeeLogin}>
                  <CardHeader>
                    <CardTitle>Employee Login</CardTitle>
                    <CardDescription>Enter your ID to mark attendance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        placeholder="Enter your employee ID"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">
                      Continue to Mark Attendance
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin}>
                  <CardHeader>
                    <CardTitle>Admin Login</CardTitle>
                    <CardDescription>Enter your credentials to access the dashboard</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="username"
                          name="username"
                          placeholder="Enter your username"
                          className="pl-10"
                          value={formData.username}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">Toggle password visibility</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>For demo purposes:</p>
            <p>
              Admin login: username: <strong>admin</strong>, password: <strong>admin123</strong>
            </p>
            <p>Employee: Enter any ID number</p>
          </div>
        </div>
      </div>
    </div>
  )
}

