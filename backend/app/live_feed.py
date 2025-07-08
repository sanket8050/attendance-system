from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required
from .auth import admin_required
from flask_socketio import emit

bp = Blueprint('live_feed', __name__, url_prefix='/api')

@bp.route('/live-feed', methods=['GET'])
@jwt_required()
@admin_required
def live_feed():
    # Return last 20 attendance records
    records = list(current_app.mongo.db.attendance.find().sort('timestamp', -1).limit(20))
    for r in records:
        r['_id'] = str(r['_id'])
    return jsonify(records)

def register_socketio(socketio):
    @socketio.on('connect')
    def handle_connect():
        emit('message', {'msg': 'Connected to live feed'})
    @socketio.on('attendance_update')
    def handle_attendance_update(data):
        emit('attendance_update', data, broadcast=True) 