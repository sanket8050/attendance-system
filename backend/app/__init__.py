from flask import Flask
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
import logging
from logging.config import fileConfig
from . import auth, enroll, attendance, reports, manual_attendance, threshold, role_manager, analytics, settings, live_feed
import os
from flask_cors import CORS
from .models import create_indexes

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Logging
    fileConfig(os.path.join(os.path.dirname(__file__), '../logging.conf'))

    # MongoDB
    mongo = PyMongo(app)
    app.mongo = mongo

    # JWT
    jwt = JWTManager(app)

    # SocketIO
    socketio = SocketIO(app, cors_allowed_origins="*")
    app.socketio = socketio

    # Rate Limiter
    limiter = Limiter(app, key_func=get_remote_address)

    # CORS
    CORS(app, supports_credentials=True)

    # Mail
    mail = Mail(app)
    app.mail = mail

    # Register Blueprints
    app.register_blueprint(auth.bp)
    app.register_blueprint(enroll.bp)
    app.register_blueprint(attendance.bp)
    app.register_blueprint(reports.bp)
    app.register_blueprint(manual_attendance.bp)
    app.register_blueprint(threshold.bp)
    app.register_blueprint(role_manager.bp)
    app.register_blueprint(analytics.bp)
    app.register_blueprint(settings.bp)
    app.register_blueprint(live_feed.bp)

    # Create DB indexes
    with app.app_context():
        create_indexes()

    # Error handler
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Server Error: {error}")
        return {"msg": "Internal server error"}, 500

    return app 