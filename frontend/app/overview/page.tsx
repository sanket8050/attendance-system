"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Download, Github } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function OverviewPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 md:ml-64">
          <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project Overview</h1>
              <p className="text-muted-foreground">Attendance Management System with Facial Recognition</p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important Note</AlertTitle>
              <AlertDescription>
                This is a demonstration project. In a production environment, you would need to implement proper security measures and optimize the facial recognition algorithms.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="architecture">Architecture</TabsTrigger>
                <TabsTrigger value="installation">Installation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Description</CardTitle>
                    <CardDescription>A modern attendance management system with facial recognition</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      This project is a comprehensive attendance management system that uses facial recognition to track attendance. 
                      It includes both a web interface built with Next.js and a Python backend for facial recognition.
                    </p>
                    
                    <h3 className="text-lg font-semibold mt-4">Key Features</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Facial recognition-based attendance tracking</li>
                      <li>Admin dashboard with attendance statistics and reports</li>
                      <li>User enrollment with facial data capture</li>
                      <li>Real-time attendance marking</li>
                      <li>Configurable thresholds for attendance and recognition</li>
                      <li>Role-based access control</li>
                    </ul>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <Button className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        View on GitHub
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Frontend Stack</CardTitle>
                      <CardDescription>Technologies used in the frontend</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Next.js (React framework)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Tailwind CSS for styling
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          ShadCN UI Components
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Backend Stack</CardTitle>
                      <CardDescription>Technologies used in the backend</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Python
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          OpenCV for image processing
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          DeepFace for facial recognition
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Flask API to connect frontend and backend
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="architecture" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Architecture</CardTitle>
                    <CardDescription>High-level view of system components and flow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      The system is designed with modular components for scalability and ease of maintenance. It consists of:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Web frontend for user interaction and admin dashboard</li>
                      <li>RESTful API using Flask to connect the frontend and backend</li>
                      <li>Facial recognition service using DeepFace and OpenCV</li>
                      <li>Database for storing user profiles and attendance records</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="installation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Installation Instructions</CardTitle>
                    <CardDescription>Step-by-step guide to set up the project locally</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <h4 className="font-semibold">Frontend Setup</h4>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Clone the repository from GitHub</li>
                      <li>Navigate to the frontend directory</li>
                      <li>Run <code>npm install</code> to install dependencies</li>
                      <li>Run <code>npm run dev</code> to start the development server</li>
                    </ol>

                    <h4 className="font-semibold mt-4">Backend Setup</h4>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Navigate to the backend directory</li>
                      <li>Create a virtual environment and activate it</li>
                      <li>Run <code>pip install -r requirements.txt</code></li>
                      <li>Run <code>python app.py</code> to start the backend API</li>
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
