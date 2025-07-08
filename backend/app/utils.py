import base64
import numpy as np
import cv2
from deepface import DeepFace
from geopy.distance import geodesic

# Convert base64 string to OpenCV image
def base64_to_image(base64_string):
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

# Extract face embedding using DeepFace
def get_face_embedding(img):
    embedding = DeepFace.represent(img_path = img, model_name = 'ArcFace', enforce_detection = False)[0]['embedding']
    return embedding

# Compare two embeddings (cosine similarity)
def compare_embeddings(emb1, emb2):
    from scipy.spatial.distance import cosine
    return 1 - cosine(emb1, emb2)

# Geo-fencing check
def is_within_geofence(user_location, allowed_location, radius_m=100):
    # user_location, allowed_location: (lat, lon)
    distance = geodesic(user_location, allowed_location).meters
    return distance <= radius_m 