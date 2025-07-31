import cv2
import numpy as np
import csv
import os
import time
from datetime import datetime, timedelta
from deepface import DeepFace
from scipy.spatial.distance import cosine
import mediapipe as mp
import shutil
import getpass


#----------------------------------------------
# from deepface.basemodels import ArcFace
# from deepface.commons import functions

# print("⚡ Preloading ArcFace model...")
# arcface_model = ArcFace.loadModel()
# print("✅ Model loaded.")
#----------------------------------------------


# Constants
USER_DATA_CSV = os.path.join(os.getcwd(), "user_data.csv")
ATTENDANCE_CSV = os.path.join(os.getcwd(), "daily_attendance.csv")
UNAUTHORIZED_FOLDER = "unauthorized_attempts"
BACKUP_FOLDER = "backups"
EMBEDDINGS_FOLDER = "embeddings"
ADMIN_PASSWORD = "admin123"  # Change this in production
SIMILARITY_THRESHOLD = 0.5  # Default authentication threshold
GRACE_PERIOD_MINUTES = 30  # Late arrival grace period
MIN_ATTENDANCE_PERCENTAGE = 75  # Default minimum attendance requirement

# Ensure directories exist
for folder in [UNAUTHORIZED_FOLDER, BACKUP_FOLDER, EMBEDDINGS_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# Data caches
user_db = {}
attendance_db = {}
config = {
    "similarity_threshold": SIMILARITY_THRESHOLD,
    "grace_period_minutes": GRACE_PERIOD_MINUTES,
    "min_attendance_percentage": MIN_ATTENDANCE_PERCENTAGE,
    "geo_fencing_enabled": False,
    "email_notifications_enabled": False
}

# Initialize Mediapipe Face Detection
mp_face_detection = mp.solutions.face_detection
face_detector = mp_face_detection.FaceDetection(min_detection_confidence=0.6)

# Roles
VALID_ROLES = ["Admin", "Student", "Faculty", "Employee", "Security"]

# ---- Initialization Functions ----
def initialize_csvs():
    """Initialize CSV files with headers if they don't exist."""
    if not os.path.exists(USER_DATA_CSV):
        with open(USER_DATA_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "name", "age", "gender", "height", "weight", "role", "embedding_file", "enrollment_date", "blacklisted", "auth_count", "present_days"])
        print(f"Created {USER_DATA_CSV} with schema.")

    if not os.path.exists(ATTENDANCE_CSV):
        with open(ATTENDANCE_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["date", "timestamp", "day", "id", "name", "status", "auth_count", "present_days", "late_arrival", "early_departure"])
        print(f"Created {ATTENDANCE_CSV} with schema.")

def load_user_data():
    """Load user data from CSV into memory."""
    global user_db
    user_db.clear()
    if not os.path.exists(USER_DATA_CSV):
        return
    with open(USER_DATA_CSV, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        for row in reader:
            if len(row) < 12:
                continue
            try:
                user_id = int(row[0])
                embedding_file = row[7]
                if not os.path.exists(embedding_file):
                    print(f"Error: Embedding file {embedding_file} not found for ID {user_id}")
                    continue
                embeddings = np.load(embedding_file, allow_pickle=True).tolist()
                user_db[user_id] = {
                    "name": row[1], "age": row[2], "gender": row[3], "height": row[4], "weight": row[5],
                    "role": row[6], "embedding_file": embedding_file, "embeddings": embeddings, "enrollment_date": row[8],
                    "blacklisted": row[9] == "True", "auth_count": int(row[10]), "present_days": int(row[11])
                }
            except (ValueError, Exception) as e:
                print(f"Error loading data for ID {user_id}: {e}")
                continue
    print(f"Loaded {len(user_db)} users.")

def load_attendance_data():
    """Load attendance data from CSV into memory."""
    global attendance_db
    attendance_db.clear()
    if not os.path.exists(ATTENDANCE_CSV):
        return
    with open(ATTENDANCE_CSV, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        for row in reader:
            if len(row) < 10:
                continue
            try:
                user_id = int(row[3])
                if user_id not in attendance_db:
                    attendance_db[user_id] = []
                attendance_db[user_id].append({
                    "date": row[0], "timestamp": row[1], "day": row[2], "id": user_id, "name": row[4],
                    "status": row[5], "auth_count": int(row[6]), "present_days": int(row[7]),
                    "late_arrival": row[8] == "True", "early_departure": row[9] == "True"
                })
            except ValueError:
                continue
    print(f"Loaded attendance for {len(attendance_db)} users.")

# ---- Face Capture and Quality Check ----
def is_frame_clear_and_bright(frame, brightness_thresh=60, blur_thresh=55):
    """Check if frame is bright and clear."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    brightness = gray.mean()
    if brightness < brightness_thresh:
        print("⚠️ Frame too dark."+f" Brightness: {brightness:.2f}")
        return False
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_score < blur_thresh:
        print("⚠️ Frame too blurry. Blur Score: {:.2f}, Brightness: {:.2f}".format(blur_score, brightness))
        return False
    return True

def detect_face(frame):
    """Detect face using Mediapipe."""
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_detector.process(rgb_frame)
    return results.detections is not None

def capture_face(timeout=10, enrollment=False):
    """Capture a face with camera warmup and quality checks."""
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return None
    
    # Camera warmup
    print("Warming up camera...")
    for _ in range(10):
        cap.read()
    time.sleep(1)

    prompt = "Capturing face (press 'c' for enrollment, auto for auth)..." if enrollment else "Scanning for face..."
    print(prompt)
    start_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture frame.")
            break

        cv2.imshow("Face Capture", frame)
        key = cv2.waitKey(1) & 0xFF

        if enrollment and key == ord('c'):
            if not detect_face(frame):
                print("No valid face detected. Try again.")
                continue
            cap.release()
            cv2.destroyAllWindows()
            return frame
        elif not enrollment and detect_face(frame):
            print("✅ Face detected and processable.")
            cap.release()
            cv2.destroyAllWindows()
            return frame
        
        if time.time() - start_time > timeout:
            print("Timeout: No valid face detected.")
            break
        if enrollment and key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return None

# ---- Core Authentication Functions ----
def verify_face(stored_embeddings, live_embedding):
    """Compare live embedding with stored embeddings."""
    scores = [cosine(e, live_embedding) for e in stored_embeddings]
    avg_score = np.mean(scores)
    print(f"Similarity Score: {avg_score:.4f} (Threshold: {config['similarity_threshold']})")
    return avg_score < config["similarity_threshold"]

def write_attendance(user_id, name, status, late_arrival=False, early_departure=False):
    """Write attendance record."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    date_today = datetime.now().strftime("%Y-%m-%d")
    day_today = datetime.now().strftime("%A")
    auth_count = user_db[user_id]["auth_count"]
    present_days = user_db[user_id]["present_days"]
    
    is_new_day = True
    if user_id in attendance_db:
        for entry in attendance_db[user_id]:
            if entry["date"] == date_today and entry["status"] == "Granted":
                is_new_day = False
                break
    
    with open(ATTENDANCE_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([date_today, timestamp, day_today, user_id, name, status, auth_count, 1 if is_new_day and status == "Granted" else 0, late_arrival, early_departure])

def update_user_data():
    """Update user_data.csv with current user_db."""
    with open(USER_DATA_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "name", "age", "gender", "height", "weight", "role", "embedding_file", "enrollment_date", "blacklisted", "auth_count", "present_days"])
        for user_id, data in user_db.items():
            embedding_file = data["embedding_file"]
            np.save(embedding_file, np.array(data["embeddings"]))  # Save embeddings to .npy
            writer.writerow([user_id, data["name"], data["age"], data["gender"], data["height"], data["weight"],
                            data["role"], embedding_file, data["enrollment_date"],
                            data["blacklisted"], data["auth_count"], data["present_days"]])

# ---- User Management Functions ----
def enroll_user():
    """Enroll a new user with facial capture."""
    if not check_admin():
        return
    try:
        user_id = int(input("Enter unique ID (integer): "))
        if user_id in user_db:
            print("Error: ID already exists.")
            return
    except ValueError:
        print("Error: ID must be an integer.")
        return

    name = input("Enter name: ")
    age = input("Enter age: ")
    gender = input("Enter gender: ")
    height = input("Enter height (cm): ")
    weight = input("Enter weight (kg): ")
    role = input(f"Enter role {VALID_ROLES}: ")
    if role not in VALID_ROLES:
        print("Error: Invalid role.")
        return

    embeddings = []
    for i in range(3):
        print(f"Capturing face {i+1}/3...")
        frame = capture_face(enrollment=True)
        if frame is None:
            return
        try:
            embedding = DeepFace.represent(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), model_name="ArcFace")[0]["embedding"]
            embeddings.append(embedding)
        except Exception as e:
            print(f"Error: Face processing failed. {e}")
            return



    embedding_file = os.path.join(EMBEDDINGS_FOLDER, f"{user_id}_embeddings.npy")
    user_db[user_id] = {
        "name": name, "age": age, "gender": gender, "height": height, "weight": weight,
        "role": role, "embeddings": embeddings, "embedding_file": embedding_file, "enrollment_date": datetime.now().strftime("%Y-%m-%d"),
        "blacklisted": False, "auth_count": 0, "present_days": 0
    }
    update_user_data()
    print(f"User {name} enrolled successfully!")

def re_enroll_user():
    """Re-enroll facial data for an existing user."""
    if not check_admin():
        return
    try:
        user_id = int(input("Enter user ID to re-enroll: "))
        if user_id not in user_db:
            print("Error: User not found.")
            return
    except ValueError:
        print("Error: ID must be an integer.")
        return

    embeddings = []
    for i in range(3):
        print(f"Capturing new face {i+1}/3...")
        frame = capture_face(enrollment=True)
        if frame is None:
            return
        try:
            embedding = DeepFace.represent(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), model_name="ArcFace")[0]["embedding"]
            embeddings.append(embedding)
        except Exception as e:
            print(f"Error: Face processing failed. {e}")
            return

    user_db[user_id]["embeddings"] = embeddings
    update_user_data()
    print(f"User {user_db[user_id]['name']} re-enrolled successfully!")

def toggle_blacklist():
    """Toggle blacklist status for a user."""
    if not check_admin():
        return
    try:
        user_id = int(input("Enter user ID to toggle blacklist: "))
        if user_id not in user_db:
            print("Error: User not found.")
            return
        # if user_db[user_id]["blacklisted"]:
        #     print("Error: User is already blacklisted.")
        #     return
        if not user_db[user_id]["blacklisted"]:
            until_block = input("number of days? Leave blank for indefinite: ")
            if until_block:
                try:
                    until_block = int(until_block)
                    if until_block < 0:
                        print("Error: Number of days must be non-negative.")
                        return
                    user_db[user_id]["blacklisted_until"] = datetime.now() + timedelta(days=until_block)
                except ValueError:
                    print("Error: Invalid number of days.")
                    return


        
    except ValueError:
        print("Error: ID must be an integer.")
        return

        # Step 1: Toggle the current blacklisted status
    user_db[user_id]["blacklisted"] = not user_db[user_id]["blacklisted"]
    # 👉 This switches the status:
    # If it's True (blacklisted), it becomes False (unblacklisted), and vice versa

    # Step 2: Choose the status message based on the current value
    status = "blacklisted" if user_db[user_id]["blacklisted"] else "unblacklisted"

    # Step 3: Save updated data (this could be saving to file/database)
    update_user_data()

    # Step 4: Print message based on status
    if user_db[user_id]["blacklisted"]:
        # ✅ If user is blacklisted, show date
        print(f"User {user_db[user_id]['name']} is now {status} until {user_db[user_id].get('blacklisted_until', 'indefinite')}")
    else:
        # ✅ If user is unblacklisted, do not show the date
        print(f"User {user_db[user_id]['name']} is now {status}.")

# ---- Admin Functions ----
def check_admin():
    """Check if user has admin access."""
    password = input("Enter admin password: ")
    return password == ADMIN_PASSWORD

def manual_attendance():
    """Manually mark attendance."""
    if not check_admin():
        return
    try:
        user_id = int(input("Enter user ID: "))
        if user_id not in user_db:
            print("Error: User not found.")
            return
    except ValueError:
        print("Error: ID must be an integer.")
        return

    status = input("Enter status (Granted/Dened): ").capitalize()
    if status not in ["Granted", "Denied"]:
        print("Error: Invalid status.")
        return
    
    late = input("Late arrival? (y/n): ").lower() == 'y'
    early = input("Early departure? (y/n): ").lower() == 'y'
    if status == "Granted":
        user_db[user_id]["auth_count"] += 1
        if is_new_present_day(user_id):
            user_db[user_id]["present_days"] += 1
    
    write_attendance(user_id, user_db[user_id]["name"], status, late, early)
    update_user_data()
    print(f"Attendance marked for {user_db[user_id]['name']}.")

def configure_system():
    """Configure system settings."""
    if not check_admin():
        return
    print("Current Config:", config)
    try:
        config["similarity_threshold"] = float(input("Enter similarity threshold (0-1, default 0.5): ") or 0.5)
        config["grace_period_minutes"] = int(input("Enter grace period (minutes, default 30): ") or 30)
        config["min_attendance_percentage"] = int(input("Enter min attendance % (default 75): ") or 75)
        config["geo_fencing_enabled"] = input("Enable geo-fencing? (y/n): ").lower() == 'y'
        config["email_notifications_enabled"] = input("Enable email notifications? (y/n): ").lower() == 'y'
        print("Configuration updated.")
    except ValueError:
        print("Error: Invalid input. Configuration unchanged.")

# ---- Attendance Functions ----
def is_new_present_day(user_id):
    """Check if this is a new present day."""
    date_today = datetime.now().strftime("%Y-%m-%d")
    if user_id in attendance_db:
        for entry in attendance_db[user_id]:
            if entry["date"] == date_today and entry["status"] == "Granted":
                return False
    return True

def capture_face2(timeout=10, camera_warmup_delay=2):
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return None

    print(f"Camera warming up for {camera_warmup_delay} seconds...")
    
    # Warmup period - capture frames but don't process them
    warmup_start = time.time()
    while time.time() - warmup_start < camera_warmup_delay:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture frame during warmup.")
            cap.release()
            return None
        
        # Display the frame during warmup with a message
        cv2.putText(frame, f"Camera warming up... {int(camera_warmup_delay - (time.time() - warmup_start))}s", 
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        cv2.imshow("Authenticating Face", frame)
        cv2.waitKey(1)
    
    print("Looking for a clear, processable face...")
    start_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture frame.")
            break

        cv2.imshow("Authenticating Face", frame)
        cv2.waitKey(1)

        if time.time() - start_time > timeout:
            print("Timeout: Could not detect a valid face within 10 seconds.")
            break

        if is_frame_clear_and_bright(frame) and detect_face(frame):
            print("✅ Face detected and processable!")
            cap.release()
            cv2.destroyAllWindows()
            return frame

    cap.release()
    cv2.destroyAllWindows()
    return None

def authenticate_user(camera_warmup_delay=4):
    """Authenticate user via face recognition."""
    # load_user_data()
    try:
        user_id = int(input("Enter your unique ID: "))
        if user_id not in user_db:
            print("❌ User ID not found.")
            return
        if user_db[user_id]["blacklisted"]:
            print("❌ Access denied: User is blacklisted.")
            return
    except ValueError:
        print("Error: ID must be an integer.")
        return

    frame = capture_face2(timeout=10, camera_warmup_delay=camera_warmup_delay)
    if frame is None:
        return
    try:
        live_embedding = DeepFace.represent(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), model_name="ArcFace", enforce_detection=False)[0]["embedding"]
        timestamp = datetime.now()
        date_today = timestamp.strftime("%Y-%m-%d")
        
        late_arrival = timestamp.hour * 60 + timestamp.minute > 9 * 60 + config["grace_period_minutes"]  # After 9 AM + grace
        early_departure = timestamp.hour < 15  # Before 3 PM as example
        
        user_db[user_id]["auth_count"] += 1
        if verify_face(user_db[user_id]["embeddings"], live_embedding):
            print(f"✅ Access Granted: {user_db[user_id]['name']}")
            if is_new_present_day(user_id):
                user_db[user_id]["present_days"] += 1
            write_attendance(user_id, user_db[user_id]["name"], "Granted", late_arrival, early_departure)
            if config["email_notifications_enabled"]:
                print(f"Email notification would be sent for {user_db[user_id]['name']}.")
        else:
            print("❌ Access Denied: Face not recognized.")
            cv2.imwrite(os.path.join(UNAUTHORIZED_FOLDER, f"{timestamp.strftime('%Y-%m-%d_%H-%M-%S')}.jpg"), frame)
            write_attendance(user_id, user_db[user_id]["name"], "Denied", late_arrival, early_departure)
        
        update_user_data()
        load_attendance_data()
    except Exception as e:
        print(f"Error: Face processing failed. {e}")

def calculate_attendance_stats(user_id, start_date, end_date):
    """Calculate attendance stats for a user."""
    if user_id not in attendance_db:
        return {"percentage": 0, "present_days": 0, "late_days": 0, "early_days": 0}
    
    total_days = (datetime.strptime(end_date, "%Y-%m-%d") - datetime.strptime(start_date, "%Y-%m-%d")).days + 1
    present_days = user_db[user_id]["present_days"]
    late_days = sum(1 for entry in attendance_db[user_id] if entry["late_arrival"] and entry["date"] >= start_date and entry["date"] <= end_date)
    early_days = sum(1 for entry in attendance_db[user_id] if entry["early_departure"] and entry["date"] >= start_date and entry["date"] <= end_date)
    
    percentage = (present_days / total_days) * 100 if total_days > 0 else 0
    return {"percentage": percentage, "present_days": present_days, "late_days": late_days, "early_days": early_days}

# ---- Reporting and Dashboard ----
def generate_report():
    """Generate attendance report."""
    if not check_admin():
        return
    start_date = input("Enter start date (YYYY-MM-DD): ")
    end_date = input("Enter end date (YYYY-MM-DD): ")
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        print("Error: Invalid date format.")
        return
    
    print(f"Attendance Report ({start_date} to {end_date}):")
    defaulters = []
    for user_id, data in user_db.items():
        stats = calculate_attendance_stats(user_id, start_date, end_date)
        print(f"{data['name']} (ID: {user_id}): {stats['percentage']:.2f}% present, {stats['present_days']} days, {stats['late_days']} late, {stats['early_days']} early")
        if stats["percentage"] < config["min_attendance_percentage"]:
            defaulters.append(data["name"])
    
    print("Defaulters (<75%):", defaulters)
    print("PDF report generation placeholder.")

def show_dashboard():
    """Display admin dashboard."""
    if not check_admin():
        return
    load_user_data()
    load_attendance_data()
    print(f"Total Enrolled Users: {len(user_db)}")
    print(f"Users with Attendance Records: {len(attendance_db)}")
    
    top_attendees = sorted(user_db.items(), key=lambda x: x[1]["present_days"], reverse=True)[:3]
    print("Top Attendees:")
    for user_id, data in top_attendees:
        print(f" - {data['name']} ({data['present_days']} days)")
    
    absentees = [data["name"] for user_id, data in user_db.items() if user_id not in attendance_db]
    print("Never Present:", absentees)

# ---- Data Management ----
def backup_data():
    """Backup CSV files."""
    if not check_admin():
        return
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    for csv_file in [USER_DATA_CSV, ATTENDANCE_CSV]:
        if os.path.exists(csv_file):
            shutil.copy(csv_file, os.path.join(BACKUP_FOLDER, f"{os.path.basename(csv_file)}_{timestamp}.bak"))
    print("Backup completed.")

def restore_data():
    """Restore from latest backup."""
    if not check_admin():
        return
    backups = [f for f in os.listdir(BACKUP_FOLDER) if f.endswith(".bak")]
    if not backups:
        print("No backups found.")
        return
    latest = max(backups, key=lambda x: os.path.getmtime(os.path.join(BACKUP_FOLDER, x)))
    source = os.path.join(BACKUP_FOLDER, latest)
    dest = USER_DATA_CSV if "user_data" in latest else ATTENDANCE_CSV
    shutil.copy(source, dest)
    print(f"Restored {dest} from {latest}.")
    load_user_data()
    load_attendance_data()

# ---- Main Menu ----
def main():
    """Main menu-driven interface."""
    initialize_csvs()
    load_user_data()
    load_attendance_data()
    camera_warmup_delay = 4  # Default value
    while True:
        print("\n=== Facial Authentication Attendance System ===")
        print("1. Enroll User\n2. Authenticate User\n3. Re-enroll User\n4. Toggle Blacklist\n5. Manual Attendance")
        print("6. Configure System\n7. Generate Report\n8. Show Dashboard\n9. Backup Data\n10. Restore Data\n11. Exit\n12. Change Camera Warmup Delay")
        choice = input("Enter choice: ")
        
        if choice == "1":
            enroll_user()
        elif choice == "2":
            authenticate_user(camera_warmup_delay)
        elif choice == "3":
            re_enroll_user()
        elif choice == "4":
            toggle_blacklist()
        elif choice == "5":
            manual_attendance()
        elif choice == "6":
            configure_system()
        elif choice == "7":
            generate_report()
        elif choice == "8":
            show_dashboard()
        elif choice == "9":
            backup_data()
        elif choice == "10":
            restore_data()
        elif choice == "11":
            print("Exiting...")
            break
        elif choice == "12":
            try:
                new_delay = float(input("Enter new camera warmup delay in seconds (1-5 recommended): "))
                if 0 <= new_delay <= 10:  # Reasonable limits
                    camera_warmup_delay = new_delay
                    print(f"Camera warmup delay updated to {camera_warmup_delay} seconds.")
                else:
                    print("Invalid value. Please enter a number between 0 and 10.")
            except ValueError:
                print("Invalid input. Please enter a number.")
        else:
            print("Invalid choice.")

if __name__ == "__main__":
    main()