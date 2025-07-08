from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required
from .auth import admin_required
import pandas as pd
import io
from datetime import datetime
from reportlab.pdfgen import canvas

bp = Blueprint('reports', __name__, url_prefix='/api')

@bp.route('/reports', methods=['GET'])
@jwt_required()
@admin_required
def reports():
    # Filters: date range, role, location
    args = request.args
    query = {}
    if 'role' in args:
        query['role'] = args['role']
    if 'location' in args:
        query['location'] = args['location']
    if 'start' in args and 'end' in args:
        query['timestamp'] = {'$gte': args['start'], '$lte': args['end']}
    records = list(current_app.mongo.db.attendance.find(query))
    for r in records:
        r['_id'] = str(r['_id'])
    # Export
    export = args.get('export')
    if export == 'csv':
        df = pd.DataFrame(records)
        buf = io.StringIO()
        df.to_csv(buf, index=False)
        buf.seek(0)
        return send_file(io.BytesIO(buf.getvalue().encode()), mimetype='text/csv', as_attachment=True, download_name='report.csv')
    elif export == 'pdf':
        buf = io.BytesIO()
        c = canvas.Canvas(buf)
        c.drawString(100, 800, "Attendance Report")
        y = 780
        for r in records:
            c.drawString(100, y, str(r))
            y -= 20
        c.save()
        buf.seek(0)
        return send_file(buf, mimetype='application/pdf', as_attachment=True, download_name='report.pdf')
    return jsonify(records) 