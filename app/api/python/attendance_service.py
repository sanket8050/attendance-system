import sys
import json
import base64
import os
import cv2
import numpy as np
from datetime import datetime
import csv

# This would be a simplified version of the Python backend
# In a real implementation, this would import and use the functions from the main script

# Constants
USER_DATA_CSV = "user_data.csv"
ATTENDANCE_CSV = "daily_attendance.csv"
TEMP_IMAGE_DIR = "temp_images"

# Ensure temp directory exists
os.makedirs(TEMP_IMAGE_DIR, exist_ok=True)

def base64_to_image(base64_string):
    """Convert base64 string to OpenCV image"""
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode base64 string to image
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def authenticate_user(user_id, image_data):
    """Authenticate a user with face recognition"""
    # In a real implementation, this would:
    # 1. Load the user's stored embeddings
    # 2. Generate an embedding for the provided image
    # 3. Compare the embeddings and return a result
    
    # For demo purposes, we'll simulate the result
    # In a real implementation, this would call functions from the main script
    
    # Save the image for debugging/logging
    img = base64_to_image(image_data)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    img_path = os.path.join(TEMP_IMAGE_DIR, f"auth_{user_id}_{timestamp}.jpg")
    cv2.imwrite(img_path, img)
    
    # Simulate authentication result
    import random
    success = random.random() > 0.2
    confidence_score = random.randint(80, 99) if success else random.randint(50, 79)
    
    result = {
        "success": success,
        "confidence_score": confidence_score,
        "message": "Authentication successful" if success else "Authentication failed",
        "timestamp": datetime.now().isoformat()
    }
    
    # In a real implementation, we would update the attendance record
    
    return result

def enroll_user(user_id, name, role, image_data):
    """Enroll a new user with facial data"""
    # In a real implementation, this would:
    # 1. Generate embeddings for the provided images
    # 2. Save the embeddings and user data
    
    # For demo purposes, we'll simulate the result
    # In a real implementation, this would call functions from the main script
    
    # Save the image for enrollment
    img = base64_to_image(image_data)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    img_path = os.path.join(TEMP_IMAGE_DIR, f"enroll_{user_id}_{timestamp}.jpg")
    cv2.imwrite(img_path, img)
    
    result = {
        "success": True,
        "message": f"User {name} enrolled successfully",
        "user_id": user_id,
        "timestamp": datetime.now().isoformat()
    }
    
    return result

def get_attendance_stats():
    """Get attendance statistics"""
    # In a real implementation, this would read from the CSV files
    # For demo purposes, we'll return mock data
    
    return {
        "total_enrolled": 1248,
        "present_today": 876,
        "absent_today": 372,
        "average_time_in": "9:15 AM"
    }

def get_attendance_records():
    """Get attendance records"""
    # In a real implementation, this would read from the CSV files
    # For demo purposes, we'll return mock data
    
    return [
        {
            "id": "STU001",
            "name": "Sanket Patel",
            "time_in": "9:05 AM",
            "status": "On-time",
            "confidence_score": 98,
            "location": "Main Building",
            "role": "Student",
        },
        # More entries would be here
    ]

def main():
    """Main function to handle API requests"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action specified"}))
        return
    
    action = sys.argv[1]
    
    if action == "authenticate":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Missing parameters for authentication"}))
            return
        
        user_id = sys.argv[2]
        image_data = sys.argv[3]
        result = authenticate_user(user_id, image_data)
        print(json.dumps(result))
    
    elif action == "enroll":
        if len(sys.argv) < 6:
            print(json.dumps({"error": "Missing parameters for enrollment"}))
            return
        
        user_id = sys.argv[2]
        name = sys.argv[3]
        role = sys.argv[4]
        image_data = sys.argv[5]
        result = enroll_user(user_id, name, role, image_data)
        print(json.dumps(result))
    
    elif action == "stats":
        result = get_attendance_stats()
        print(json.dumps(result))
    
    elif action == "records":
        result = get_attendance_records()
        print(json.dumps(result))
    
    else:
        print(json.dumps({"error": f"Unknown action: {action}"}))

if __name__ == "__main__":
    main()
