from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from .auth import admin_required
from datetime import datetime
from .utils import base64_to_image, get_face_embedding, compare_embeddings, is_within_geofence
from flask_limiter import Limiter
from flask_mail import Message

bp = Blueprint('attendance', __name__, url_prefix='/api')

@bp.route('/authenticate', methods=['POST'])
@jwt_required()
@current_app.limiter.limit('30/minute')
def authenticate():
    try:
        data = request.json
        user_id = data.get('user_id')
        face_img = data.get('face')
        location = data.get('location')  # (lat, lon)
        user = current_app.mongo.db.users.find_one({'user_id': user_id})
        if not user:
            current_app.logger.warning(f"Auth failed: user not found {user_id}")
            return jsonify({'msg': 'User not found'}), 404
        img = base64_to_image(face_img)
        live_emb = get_face_embedding(img)
        # Compare to all stored embeddings
        scores = [compare_embeddings(e, live_emb) for e in user['embeddings']]
        confidence = max(scores)
        threshold = current_app.mongo.db.settings.find_one({}).get('similarity_threshold', 0.5)
        status = 'Present' if confidence >= threshold else 'Absent'
        # Geo-fencing
        geo_enabled = current_app.mongo.db.settings.find_one({}).get('geo_fencing', False)
        allowed_location = current_app.mongo.db.settings.find_one({}).get('allowed_location', None)
        geo_ok = True
        if geo_enabled and allowed_location and location:
            geo_ok = is_within_geofence(tuple(location), tuple(allowed_location))
            if not geo_ok:
                status = 'Absent'
        result = {
            'status': status,
            'confidence': round(confidence * 100, 2),
            'location': location,
            'timestamp': datetime.utcnow().isoformat()
        }
        # Save attendance
        current_app.mongo.db.attendance.insert_one({
            'user_id': user_id,
            'status': result['status'],
            'confidence': result['confidence'],
            'location': result['location'],
            'timestamp': result['timestamp']
        })
        current_app.logger.info(f"Auth: {user_id} status={status} confidence={result['confidence']}")
        # Email alert for late/absent
        settings = current_app.mongo.db.settings.find_one({})
        if settings.get('email_alerts', False) and status in ['Absent', 'Late']:
            try:
                msg = Message(
                    subject=f"Attendance Alert: {status}",
                    recipients=[user['email']],
                    body=f"Dear {user['first_name']},\n\nYour attendance status is: {status}.\nTime: {result['timestamp']}\nLocation: {result['location']}\nConfidence: {result['confidence']}%\n\nIf this is incorrect, please contact admin."
                )
                current_app.mail.send(msg)
                current_app.logger.info(f"Email alert sent to {user['email']} for {status}")
            except Exception as e:
                current_app.logger.error(f"Email alert error: {e}")
        return jsonify(result)
    except Exception as e:
        current_app.logger.error(f"Auth error: {e}")
        return jsonify({'msg': 'Authentication failed', 'error': str(e)}), 500

@bp.route('/manual-attendance', methods=['POST'])
@jwt_required()
@admin_required
def manual_attendance():
    data = request.json
    required = ['user_id', 'status']
    if not all(k in data for k in required):
        return jsonify({'msg': 'Missing fields'}), 400
    record = {
        'user_id': data['user_id'],
        'status': data['status'],
        'late': data.get('late', False),
        'early': data.get('early', False),
        'timestamp': datetime.utcnow().isoformat(),
        'manual': True
    }
    current_app.mongo.db.attendance.insert_one(record)
    return jsonify({'msg': 'Attendance marked manually'}) 