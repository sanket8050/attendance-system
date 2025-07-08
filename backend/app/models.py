from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# User roles
ROLES = ["Admin", "Student", "Faculty", "Employee", "Security"]

# User model helpers
def create_user(user):
    user["password"] = generate_password_hash(user["password"])
    user["created_at"] = datetime.utcnow()
    return current_app.mongo.db.users.insert_one(user)

def find_user_by_id(user_id):
    return current_app.mongo.db.users.find_one({"user_id": user_id})

def create_indexes():
    current_app.mongo.db.users.create_index("user_id", unique=True)
    current_app.mongo.db.attendance.create_index([("user_id", 1), ("timestamp", -1)]) 