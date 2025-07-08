"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { FeatureToggle } from "@/components/feature-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
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
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Configure system preferences and features</p>
            </div>

            <Tabs defaultValue="features">
              <TabsList className="grid w-full grid-cols-4 md:w-auto">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Management</CardTitle>
                    <CardDescription>Enable or disable system features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FeatureToggle
                      label="Geo-fencing"
                      description="Restrict attendance marking to specific locations"
                      defaultChecked={true}
                    />
                    <FeatureToggle
                      label="Email Alerts"
                      description="Send email notifications for attendance events"
                      defaultChecked={true}
                    />
                    <FeatureToggle
                      label="Facial Re-enrollment"
                      description="Allow periodic re-enrollment of facial data"
                    />
                    <FeatureToggle
                      label="Blacklist Mode"
                      description="Enable blacklisting of specific members"
                      defaultChecked={false}
                    />
                    <FeatureToggle
                      label="Parent Notifications"
                      description="Send attendance updates to parents/guardians"
                      defaultChecked={true}
                    />
                    <FeatureToggle
                      label="Automatic Reports"
                      description="Generate and send reports automatically"
                      defaultChecked={true}
                    />
                    <FeatureToggle
                      label="Manual Override"
                      description="Allow manual attendance marking"
                      defaultChecked={true}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="thresholds" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Threshold Settings</CardTitle>
                    <CardDescription>Configure minimum thresholds for attendance and recognition</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="attendance-threshold">Minimum Attendance Threshold</Label>
                        <span className="text-sm">75%</span>
                      </div>
                      <Slider id="attendance-threshold" defaultValue={[75]} max={100} step={1} />
                      <p className="text-xs text-muted-foreground">
                        Students below this threshold will be flagged in reports
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="confidence-threshold">Face Recognition Confidence</Label>
                        <span className="text-sm">80%</span>
                      </div>
                      <Slider id="confidence-threshold" defaultValue={[80]} max={100} step={1} />
                      <p className="text-xs text-muted-foreground">
                        Minimum confidence score required for successful recognition
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="late-threshold">Late Arrival Threshold</Label>
                        <span className="text-sm">15 minutes</span>
                      </div>
                      <Slider id="late-threshold" defaultValue={[15]} max={60} step={5} />
                      <p className="text-xs text-muted-foreground">Minutes after scheduled time to mark as late</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="early-leave-threshold">Early Leave Threshold</Label>
                        <span className="text-sm">15 minutes</span>
                      </div>
                      <Slider id="early-leave-threshold" defaultValue={[15]} max={60} step={5} />
                      <p className="text-xs text-muted-foreground">
                        Minutes before scheduled end time to mark as early leave
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="geo-radius">Geo-fencing Radius (meters)</Label>
                      <Input id="geo-radius" type="number" defaultValue="100" />
                      <p className="text-xs text-muted-foreground">
                        Maximum distance from designated location to allow attendance marking
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Threshold Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure when and how notifications are sent</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FeatureToggle
                      label="Real-time Attendance Notifications"
                      description="Show pop-up when attendance is marked"
                      defaultChecked={true}
                    />
                    <FeatureToggle
                      label="Daily Summary Email"
                      description="Send daily attendance summary via email"
                      defaultChecked={true}
                    />
                    <FeatureToggle
                      label="Parent Notifications"
                      description="Notify parents when student attendance is marked"
                    />
                    <FeatureToggle
                      label="Low Confidence Alerts"
                      description="Alert when face recognition confidence is below threshold"
                      defaultChecked={true}
                    />
                    <FeatureToggle
                      label="Location Mismatch Alerts"
                      description="Alert when attendance is marked outside geo-fence"
                      defaultChecked={true}
                    />

                    <div className="pt-4 space-y-2">
                      <Label htmlFor="email-schedule">Email Report Schedule</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <Button variant="outline" className="border-primary bg-primary/10">
                          Daily
                        </Button>
                        <Button variant="outline">Weekly</Button>
                        <Button variant="outline">Monthly</Button>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Label htmlFor="admin-email">Admin Email for Reports</Label>
                      <Input id="admin-email" type="email" placeholder="admin@example.com" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Notification Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="blacklist" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Blacklist Management</CardTitle>
                    <CardDescription>Manage users who are restricted from accessing the system</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Enter ID or name to search" className="flex-1" />
                      <Button variant="secondary">Search</Button>
                      <Button>Add to Blacklist</Button>
                    </div>

                    <div className="border rounded-md">
                      <div className="bg-muted px-4 py-2 flex items-center justify-between font-medium">
                        <div className="w-1/4">ID</div>
                        <div className="w-1/4">Name</div>
                        <div className="w-1/4">Reason</div>
                        <div className="w-1/4">Actions</div>
                      </div>

                      {/* Sample blacklisted users */}
                      {[
                        { id: "STU042", name: "Rahul Verma", reason: "Multiple violations" },
                        { id: "STU078", name: "Anjali Patel", reason: "Unauthorized access attempt" },
                        { id: "FAC023", name: "Vikram Malhotra", reason: "Security concern" },
                      ].map((user, index) => (
                        <div key={index} className="px-4 py-3 flex items-center justify-between border-t">
                          <div className="w-1/4">{user.id}</div>
                          <div className="w-1/4">{user.name}</div>
                          <div className="w-1/4">{user.reason}</div>
                          <div className="w-1/4 flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm">
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted/50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Blacklist Settings</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-blacklist after failed attempts</p>
                            <p className="text-sm text-muted-foreground">
                              Automatically add users to blacklist after multiple failed authentication attempts
                            </p>
                          </div>
                          <Switch id="auto-blacklist" />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label htmlFor="failed-attempts">Failed attempts threshold</Label>
                            <Select defaultValue="3">
                              <SelectTrigger id="failed-attempts">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 attempts</SelectItem>
                                <SelectItem value="5">5 attempts</SelectItem>
                                <SelectItem value="10">10 attempts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex-1">
                            <Label htmlFor="blacklist-duration">Blacklist duration</Label>
                            <Select defaultValue="24h">
                              <SelectTrigger id="blacklist-duration">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1h">1 hour</SelectItem>
                                <SelectItem value="24h">24 hours</SelectItem>
                                <SelectItem value="7d">7 days</SelectItem>
                                <SelectItem value="permanent">Permanent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Blacklist Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

