"use client"

import { useState, useRef, useEffect } from 'react'
import { Camera, Check, X, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { ModeToggle } from "@/components/mode-toggle"

type Step = "input" | "camera" | "processing" | "result"

export default function MarkAttendancePage() {
  const [employeeId, setEmployeeId] = useState("")
  const [step, setStep] = useState<Step>("input")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [result, setResult] = useState<"success" | "failure" | null>(null)
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
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
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setIsCameraActive(false)
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return null

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to data URL
    return canvas.toDataURL("image/jpeg")
  }

  const captureAndProcess = () => {
    const imageData = captureImage()
    if (!imageData) return
    
    setPreviewImage(imageData)
    setStep("processing")
    setIsProcessing(true)
    stopCamera()

    // Simulate processing with progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setProgressValue(progress)
      if (progress >= 100) {
        clearInterval(interval)
        
        // Simulate a random result (success/failure) for demo
        // In a real app, this would be the response from the backend
        const isSuccess = Math.random() > 0.3
        setResult(isSuccess ? "success" : "failure")
        setConfidenceScore(isSuccess ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 50)
        setStep("result")
        setIsProcessing(false)
      }
    }, 100)
  }

  const reset = () => {
    setStep("input")
    setResult(null)
    setConfidenceScore(null)
    setProgressValue(0)
    setIsProcessing(false)
    setPreviewImage(null)
    setEmployeeId("")
  }

  const proceedToCamera = () => {
    if (!employeeId) {
      toast({
        title: "ID Required",
        description: "Please enter your employee ID to continue",
        variant: "destructive",
      })
      return
    }
    setStep("camera")
    startCamera()
  }

  // Clean up camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex flex-col">
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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>
              {step === "input" && "Please enter your employee ID to continue."}
              {step === "camera" && "Look at the camera and click the capture button."}
              {step === "processing" && "Processing your attendance..."}
              {step === "result" && "Attendance verification complete."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "input" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input 
                    id="employeeId" 
                    value={employeeId} 
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Enter your employee ID"
                  />
                </div>
                <Button onClick={proceedToCamera} className="w-full" disabled={!employeeId}>
                  Continue
                </Button>
              </div>
            )}

            {step === "camera" && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: "scaleX(-1)" }} // Mirror the video
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Face detection guide */}
                  {isCameraActive && (
                    <div className="absolute inset-0 border-4 border-dashed border-primary/50 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-primary rounded-full opacity-50"></div>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    stopCamera()
                    setStep("input")
                  }}>
                    Back
                  </Button>
                  <Button onClick={captureAndProcess} disabled={!isCameraActive}>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture
                  </Button>
                </div>
              </div>
            )}

            {step === "processing" && (
              <div className="space-y-4">
                {previewImage && (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={previewImage || "/placeholder.svg"} 
                      alt="Captured" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Processing...</span>
                    <span>{progressValue}%</span>
                  </div>
                  <Progress value={progressValue} />
                </div>
              </div>
            )}

            {step === "result" && result && (
              <div className="space-y-4">
                {previewImage && (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={previewImage || "/placeholder.svg"} 
                      alt="Captured" 
                      className="w-full h-full object-cover" 
                    />
                    <div className={`absolute top-2 right-2 p-1 rounded-full ${result === "success" ? "bg-green-500" : "bg-red-500"}`}>
                      {result === "success" ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <X className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>
                )}
                
                <div className={`p-4 rounded-lg ${result === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <div className="flex items-start gap-3">
                    {result === "success" ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${result === "success" ? "text-green-700" : "text-red-700"}`}>
                        {result === "success" ? "Attendance Marked Successfully!" : "Attendance Marking Failed"}
                      </p>
                      <p className="text-sm mt-1">
                        {result === "success" 
                          ? `Your attendance has been recorded with a confidence score of ${confidenceScore}%.` 
                          : `Verification failed with a confidence score of ${confidenceScore}%. Please try again or contact an administrator.`}
                      </p>
                      {result === "success" && (
                        <p className="text-sm mt-2 font-medium">
                          Time: {new Date().toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          {step === "result" && (
            <CardFooter>
              <Button onClick={reset} className="w-full">
                Mark Another Attendance
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
