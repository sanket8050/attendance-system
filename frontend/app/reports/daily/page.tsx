"use client"

import { useState } from "react"
import { CalendarIcon, Download, FileDown, Printer } from "lucide-react"
import { format } from "date-fns"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AttendanceTable, type Attendance } from "@/components/attendance-table"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function DailyReportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [date, setDate] = useState<Date>(new Date())

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Daily Attendance Report</h1>
                <p className="text-muted-foreground">View and manage daily attendance records</p>
              </div>

              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>

                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>

                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">876 / 1,248</div>
                  <p className="text-xs text-muted-foreground">70.2% attendance rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">On Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">723</div>
                  <p className="text-xs text-muted-foreground">82.5% of present</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">124</div>
                  <p className="text-xs text-muted-foreground">14.2% of present</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Early Leaves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-500">29</div>
                  <p className="text-xs text-muted-foreground">3.3% of present</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="all">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="faculty">Faculty</TabsTrigger>
                  <TabsTrigger value="staff">Staff</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>

              <TabsContent value="all" className="mt-4">
                <AttendanceTable data={attendanceData} />
              </TabsContent>

              <TabsContent value="students" className="mt-4">
                <AttendanceTable data={attendanceData.filter((item) => item.role === "Student")} />
              </TabsContent>

              <TabsContent value="faculty" className="mt-4">
                <AttendanceTable data={attendanceData.filter((item) => item.role === "Faculty")} />
              </TabsContent>

              <TabsContent value="staff" className="mt-4">
                <AttendanceTable
                  data={attendanceData.filter((item) => item.role === "Admin" || item.role === "Security")}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

