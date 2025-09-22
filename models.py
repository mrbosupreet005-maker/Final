from database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
import enum

class UserType(enum.Enum):
    PATIENT = "patient"
    PRACTITIONER = "practitioner"
    ADMIN = "admin"

class Gender(enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class DoshaType(enum.Enum):
    VATA = "vata"
    PITTA = "pitta"
    KAPHA = "kapha"
    MIXED = "mixed"

class SessionStatus(enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class ProgramStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"

class NotificationType(enum.Enum):
    REMINDER = "reminder"
    ALERT = "alert"
    INFO = "info"
    PRECAUTION = "precaution"
    FEEDBACK = "feedback"

class NotificationPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class EnergyLevel(enum.Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    GOOD = "good"
    EXCELLENT = "excellent"

class SleepQuality(enum.Enum):
    POOR = "poor"
    FAIR = "fair"
    GOOD = "good"
    VERY_GOOD = "very_good"
    EXCELLENT = "excellent"

class Mood(enum.Enum):
    VERY_POOR = "very_poor"
    POOR = "poor"
    NEUTRAL = "neutral"
    GOOD = "good"
    EXCELLENT = "excellent"

class StressLevel(enum.Enum):
    VERY_HIGH = "very_high"
    HIGH = "high"
    MODERATE = "moderate"
    LOW = "low"
    VERY_LOW = "very_low"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.Enum(Gender))
    user_type = db.Column(db.Enum(UserType), nullable=False)
    profile_image = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = db.relationship('Patient', backref='user', uselist=False, cascade='all, delete-orphan')
    practitioner = db.relationship('Practitioner', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_token(self):
        return create_access_token(identity=self.id, additional_claims={'user_type': self.user_type.value})
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender.value if self.gender else None,
            'user_type': self.user_type.value,
            'profile_image': self.profile_image,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    medical_history = db.Column(db.Text)
    allergies = db.Column(db.Text)
    current_medications = db.Column(db.Text)
    emergency_contact_name = db.Column(db.String(100))
    emergency_contact_phone = db.Column(db.String(20))
    dosha_type = db.Column(db.Enum(DoshaType), default=DoshaType.MIXED)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    programs = db.relationship('PatientProgram', backref='patient', lazy='dynamic')
    sessions = db.relationship('Session', backref='patient', lazy='dynamic')
    wellness_logs = db.relationship('WellnessLog', backref='patient', lazy='dynamic')
    feedback = db.relationship('Feedback', backref='patient', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'medical_history': self.medical_history,
            'allergies': self.allergies,
            'current_medications': self.current_medications,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'dosha_type': self.dosha_type.value if self.dosha_type else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Practitioner(db.Model):
    __tablename__ = 'practitioners'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    license_number = db.Column(db.String(100))
    specialization = db.Column(db.String(200))
    experience_years = db.Column(db.Integer, default=0)
    bio = db.Column(db.Text)
    consultation_fee = db.Column(db.Numeric(10, 2))
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    programs = db.relationship('PatientProgram', backref='practitioner', lazy='dynamic')
    sessions = db.relationship('Session', backref='practitioner', lazy='dynamic')
    feedback = db.relationship('Feedback', backref='practitioner', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'license_number': self.license_number,
            'specialization': self.specialization,
            'experience_years': self.experience_years,
            'bio': self.bio,
            'consultation_fee': float(self.consultation_fee) if self.consultation_fee else None,
            'is_available': self.is_available,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class TreatmentType(db.Model):
    __tablename__ = 'treatment_types'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    duration_minutes = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    program_treatments = db.relationship('ProgramTreatment', backref='treatment_type', lazy='dynamic')
    sessions = db.relationship('Session', backref='treatment_type', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'duration_minutes': self.duration_minutes,
            'price': float(self.price) if self.price else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class TreatmentProgram(db.Model):
    __tablename__ = 'treatment_programs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    total_sessions = db.Column(db.Integer, nullable=False)
    duration_weeks = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    program_treatments = db.relationship('ProgramTreatment', backref='program', lazy='dynamic')
    patient_programs = db.relationship('PatientProgram', backref='program', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'total_sessions': self.total_sessions,
            'duration_weeks': self.duration_weeks,
            'total_price': float(self.total_price) if self.total_price else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class ProgramTreatment(db.Model):
    __tablename__ = 'program_treatments'
    
    id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('treatment_programs.id'), nullable=False)
    treatment_id = db.Column(db.Integer, db.ForeignKey('treatment_types.id'), nullable=False)
    session_order = db.Column(db.Integer, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'program_id': self.program_id,
            'treatment_id': self.treatment_id,
            'session_order': self.session_order
        }

class PatientProgram(db.Model):
    __tablename__ = 'patient_programs'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('treatment_programs.id'), nullable=False)
    practitioner_id = db.Column(db.Integer, db.ForeignKey('practitioners.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    status = db.Column(db.Enum(ProgramStatus), default=ProgramStatus.ACTIVE)
    progress_percentage = db.Column(db.Numeric(5, 2), default=0.00)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'program_id': self.program_id,
            'practitioner_id': self.practitioner_id,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status.value if self.status else None,
            'progress_percentage': float(self.progress_percentage) if self.progress_percentage else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    practitioner_id = db.Column(db.Integer, db.ForeignKey('practitioners.id'), nullable=False)
    treatment_id = db.Column(db.Integer, db.ForeignKey('treatment_types.id'), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('treatment_programs.id'))
    scheduled_date = db.Column(db.Date, nullable=False)
    scheduled_time = db.Column(db.Time, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Enum(SessionStatus), default=SessionStatus.SCHEDULED)
    notes = db.Column(db.Text)
    preparation_instructions = db.Column(db.Text)
    post_session_notes = db.Column(db.Text)
    rating = db.Column(db.Integer)
    feedback = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'practitioner_id': self.practitioner_id,
            'treatment_id': self.treatment_id,
            'program_id': self.program_id,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'scheduled_time': self.scheduled_time.strftime('%H:%M') if self.scheduled_time else None,
            'duration_minutes': self.duration_minutes,
            'status': self.status.value if self.status else None,
            'notes': self.notes,
            'preparation_instructions': self.preparation_instructions,
            'post_session_notes': self.post_session_notes,
            'rating': self.rating,
            'feedback': self.feedback,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class WellnessLog(db.Model):
    __tablename__ = 'wellness_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    log_date = db.Column(db.Date, nullable=False)
    energy_level = db.Column(db.Enum(EnergyLevel), nullable=False)
    sleep_quality = db.Column(db.Enum(SleepQuality), nullable=False)
    mood = db.Column(db.Enum(Mood), nullable=False)
    stress_level = db.Column(db.Enum(StressLevel), nullable=False)
    symptoms = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('patient_id', 'log_date', name='unique_patient_date'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'log_date': self.log_date.isoformat() if self.log_date else None,
            'energy_level': self.energy_level.value if self.energy_level else None,
            'sleep_quality': self.sleep_quality.value if self.sleep_quality else None,
            'mood': self.mood.value if self.mood else None,
            'stress_level': self.stress_level.value if self.stress_level else None,
            'symptoms': self.symptoms,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.Enum(NotificationType), nullable=False)
    priority = db.Column(db.Enum(NotificationPriority), default=NotificationPriority.MEDIUM)
    is_read = db.Column(db.Boolean, default=False)
    scheduled_for = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type.value if self.type else None,
            'priority': self.priority.value if self.priority else None,
            'is_read': self.is_read,
            'scheduled_for': self.scheduled_for.isoformat() if self.scheduled_for else None,
            'created_at': self.created_at.isoformat()
        }

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    practitioner_id = db.Column(db.Integer, db.ForeignKey('practitioners.id'))
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'))
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    is_anonymous = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'practitioner_id': self.practitioner_id,
            'session_id': self.session_id,
            'rating': self.rating,
            'comment': self.comment,
            'is_anonymous': self.is_anonymous,
            'created_at': self.created_at.isoformat()
        }

# Customer Reviews and Testimonials
class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255))
    rating = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200))
    comment = db.Column(db.Text, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    is_featured = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.CheckConstraint('rating >= 1 AND rating <= 5', name='check_review_rating_range'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'is_verified': self.is_verified,
            'is_featured': self.is_featured,
            'is_approved': self.is_approved,
            'created_at': self.created_at.isoformat()
        }

# Blog and Articles System
class Article(db.Model):
    __tablename__ = 'articles'
    
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(250), unique=True, nullable=False)
    excerpt = db.Column(db.Text)
    content = db.Column(db.Text, nullable=False)
    featured_image = db.Column(db.String(500))
    category = db.Column(db.String(100))
    tags = db.Column(db.Text)  # JSON string of tags
    status = db.Column(db.String(20), default='draft')  # draft, published, archived
    view_count = db.Column(db.Integer, default=0)
    is_featured = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'author_id': self.author_id,
            'title': self.title,
            'slug': self.slug,
            'excerpt': self.excerpt,
            'content': self.content,
            'featured_image': self.featured_image,
            'category': self.category,
            'tags': self.tags,
            'status': self.status,
            'view_count': self.view_count,
            'is_featured': self.is_featured,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Contact Form Submissions
class ContactSubmission(db.Model):
    __tablename__ = 'contact_submissions'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='new')  # new, read, replied, closed
    is_urgent = db.Column(db.Boolean, default=False)
    replied_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'subject': self.subject,
            'message': self.message,
            'status': self.status,
            'is_urgent': self.is_urgent,
            'replied_at': self.replied_at.isoformat() if self.replied_at else None,
            'created_at': self.created_at.isoformat()
        }

# Newsletter Subscriptions
class NewsletterSubscription(db.Model):
    __tablename__ = 'newsletter_subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    subscribed_at = db.Column(db.DateTime, default=datetime.utcnow)
    unsubscribed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'is_active': self.is_active,
            'subscribed_at': self.subscribed_at.isoformat(),
            'unsubscribed_at': self.unsubscribed_at.isoformat() if self.unsubscribed_at else None
        }

# Payment and Billing System
class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'))
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='USD')
    payment_method = db.Column(db.String(50))  # card, bank_transfer, cash, etc.
    payment_status = db.Column(db.String(20), default='pending')  # pending, completed, failed, refunded
    transaction_id = db.Column(db.String(100))
    payment_gateway = db.Column(db.String(50))  # stripe, paypal, etc.
    paid_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'amount': float(self.amount) if self.amount else None,
            'currency': self.currency,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'transaction_id': self.transaction_id,
            'payment_gateway': self.payment_gateway,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'created_at': self.created_at.isoformat()
        }

# Appointment Booking System
class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    practitioner_id = db.Column(db.Integer, db.ForeignKey('practitioners.id'), nullable=False)
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    duration_minutes = db.Column(db.Integer, default=60)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, confirmed, completed, cancelled, no_show
    appointment_type = db.Column(db.String(50))  # consultation, follow_up, emergency
    notes = db.Column(db.Text)
    reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'practitioner_id': self.practitioner_id,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'appointment_time': self.appointment_time.strftime('%H:%M') if self.appointment_time else None,
            'duration_minutes': self.duration_minutes,
            'status': self.status,
            'appointment_type': self.appointment_type,
            'notes': self.notes,
            'reason': self.reason,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# FAQ System
class FAQ(db.Model):
    __tablename__ = 'faqs'
    
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'category': self.category,
            'order': self.order,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Website Analytics
class PageView(db.Model):
    __tablename__ = 'page_views'
    
    id = db.Column(db.Integer, primary_key=True)
    page_url = db.Column(db.String(500), nullable=False)
    page_title = db.Column(db.String(200))
    user_agent = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    referrer = db.Column(db.String(500))
    session_id = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    viewed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'page_url': self.page_url,
            'page_title': self.page_title,
            'user_agent': self.user_agent,
            'ip_address': self.ip_address,
            'referrer': self.referrer,
            'session_id': self.session_id,
            'user_id': self.user_id,
            'viewed_at': self.viewed_at.isoformat()
        }

# Schedule Reviews - Enhanced review system for sessions
class ScheduleReview(db.Model):
    __tablename__ = 'schedule_reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    practitioner_id = db.Column(db.Integer, db.ForeignKey('practitioners.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    title = db.Column(db.String(200))
    comment = db.Column(db.Text)
    treatment_rating = db.Column(db.Integer)  # Separate rating for treatment quality
    practitioner_rating = db.Column(db.Integer)  # Separate rating for practitioner
    facility_rating = db.Column(db.Integer)  # Separate rating for facility
    is_anonymous = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        db.CheckConstraint('rating >= 1 AND rating <= 5', name='check_schedule_rating_range'),
        db.CheckConstraint('treatment_rating >= 1 AND treatment_rating <= 5', name='check_treatment_rating_range'),
        db.CheckConstraint('practitioner_rating >= 1 AND practitioner_rating <= 5', name='check_practitioner_rating_range'),
        db.CheckConstraint('facility_rating >= 1 AND facility_rating <= 5', name='check_facility_rating_range'),
        db.UniqueConstraint('session_id', 'patient_id', name='unique_session_patient_review')
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'patient_id': self.patient_id,
            'practitioner_id': self.practitioner_id,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'treatment_rating': self.treatment_rating,
            'practitioner_rating': self.practitioner_rating,
            'facility_rating': self.facility_rating,
            'is_anonymous': self.is_anonymous,
            'is_approved': self.is_approved,
            'is_featured': self.is_featured,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Enhanced Schedule Management
class ScheduleTemplate(db.Model):
    __tablename__ = 'schedule_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    practitioner_id = db.Column(db.Integer, db.ForeignKey('practitioners.id'), nullable=False)
    treatment_id = db.Column(db.Integer, db.ForeignKey('treatment_types.id'), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2))
    is_recurring = db.Column(db.Boolean, default=False)
    recurring_pattern = db.Column(db.String(50))  # daily, weekly, monthly
    max_advance_days = db.Column(db.Integer, default=30)
    min_advance_hours = db.Column(db.Integer, default=24)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'practitioner_id': self.practitioner_id,
            'treatment_id': self.treatment_id,
            'duration_minutes': self.duration_minutes,
            'price': float(self.price) if self.price else None,
            'is_recurring': self.is_recurring,
            'recurring_pattern': self.recurring_pattern,
            'max_advance_days': self.max_advance_days,
            'min_advance_hours': self.min_advance_hours,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Patient Symptoms Tracking
class PatientSymptom(db.Model):
    __tablename__ = 'patient_symptoms'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    symptom_name = db.Column(db.String(200), nullable=False)
    severity = db.Column(db.Integer, nullable=False)  # 1-10 scale
    description = db.Column(db.Text)
    duration_days = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True)
    first_noticed = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.CheckConstraint('severity >= 1 AND severity <= 10', name='check_severity_range'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'symptom_name': self.symptom_name,
            'severity': self.severity,
            'description': self.description,
            'duration_days': self.duration_days,
            'is_active': self.is_active,
            'first_noticed': self.first_noticed.isoformat(),
            'last_updated': self.last_updated.isoformat(),
            'created_at': self.created_at.isoformat()
        }

# Session Activities and Notes
class SessionActivity(db.Model):
    __tablename__ = 'session_activities'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)  # started, paused, resumed, completed, notes
    notes = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'activity_type': self.activity_type,
            'notes': self.notes,
            'timestamp': self.timestamp.isoformat(),
            'created_by': self.created_by
        }

# Session Rescheduling
class SessionReschedule(db.Model):
    __tablename__ = 'session_reschedules'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    original_date = db.Column(db.Date, nullable=False)
    original_time = db.Column(db.Time, nullable=False)
    new_date = db.Column(db.Date, nullable=False)
    new_time = db.Column(db.Time, nullable=False)
    reason = db.Column(db.Text)
    requested_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    approved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'original_date': self.original_date.isoformat(),
            'original_time': self.original_time.strftime('%H:%M'),
            'new_date': self.new_date.isoformat(),
            'new_time': self.new_time.strftime('%H:%M'),
            'reason': self.reason,
            'requested_by': self.requested_by,
            'status': self.status,
            'approved_by': self.approved_by,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'created_at': self.created_at.isoformat()
        }

# Website Settings
class SiteSetting(db.Model):
    __tablename__ = 'site_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text)
    description = db.Column(db.Text)
    setting_type = db.Column(db.String(20), default='text')  # text, number, boolean, json
    is_public = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value,
            'description': self.description,
            'setting_type': self.setting_type,
            'is_public': self.is_public,
            'updated_at': self.updated_at.isoformat()
        }
