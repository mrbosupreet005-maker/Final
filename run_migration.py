#!/usr/bin/env python3
"""
Simple migration runner for AyurSutra
"""

import os
import sys
from flask import Flask
from flask_migrate import upgrade, init, migrate, stamp
from app import app, db
from models import *

def main():
    """Run migrations"""
    print("🔄 Running AyurSutra Database Migrations...")
    
    try:
        with app.app_context():
            # Check if migrations directory exists
            if not os.path.exists('migrations'):
                print("📁 Creating migrations directory...")
                init()
            
            # Create migration for all models
            print("📝 Creating migration...")
            migrate(message="Add all tables and models")
            
            # Apply migrations
            print("⬆️  Applying migrations...")
            upgrade()
            
            # Stamp as current
            print("🏷️  Stamping database...")
            stamp()
            
            print("✅ Migrations completed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
