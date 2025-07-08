from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .models import find_user_by_id
from werkzeug.security import check_password_hash

bp = Blueprint('auth', __name__, url_prefix='/api')

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = find_user_by_id(data.get('user_id'))
    if not user or not check_password_hash(user['password'], data.get('password')):
        return jsonify({'msg': 'Invalid credentials'}), 401
    access_token = create_access_token(identity={"user_id": user['user_id'], "role": user['role']})
    return jsonify(access_token=access_token)

def admin_required(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        identity = get_jwt_identity()
        if identity.get('role') != 'Admin':
            return jsonify({'msg': 'Admins only'}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper 