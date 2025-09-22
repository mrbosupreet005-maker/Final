#!/usr/bin/env python3
"""
Database setup script for AyurSutra
This script creates the database and initializes it with sample data
"""

import os
import sys
import pymysql
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to MySQL server
        connection = pymysql.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Create database
        db_name = os.getenv('DB_NAME', 'ayursutra_db')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✅ Database '{db_name}' created successfully")
        
        cursor.close()
        connection.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def create_tables():
    """Create all tables using Flask-Migrate"""
    try:
        from app import app, db
        
        with app.app_context():
            # Create all tables
            db.create_all()
            print("✅ All tables created successfully")
            
            # Insert sample data
            insert_sample_data()
            
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def insert_sample_data():
    """Insert sample data for testing"""
    try:
        from database import db
        from models import User, Patient, Practitioner, TreatmentType, TreatmentProgram, ProgramTreatment, PatientProgram, Session, WellnessLog, Notification, Feedback, Review, Article, ContactSubmission, NewsletterSubscription, SiteSetting, FAQ, PageView, UserType, Gender, DoshaType, SessionStatus, ProgramStatus, NotificationType, NotificationPriority, EnergyLevel, SleepQuality, Mood, StressLevel
        
        # Check if data already exists
        if User.query.first():
            print("ℹ️  Sample data already exists, skipping...")
            return
        
        print("📝 Inserting sample data...")
        
        # Create sample treatment types
        treatment_types = [
            TreatmentType(
                name="Abhyanga (Oil Massage)",
                description="Traditional Ayurvedic full-body oil massage",
                duration_minutes=60,
                price=150.00
            ),
            TreatmentType(
                name="Shirodhara",
                description="Continuous pouring of warm oil on the forehead",
                duration_minutes=45,
                price=200.00
            ),
            TreatmentType(
                name="Panchakarma",
                description="Five-fold detoxification therapy",
                duration_minutes=120,
                price=500.00
            ),
            TreatmentType(
                name="Yoga Therapy",
                description="Therapeutic yoga session",
                duration_minutes=90,
                price=100.00
            )
        ]
        
        for treatment in treatment_types:
            db.session.add(treatment)
        
        # Create sample treatment programs
        programs = [
            TreatmentProgram(
                name="Stress Relief Program",
                description="Comprehensive program for stress management",
                total_sessions=8,
                duration_weeks=4,
                total_price=1200.00
            ),
            TreatmentProgram(
                name="Digestive Health Program",
                description="Program focused on improving digestive health",
                total_sessions=6,
                duration_weeks=3,
                total_price=900.00
            ),
            TreatmentProgram(
                name="Sleep Improvement Program",
                description="Program to improve sleep quality and patterns",
                total_sessions=10,
                duration_weeks=5,
                total_price=1500.00
            )
        ]
        
        for program in programs:
            db.session.add(program)
        
        db.session.commit()
        
        # Create sample users
        # Admin user
        admin_user = User(
            email="admin@ayursutra.com",
            first_name="Admin",
            last_name="User",
            phone="+1234567890",
            user_type=UserType.ADMIN
        )
        admin_user.set_password("admin123")
        db.session.add(admin_user)
        
        # Practitioner user
        practitioner_user = User(
            email="dr.smith@ayursutra.com",
            first_name="Dr. Sarah",
            last_name="Smith",
            phone="+1234567891",
            date_of_birth="1980-05-15",
            gender=Gender.FEMALE,
            user_type=UserType.PRACTITIONER
        )
        practitioner_user.set_password("practitioner123")
        db.session.add(practitioner_user)
        db.session.flush()
        
        practitioner = Practitioner(
            user_id=practitioner_user.id,
            license_number="AYU123456",
            specialization="Stress Management, Digestive Health",
            experience_years=15,
            bio="Experienced Ayurvedic practitioner with 15 years of experience",
            consultation_fee=150.00,
            is_available=True
        )
        db.session.add(practitioner)
        
        # Patient user
        patient_user = User(
            email="john.doe@example.com",
            first_name="John",
            last_name="Doe",
            phone="+1234567892",
            date_of_birth="1990-08-20",
            gender=Gender.MALE,
            user_type=UserType.PATIENT
        )
        patient_user.set_password("patient123")
        db.session.add(patient_user)
        db.session.flush()
        
        patient = Patient(
            user_id=patient_user.id,
            medical_history="Mild anxiety, occasional headaches",
            allergies="None known",
            current_medications="None",
            emergency_contact_name="Jane Doe",
            emergency_contact_phone="+1234567893",
            dosha_type=DoshaType.VATA
        )
        db.session.add(patient)
        
        db.session.commit()
        
        # Create sample patient program
        patient_program = PatientProgram(
            patient_id=patient.id,
            program_id=programs[0].id,  # Stress Relief Program
            practitioner_id=practitioner.id,
            start_date="2024-01-01",
            status=ProgramStatus.ACTIVE,
            progress_percentage=25.0,
            notes="Patient showing good progress"
        )
        db.session.add(patient_program)
        
        # Create sample session
        from datetime import datetime, timedelta
        tomorrow = datetime.now().date() + timedelta(days=1)
        
        sample_session = Session(
            patient_id=patient.id,
            practitioner_id=practitioner.id,
            treatment_id=treatment_types[0].id,  # Abhyanga
            program_id=programs[0].id,
            scheduled_date=tomorrow,
            scheduled_time="10:00",
            duration_minutes=60,
            status=SessionStatus.SCHEDULED,
            notes="First session of stress relief program",
            preparation_instructions="Please arrive 15 minutes early and avoid heavy meals 2 hours before"
        )
        db.session.add(sample_session)
        
        # Create sample wellness log
        wellness_log = WellnessLog(
            patient_id=patient.id,
            log_date=datetime.now().date(),
            energy_level=EnergyLevel.MODERATE,
            sleep_quality=SleepQuality.GOOD,
            mood=Mood.GOOD,
            stress_level=StressLevel.MODERATE,
            symptoms="Slight tension in shoulders",
            notes="Feeling better after yesterday's session"
        )
        db.session.add(wellness_log)
        
        # Create sample notification
        notification = Notification(
            user_id=patient_user.id,
            title="Session Reminder",
            message="Your Abhyanga session is scheduled for tomorrow at 10:00 AM",
            type=NotificationType.REMINDER,
            priority=NotificationPriority.MEDIUM
        )
        db.session.add(notification)
        
        # Create sample feedback
        feedback = Feedback(
            patient_id=patient.id,
            practitioner_id=practitioner.id,
            session_id=sample_session.id,
            rating=5,
            comment="Excellent session, very relaxing and professional",
            is_anonymous=False
        )
        db.session.add(feedback)
        
        # Create sample reviews
        sample_reviews = [
            Review(
                user_id=patient_user.id,
                name="John Doe",
                email="john.doe@example.com",
                rating=5,
                title="Amazing Panchakarma Experience",
                comment="The treatment was incredible. I felt completely rejuvenated and the staff was very professional.",
                is_verified=True,
                is_featured=True,
                is_approved=True
            ),
            Review(
                user_id=None,
                name="Sarah Johnson",
                email="sarah.j@email.com",
                rating=5,
                title="Life-changing therapy",
                comment="After just 3 sessions, I noticed significant improvements in my overall well-being. Highly recommended!",
                is_verified=False,
                is_featured=True,
                is_approved=True
            ),
            Review(
                user_id=None,
                name="Michael Chen",
                email="m.chen@email.com",
                rating=4,
                title="Great service",
                comment="Professional staff and clean facilities. The treatment helped with my stress levels.",
                is_verified=False,
                is_featured=False,
                is_approved=True
            )
        ]
        
        for review in sample_reviews:
            db.session.add(review)
        
        # Create sample articles
        sample_articles = [
            Article(
                author_id=practitioner_user.id,
                title="Understanding Panchakarma: The Complete Guide",
                slug="understanding-panchakarma-complete-guide",
                excerpt="Learn about the ancient Ayurvedic practice of Panchakarma and its benefits for modern health.",
                content="Panchakarma is one of the most important and well-known treatments in Ayurveda...",
                category="Ayurveda",
                tags='["panchakarma", "ayurveda", "detox", "wellness"]',
                status="published",
                is_featured=True,
                published_at=datetime.utcnow()
            ),
            Article(
                author_id=practitioner_user.id,
                title="5 Daily Habits for Better Health",
                slug="5-daily-habits-better-health",
                excerpt="Simple daily practices that can significantly improve your health and well-being.",
                content="Incorporating these simple habits into your daily routine can make a big difference...",
                category="Wellness",
                tags='["health", "habits", "wellness", "lifestyle"]',
                status="published",
                is_featured=False,
                published_at=datetime.utcnow()
            )
        ]
        
        for article in sample_articles:
            db.session.add(article)
        
        # Create sample FAQs
        sample_faqs = [
            FAQ(
                question="What is Panchakarma?",
                answer="Panchakarma is a comprehensive Ayurvedic detoxification and rejuvenation therapy that involves five main procedures to cleanse the body of toxins and restore balance.",
                category="General",
                order=1,
                is_active=True
            ),
            FAQ(
                question="How long does a typical treatment take?",
                answer="The duration varies depending on the specific treatment, but most individual sessions last 60-90 minutes. Complete programs can range from 1-4 weeks.",
                category="Treatment",
                order=2,
                is_active=True
            ),
            FAQ(
                question="Do I need to prepare anything before my session?",
                answer="Yes, we recommend avoiding heavy meals 2-3 hours before your session, staying hydrated, and wearing comfortable clothing. Specific preparation instructions will be provided when you book.",
                category="Preparation",
                order=3,
                is_active=True
            ),
            FAQ(
                question="Is Panchakarma safe for everyone?",
                answer="While Panchakarma is generally safe, it's important to consult with our practitioners first, especially if you have any medical conditions or are pregnant.",
                category="Safety",
                order=4,
                is_active=True
            )
        ]
        
        for faq in sample_faqs:
            db.session.add(faq)
        
        # Create sample contact submissions
        sample_contacts = [
            ContactSubmission(
                name="Emma Wilson",
                email="emma.wilson@email.com",
                phone="+1234567894",
                subject="Inquiry about treatment packages",
                message="Hi, I'm interested in learning more about your treatment packages. Could you please send me more information?",
                status="new",
                is_urgent=False
            ),
            ContactSubmission(
                name="David Brown",
                email="david.brown@email.com",
                subject="Urgent: Need to reschedule appointment",
                message="I need to reschedule my appointment for tomorrow due to an emergency. Please call me back as soon as possible.",
                status="new",
                is_urgent=True
            )
        ]
        
        for contact in sample_contacts:
            db.session.add(contact)
        
        # Create sample newsletter subscriptions
        sample_subscriptions = [
            NewsletterSubscription(
                email="newsletter@example.com",
                name="Newsletter Subscriber",
                is_active=True
            ),
            NewsletterSubscription(
                email="wellness@email.com",
                name="Wellness Enthusiast",
                is_active=True
            )
        ]
        
        for subscription in sample_subscriptions:
            db.session.add(subscription)
        
        # Create sample site settings
        sample_settings = [
            SiteSetting(
                key="site_name",
                value="AyurSutra Panchakarma Center",
                description="Website name",
                setting_type="text",
                is_public=True
            ),
            SiteSetting(
                key="contact_email",
                value="info@ayursutra.com",
                description="Main contact email",
                setting_type="text",
                is_public=True
            ),
            SiteSetting(
                key="contact_phone",
                value="+1 (555) 123-4567",
                description="Main contact phone",
                setting_type="text",
                is_public=True
            ),
            SiteSetting(
                key="address",
                value="123 Wellness Street, Health City, HC 12345",
                description="Business address",
                setting_type="text",
                is_public=True
            ),
            SiteSetting(
                key="opening_hours",
                value="Mon-Fri: 8AM-6PM, Sat: 9AM-4PM, Sun: Closed",
                description="Business hours",
                setting_type="text",
                is_public=True
            )
        ]
        
        for setting in sample_settings:
            db.session.add(setting)
        
        db.session.commit()
        
        print("✅ Sample data inserted successfully")
        print("\n📋 Sample Login Credentials:")
        print("Admin: admin@ayursutra.com / admin123")
        print("Practitioner: dr.smith@ayursutra.com / practitioner123")
        print("Patient: john.doe@example.com / patient123")
        print("\n🌟 New Features Added:")
        print("✅ Customer Reviews & Testimonials")
        print("✅ Blog & Articles System")
        print("✅ Contact Form Management")
        print("✅ Newsletter Subscriptions")
        print("✅ FAQ System")
        print("✅ Payment Tracking")
        print("✅ Appointment Booking")
        print("✅ Website Analytics")
        print("✅ Site Settings Management")
        
    except Exception as e:
        print(f"❌ Error inserting sample data: {e}")
        db.session.rollback()

def main():
    """Main setup function"""
    print("🚀 Setting up AyurSutra Database...")
    print("=" * 50)
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("⚠️  .env file not found. Please copy env.example to .env and configure your database settings.")
        return False
    
    # Create database
    if not create_database():
        return False
    
    # Create tables and insert sample data
    if not create_tables():
        return False
    
    print("=" * 50)
    print("🎉 Database setup completed successfully!")
    print("\nNext steps:")
    print("1. Run: python app.py")
    print("2. Open: http://localhost:5000")
    print("3. Start using the application!")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
