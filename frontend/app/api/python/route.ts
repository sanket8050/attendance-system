import { NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { action, userId, name, role, imageData } = data
    
    // Path to the Python script
    const scriptPath = path.join(process.cwd(), "app/api/python/attendance_service.py")
    
    let command = ""
    
    if (action === "authenticate") {
      command = `python ${scriptPath} authenticate ${userId} "${imageData}"`
    } else if (action === "enroll") {
      command = `python ${scriptPath} enroll ${userId} "${name}" "${role}" "${imageData}"`
    } else if (action === "stats") {
      command = `python ${scriptPath} stats`
    } else if (action === "records") {
      command = `python ${scriptPath} records`
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
    
    const { stdout, stderr } = await execAsync(command)
    
    if (stderr) {
      console.error("Python script error:", stderr)
      return NextResponse.json({ error: stderr }, { status: 500 })
    }
    
    const result = JSON.parse(stdout)
    return NextResponse.json(result)
    
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")
    
    // Path to the Python script
    const scriptPath = path.join(process.cwd(), "app/api/python/attendance_service.py")
    
    let command = ""
    
    if (action === "stats") {
      command = `python ${scriptPath} stats`
    } else if (action === "records") {
      command = `python ${scriptPath} records`
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
    
    const { stdout, stderr } = await execAsync(command)
    
    if (stderr) {
      console.error("Python script error:", stderr)
      return NextResponse.json({ error: stderr }, { status: 500 })
    }
    
    const result = JSON.parse(stdout)
    return NextResponse.json(result)
    
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
