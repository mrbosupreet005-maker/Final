from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Try MySQL first, fallback to SQLite
try:
    if os.getenv('DB_PASSWORD'):
        app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'ayursutra_db')}"
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ayursutra.db'
except:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ayursutra.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 7)))
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 5242880))

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Configure migration directory
migrate.init_app(app, db, directory='migrations')

# Configure CORS
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=CORS_ORIGINS, supports_credentials=True)

# Import routes
from routes.auth import auth_bp
from routes.users import users_bp
from routes.patients import patients_bp
from routes.practitioners import practitioners_bp
from routes.sessions import sessions_bp
from routes.programs import programs_bp
from routes.wellness import wellness_bp
from routes.notifications import notifications_bp
from routes.feedback import feedback_bp
from routes.dashboard import dashboard_bp
from routes.reviews import reviews_bp
from routes.articles import articles_bp
from routes.contact import contact_bp
from routes.newsletter import newsletter_bp
from routes.faq import faq_bp
from routes.schedule_reviews import schedule_reviews_bp
from routes.session_management import session_management_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(patients_bp, url_prefix='/api/patients')
app.register_blueprint(practitioners_bp, url_prefix='/api/practitioners')
app.register_blueprint(sessions_bp, url_prefix='/api/sessions')
app.register_blueprint(programs_bp, url_prefix='/api/programs')
app.register_blueprint(wellness_bp, url_prefix='/api/wellness')
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
app.register_blueprint(feedback_bp, url_prefix='/api/feedback')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
app.register_blueprint(articles_bp, url_prefix='/api/articles')
app.register_blueprint(contact_bp, url_prefix='/api/contact')
app.register_blueprint(newsletter_bp, url_prefix='/api/newsletter')
app.register_blueprint(faq_bp, url_prefix='/api/faq')
app.register_blueprint(schedule_reviews_bp, url_prefix='/api/schedule')
app.register_blueprint(session_management_bp, url_prefix='/api/session-management')

# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'OK',
        'message': 'AyurSutra API is running',
        'version': '1.0.0'
    })

# Serve frontend files
@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Internal server error'}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'success': False, 'message': 'Bad request'}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'success': False, 'message': 'Unauthorized'}), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({'success': False, 'message': 'Forbidden'}), 403

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'success': False, 'message': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'success': False, 'message': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'success': False, 'message': 'Authorization token required'}), 401

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
