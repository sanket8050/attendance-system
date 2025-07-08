from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required
from .auth import admin_required
import pandas as pd

bp = Blueprint('analytics', __name__, url_prefix='/api')

@bp.route('/analytics', methods=['GET'])
@jwt_required()
@admin_required
def analytics():
    records = list(current_app.mongo.db.attendance.find())
    df = pd.DataFrame(records)
    # Trends, top attendees, average time
    trends = df.groupby('timestamp').size().to_dict() if not df.empty else {}
    top_attendees = df['user_id'].value_counts().head(5).to_dict() if not df.empty else {}
    avg_time = df['timestamp'].mean() if not df.empty else None
    return jsonify({'trends': trends, 'top_attendees': top_attendees, 'avg_time': str(avg_time)}) 