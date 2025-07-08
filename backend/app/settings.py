from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from .auth import admin_required

bp = Blueprint('settings', __name__, url_prefix='/api')

@bp.route('/settings', methods=['POST'])
@jwt_required()
@admin_required
def settings():
    data = request.json
    for k in ['geo_fencing', 'email_alerts']:
        if k in data:
            current_app.mongo.db.settings.update_one({}, {'$set': {k: data[k]}}, upsert=True)
    return jsonify({'msg': 'Settings updated'}) 