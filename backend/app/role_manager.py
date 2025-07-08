from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from .auth import admin_required

bp = Blueprint('role_manager', __name__, url_prefix='/api')

@bp.route('/role-manager', methods=['GET', 'POST'])
@jwt_required()
@admin_required
def role_manager():
    if request.method == 'GET':
        roles = list(current_app.mongo.db.roles.find())
        for r in roles:
            r['_id'] = str(r['_id'])
        return jsonify(roles)
    else:
        data = request.json
        current_app.mongo.db.roles.update_one({'role': data['role']}, {'$set': data}, upsert=True)
        return jsonify({'msg': 'Role updated'}) 