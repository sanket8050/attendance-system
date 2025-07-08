import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/gym_face')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret')
    JWT_ACCESS_TOKEN_EXPIRES = 3600
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    RATELIMIT_DEFAULT = '100/hour'
    SOCKETIO_MESSAGE_QUEUE = os.environ.get('SOCKETIO_MESSAGE_QUEUE') 