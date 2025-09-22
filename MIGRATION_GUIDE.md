# Database Migration Guide

## 🗄️ AyurSutra Database Migration

This guide explains how to handle database migrations for the AyurSutra project.

## 📋 What Are Migrations?

Database migrations are version-controlled changes to your database schema. They allow you to:
- Track database changes over time
- Apply changes consistently across environments
- Rollback changes if needed
- Collaborate with team members

## 🚀 Quick Start

### Automatic Migration (Recommended)
```bash
# Run the startup script (includes migration)
start.bat          # Windows
./start.sh         # Linux/Mac
```

### Manual Migration
```bash
cd backend
python run_migration.py
```

## 🔧 Migration Commands

### Initialize Migrations (First Time)
```bash
flask db init
```

### Create Migration
```bash
flask db migrate -m "Description of changes"
```

### Apply Migrations
```bash
flask db upgrade
```

### Rollback Migration
```bash
flask db downgrade
```

### Check Migration Status
```bash
flask db current
flask db history
```

## 📊 Current Database Schema

### Core Tables
- `users` - User accounts and authentication
- `patients` - Patient medical information
- `practitioners` - Practitioner credentials
- `sessions` - Therapy session scheduling
- `treatment_programs` - Treatment packages
- `treatment_types` - Individual treatments

### Feature Tables
- `wellness_logs` - Daily wellness tracking
- `notifications` - System notifications
- `feedback` - Session feedback
- `reviews` - Customer testimonials
- `articles` - Blog content
- `contact_submissions` - Contact form data
- `newsletter_subscriptions` - Email marketing
- `payments` - Payment tracking
- `appointments` - Appointment booking
- `faqs` - FAQ system
- `page_views` - Website analytics
- `site_settings` - Website configuration

## 🔄 Migration Workflow

### 1. Development
```bash
# Make changes to models.py
# Create migration
flask db migrate -m "Add new feature"

# Apply migration
flask db upgrade
```

### 2. Production
```bash
# Apply all pending migrations
flask db upgrade
```

### 3. Rollback (if needed)
```bash
# Rollback to previous version
flask db downgrade

# Rollback to specific revision
flask db downgrade <revision_id>
```

## ⚠️ Important Notes

### Before Running Migrations
1. **Backup your database** (especially in production)
2. **Test migrations** in development first
3. **Review migration files** before applying
4. **Coordinate with team** for production deployments

### Migration Files
- Located in `migrations/versions/`
- Each migration has a unique ID
- Contains both upgrade and downgrade functions
- Never edit existing migration files

## 🐛 Troubleshooting

### Common Issues

#### Migration Already Exists
```bash
# If migration already exists, use different message
flask db migrate -m "Add new feature v2"
```

#### Database Connection Error
```bash
# Check .env file configuration
# Ensure database server is running
# Verify credentials
```

#### Migration Conflicts
```bash
# Merge conflicting migrations
flask db merge -m "Merge conflicting migrations"
```

### Reset Database (Development Only)
```bash
# WARNING: This will delete all data
rm -rf migrations/
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## 📈 Best Practices

### 1. Always Test Migrations
- Test in development environment first
- Verify data integrity after migration
- Test rollback procedures

### 2. Use Descriptive Messages
```bash
# Good
flask db migrate -m "Add user profile picture field"

# Bad
flask db migrate -m "Update"
```

### 3. Keep Migrations Small
- One logical change per migration
- Easier to debug and rollback
- Better for team collaboration

### 4. Backup Before Production
```bash
# Always backup before production migrations
mysqldump -u username -p database_name > backup.sql
```

## 🔍 Monitoring Migrations

### Check Current Status
```bash
flask db current
```

### View Migration History
```bash
flask db history
```

### Show Migration Details
```bash
flask db show <revision_id>
```

## 📞 Support

If you encounter issues with migrations:

1. Check the error message carefully
2. Verify database connection
3. Check migration files for syntax errors
4. Review this guide for common solutions
5. Contact the development team

---

**Remember: Migrations are powerful tools. Always test thoroughly and backup your data!** 🚀
