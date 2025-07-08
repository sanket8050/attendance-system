"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Upload, X } from 'lucide-react'
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export default function EnrollPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [captureMode, setCaptureMode] = useState<"camera" | "upload">("camera")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureCount, setCaptureCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearPreview = () => {
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const startCamera = async () => {
    try {
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
        toast({
          title: "Camera activated",
          description: "Please look at the camera and follow the prompts",
        })
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
      setIsCapturing(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setIsCameraActive(false)
      setIsCapturing(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to data URL (base64 encoded image)
    const imageData = canvas.toDataURL("image/jpeg")
    setPreviewImage(imageData)

    // Increment capture count
    const newCount = captureCount + 1
    setCaptureCount(newCount)

    toast({
      title: `Photo ${newCount}/5 captured`,
      description:
        newCount < 5
          ? "Please adjust your position slightly for the next capture"
          : "All photos captured successfully!",
    })

    if (newCount >= 5) {
      stopCamera()
      // Here you would send the captured images to your backend
      toast({
        title: "Enrollment photos complete",
        description: "Ready to submit enrollment data",
      })
    }
  }

  // Clean up camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 md:ml-64">
          <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Enroll New Member</h1>
              <p className="text-muted-foreground">Add a new person to the facial recognition system</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="backdrop-blur-sm bg-background/80 border shadow-md">
                <CardHeader>
                  <CardTitle>Capture Face</CardTitle>
                  <CardDescription>Take a clear photo of the person's face for enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    defaultValue="camera"
                    className="grid grid-cols-2 gap-4 mb-6"
                    onValueChange={(value) => {
                      setCaptureMode(value as "camera" | "upload")
                      if (value === "camera") {
                        clearPreview()
                      } else {
                        stopCamera()
                      }
                    }}
                  >
                    <div>
                      <RadioGroupItem value="camera" id="camera" className="peer sr-only" />
                      <Label
                        htmlFor="camera"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Camera className="mb-3 h-6 w-6" />
                        Use Camera
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="upload" id="upload" className="peer sr-only" />
                      <Label
                        htmlFor="upload"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Upload className="mb-3 h-6 w-6" />
                        Upload Image
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-4">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      {previewImage ? (
                        <>
                          <img
                            src={previewImage || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={clearPreview}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : captureMode === "camera" ? (
                        isCameraActive ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{ transform: "scaleX(-1)" }} // Mirror the video
                          />
                        ) : (
                          <div className="text-center">
                            <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Click "Start Camera" to begin</p>
                          </div>
                        )
                      ) : (
                        <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Click to upload an image</p>
                          <input 
                            id="file-upload" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange}
                            ref={fileInputRef}
                          />
                        </label>
                      )}

                      {/* Add face detection indicators */}
                      {isCameraActive && !previewImage && (
                        <div className="absolute inset-0 border-4 border-dashed border-primary/50 pointer-events-none">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-primary rounded-full opacity-50"></div>
                        </div>
                      )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    {captureMode === "camera" && (
                      <div className="flex justify-center gap-2">
                        {!isCameraActive ? (
                          <Button onClick={startCamera} disabled={isCapturing}>
                            <Camera className="mr-2 h-4 w-4" />
                            Start Camera
                          </Button>
                        ) : (
                          <>
                            <Button onClick={capturePhoto} variant="default">
                              <Camera className="mr-2 h-4 w-4" />
                              Capture Photo ({captureCount}/5)
                            </Button>
                            <Button onClick={stopCamera} variant="outline">
                              <X className="mr-2 h-4 w-4" />
                              Stop Camera
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80 border shadow-md">
                <CardHeader>
                  <CardTitle>Member Details</CardTitle>
                  <CardDescription>Enter the information for the new member</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="Enter first name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Enter last name" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id">ID Number</Label>
                      <Input id="id" placeholder="Enter ID number" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter email address" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department/Class</Label>
                      <Select>
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cs">Computer Science</SelectItem>
                          <SelectItem value="ee">Electrical Engineering</SelectItem>
                          <SelectItem value="me">Mechanical Engineering</SelectItem>
                          <SelectItem value="ce">Civil Engineering</SelectItem>
                          <SelectItem value="admin">Administration</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Enroll Member</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
