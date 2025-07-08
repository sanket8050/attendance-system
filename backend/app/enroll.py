from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from .auth import admin_required
from .models import create_user, ROLES
import base64
from .utils import base64_to_image, get_face_embedding
from flask_limiter import Limiter

bp = Blueprint('enroll', __name__, url_prefix='/api')

@bp.route('/enroll', methods=['POST'])
@jwt_required()
@admin_required
@current_app.limiter.limit('10/minute')
def enroll():
    try:
        data = request.json
        required = ['first_name', 'last_name', 'user_id', 'email', 'role', 'department', 'faces', 'password']
        if not all(k in data for k in required):
            current_app.logger.warning(f"Enroll failed: missing fields {data}")
            return jsonify({'msg': 'Missing fields'}), 400
        if data['role'] not in ROLES:
            current_app.logger.warning(f"Enroll failed: invalid role {data['role']}")
            return jsonify({'msg': 'Invalid role'}), 400
        # Extract embeddings from 3 base64 images
        embeddings = []
        for face_b64 in data['faces']:
            img = base64_to_image(face_b64)
            emb = get_face_embedding(img)
            embeddings.append(emb)
        user = {
            'user_id': data['user_id'],
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'email': data['email'],
            'role': data['role'],
            'department': data['department'],
            'embeddings': embeddings,
            'password': data['password']
        }
        create_user(user)
        current_app.logger.info(f"User enrolled: {user['user_id']}")
        return jsonify({'msg': 'User enrolled successfully'})
    except Exception as e:
        current_app.logger.error(f"Enroll error: {e}")
        return jsonify({'msg': 'Enrollment failed', 'error': str(e)}), 500 