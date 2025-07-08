"use client"

import { useState } from "react"
import { Calendar, Clock, Users, UserCheck, UserX } from "lucide-react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { StatCard } from "@/components/stat-card"
import { FeatureToggle } from "@/components/feature-toggle"
import { AttendanceTable, type Attendance } from "@/components/attendance-table"
import { LineChartComponent } from "@/components/charts/line-chart"
import { PieChartComponent } from "@/components/charts/pie-chart"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Sample data
const attendanceData: Attendance[] = [
  {
    id: "STU001",
    name: "Sanket Patel",
    timeIn: "9:05 AM",
    status: "On-time",
    confidenceScore: 98,
    location: "Main Building",
    role: "Student",
  },
  {
    id: "FAC002",
    name: "Priya Sharma",
    timeIn: "8:45 AM",
    status: "On-time",
    confidenceScore: 95,
    location: "Faculty Block",
    role: "Faculty",
  },
  {
    id: "STU003",
    name: "Raj Kumar",
    timeIn: "9:30 AM",
    status: "Late",
    confidenceScore: 76,
    location: "Main Building",
    role: "Student",
  },
  {
    id: "ADM004",
    name: "Anita Desai",
    timeIn: "8:30 AM",
    status: "On-time",
    confidenceScore: 99,
    location: "Admin Block",
    role: "Admin",
  },
  {
    id: "STU005",
    name: "Vikram Singh",
    timeIn: "10:15 AM",
    status: "Late",
    confidenceScore: 92,
    location: "Main Building",
    role: "Student",
  },
  {
    id: "SEC006",
    name: "Ramesh Patel",
    timeIn: "7:45 AM",
    status: "On-time",
    confidenceScore: 97,
    location: "Security Gate",
    role: "Security",
  },
  {
    id: "STU007",
    name: "Neha Gupta",
    timeIn: "9:10 AM",
    status: "On-time",
    confidenceScore: 94,
    location: "Main Building",
    role: "Student",
  },
  {
    id: "STU008",
    name: "Arjun Reddy",
    timeIn: "8:50 AM",
    status: "On-time",
    confidenceScore: 91,
    location: "Main Building",
    role: "Student",
  },
  {
    id: "FAC009",
    name: "Meera Iyer",
    timeIn: "8:15 AM",
    status: "Early Leave",
    confidenceScore: 88,
    location: "Faculty Block",
    role: "Faculty",
  },
  {
    id: "STU010",
    name: "Karan Malhotra",
    timeIn: "9:45 AM",
    status: "Late",
    confidenceScore: 85,
    location: "Main Building",
    role: "Student",
  },
]

const trendData = [
  { name: "Mon", Regular: 85, Irregular: 15 },
  { name: "Tue", Regular: 80, Irregular: 20 },
  { name: "Wed", Regular: 90, Irregular: 10 },
  { name: "Thu", Regular: 87, Irregular: 13 },
  { name: "Fri", Regular: 75, Irregular: 25 },
  { name: "Sat", Regular: 70, Irregular: 30 },
  { name: "Sun", Regular: 65, Irregular: 35 },
]

const pieData = [
  { name: ">75%", value: 65 },
  { name: "50-75%", value: 25 },
  { name: "<50%", value: 10 },
]

const hourlyData = [
  { name: "8 AM", Present: 45, Late: 0, "Early Leave": 0 },
  { name: "9 AM", Present: 80, Late: 15, "Early Leave": 0 },
  { name: "10 AM", Present: 90, Late: 25, "Early Leave": 0 },
  { name: "11 AM", Present: 95, Late: 25, "Early Leave": 0 },
  { name: "12 PM", Present: 95, Late: 25, "Early Leave": 0 },
  { name: "1 PM", Present: 90, Late: 25, "Early Leave": 5 },
  { name: "2 PM", Present: 85, Late: 25, "Early Leave": 10 },
  { name: "3 PM", Present: 80, Late: 25, "Early Leave": 15 },
  { name: "4 PM", Present: 70, Late: 25, "Early Leave": 25 },
]

const topAttendees = [
  { name: "Sanket Patel", percentage: 98 },
  { name: "Anita Desai", percentage: 96 },
  { name: "Ramesh Patel", percentage: 95 },
  { name: "Priya Sharma", percentage: 94 },
]

export default function Home() {
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's an overview of today's attendance.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <FeatureToggle label="Geo-fencing" defaultChecked={true} />
                <FeatureToggle label="Email Alerts" defaultChecked={true} />
                <FeatureToggle label="Facial Re-enrollment" />
                <FeatureToggle label="Blacklist Mode" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Enrolled"
                value="1,248"
                icon={Users}
                description="Total members in the system"
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Present Today"
                value="876"
                icon={UserCheck}
                description="70.2% of total enrolled"
                trend={{ value: 5, isPositive: true }}
                className="border-green-200 dark:border-green-900"
              />
              <StatCard
                title="Absent Today"
                value="372"
                icon={UserX}
                description="29.8% of total enrolled"
                trend={{ value: 3, isPositive: false }}
                className="border-red-200 dark:border-red-900"
              />
              <StatCard
                title="Average Time In"
                value="9:15 AM"
                icon={Clock}
                description="15 minutes later than last week"
                trend={{ value: 8, isPositive: false }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="md:col-span-1 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Top Attendees</CardTitle>
                  <CardDescription>Members with highest attendance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topAttendees.map((attendee, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32&text=${attendee.name.charAt(0)}`}
                            alt={attendee.name}
                          />
                          <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{attendee.name}</p>
                            <Badge variant="outline">{attendee.percentage}%</Badge>
                          </div>
                          <Progress value={attendee.percentage} className="h-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-1 lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Today's Calendar</CardTitle>
                    <CardDescription>April 6, 2025</CardDescription>
                  </div>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
                        </span>
                        <div
                          className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center text-xs ${i === 6 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        >
                          {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      { time: "9:00 AM", title: "Morning Assembly", location: "Main Hall" },
                      { time: "10:30 AM", title: "Department Meeting", location: "Conference Room" },
                      { time: "2:00 PM", title: "Faculty Training", location: "Training Center" },
                    ].map((event, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md border p-2">
                        <div className="h-10 w-1 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{event.time}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{event.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <LineChartComponent
                title="Attendance Trends"
                description="Weekly comparison of regular vs irregular attendees"
                data={trendData}
                categories={["Regular", "Irregular"]}
                className="md:col-span-2 lg:col-span-1"
              />
              <PieChartComponent
                title="Attendance Distribution"
                description="Percentage breakdown by attendance threshold"
                data={pieData}
                colors={["#10b981", "#f59e0b", "#ef4444"]}
                className="md:col-span-2 lg:col-span-1"
              />
              <BarChartComponent
                title="Hourly Activity"
                description="Presence patterns throughout the day"
                data={hourlyData}
                categories={["Present", "Late", "Early Leave"]}
                colors={["#10b981", "#f59e0b", "#ef4444"]}
                className="md:col-span-2 lg:col-span-1"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight mb-4">Live Attendance Feed</h2>
              <AttendanceTable data={attendanceData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

