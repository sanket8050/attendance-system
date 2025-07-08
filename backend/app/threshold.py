from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from .auth import admin_required

bp = Blueprint('threshold', __name__, url_prefix='/api')

@bp.route('/threshold-settings', methods=['POST'])
@jwt_required()
@admin_required
def threshold_settings():
    data = request.json
    settings = {}
    for k in ['similarity_threshold', 'grace_period', 'min_attendance_percentage']:
        if k in data:
            settings[k] = data[k]
    current_app.mongo.db.settings.update_one({}, {'$set': settings}, upsert=True)
    return jsonify({'msg': 'Settings updated'}) 