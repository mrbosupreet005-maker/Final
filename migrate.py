#!/usr/bin/env python3
"""
Database migration script for AyurSutra
This script handles database migrations and updates
"""

import os
import sys
from flask import Flask
from flask_migrate import Migrate, upgrade, init, migrate, stamp
from app import app, db
from models import *

def init_migration():
    """Initialize migration repository"""
    try:
        print("🔄 Initializing migration repository...")
        init()
        print("✅ Migration repository initialized")
        return True
    except Exception as e:
        print(f"❌ Error initializing migration: {e}")
        return False

def create_migration(message="Initial migration"):
    """Create a new migration"""
    try:
        print(f"🔄 Creating migration: {message}")
        migrate(message=message)
        print("✅ Migration created successfully")
        return True
    except Exception as e:
        print(f"❌ Error creating migration: {e}")
        return False

def run_migration():
    """Run all pending migrations"""
    try:
        print("🔄 Running migrations...")
        upgrade()
        print("✅ Migrations completed successfully")
        return True
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

def stamp_head():
    """Mark current database as up to date"""
    try:
        print("🔄 Stamping database as current...")
        stamp()
        print("✅ Database stamped as current")
        return True
    except Exception as e:
        print(f"❌ Error stamping database: {e}")
        return False

def main():
    """Main migration function"""
    print("🚀 Starting AyurSutra Database Migration...")
    print("=" * 50)
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("⚠️  .env file not found. Please copy env.example to .env and configure your database settings.")
        return False
    
    try:
        with app.app_context():
            # Initialize migration if not exists
            if not os.path.exists('migrations'):
                if not init_migration():
                    return False
            
            # Create initial migration
            if not create_migration("Initial migration with all tables"):
                return False
            
            # Run migrations
            if not run_migration():
                return False
            
            # Stamp as current
            if not stamp_head():
                return False
            
            print("=" * 50)
            print("🎉 Database migration completed successfully!")
            print("\nNext steps:")
            print("1. Run: python app.py")
            print("2. Open: http://localhost:5000")
            print("3. Your database is ready!")
            
            return True
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
