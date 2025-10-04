#!/usr/bin/env python3
"""
Database setup and migration management script
"""
import os
import sys
import subprocess
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from src.backend.app.utils.app.database import engine, Base
from src.backend.app.utils.app.config import settings

# Import all models to ensure they're registered
from src.backend.app.models.user import User
from src.backend.app.models.company import Company

def check_database_connection():
    """Test database connection"""
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def setup_alembic():
    """Initialize Alembic for the first time"""
    print("🔧 Setting up Alembic migrations...")
    
    # Change to backend directory
    backend_dir = project_root / "src" / "backend"
    os.chdir(backend_dir)
    
    try:
        # Generate initial migration
        print("📝 Creating initial migration...")
        result = subprocess.run([
            "alembic", "revision", "--autogenerate", 
            "-m", "Initial migration: users and companies tables"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Initial migration created successfully!")
            print(f"Migration file: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ Failed to create migration: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error setting up Alembic: {e}")
        return False

def run_migrations():
    """Run pending migrations"""
    print("🚀 Running database migrations...")
    
    backend_dir = project_root / "src" / "backend"
    os.chdir(backend_dir)
    
    try:
        # Run migrations
        result = subprocess.run([
            "alembic", "upgrade", "head"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migrations completed successfully!")
            print(result.stdout)
            return True
        else:
            print(f"❌ Migration failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

def show_migration_status():
    """Show current migration status"""
    print("📊 Checking migration status...")
    
    backend_dir = project_root / "src" / "backend"
    os.chdir(backend_dir)
    
    try:
        # Show current revision
        result = subprocess.run([
            "alembic", "current"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Current revision:")
            print(result.stdout)
        
        # Show migration history
        result = subprocess.run([
            "alembic", "history", "--verbose"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Migration history:")
            print(result.stdout)
            
    except Exception as e:
        print(f"❌ Error checking status: {e}")

def create_new_migration(message: str):
    """Create a new migration file"""
    print(f"📝 Creating new migration: {message}")
    
    backend_dir = project_root / "src" / "backend"
    os.chdir(backend_dir)
    
    try:
        result = subprocess.run([
            "alembic", "revision", "--autogenerate", "-m", message
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migration created successfully!")
            print(result.stdout)
            return True
        else:
            print(f"❌ Failed to create migration: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating migration: {e}")
        return False

def main():
    """Main setup function"""
    print("🏗️  Odoo Expense Management - Database Setup")
    print("=" * 50)
    
    # Check database connection
    if not check_database_connection():
        print("\n❌ Please check your database configuration and try again.")
        return False
    
    print(f"\n📡 Database URL: {settings.database_url}")
    
    # Check if this is first-time setup
    backend_dir = project_root / "src" / "backend" / "alembic" / "versions"
    
    if not backend_dir.exists() or not list(backend_dir.glob("*.py")):
        print("\n🆕 First-time setup detected. Creating initial migration...")
        if not setup_alembic():
            return False
    
    # Run migrations
    if not run_migrations():
        return False
    
    # Show status
    show_migration_status()
    
    print("\n" + "=" * 50)
    print("✅ Database setup completed successfully!")
    print("\n📖 Next steps for your team:")
    print("1. Clone the repository")
    print("2. Set up their .env file with database credentials")
    print("3. Run: python setup_db.py")
    print("4. Start the application: python main.py")
    
    return True

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "migrate":
            run_migrations()
        elif command == "status":
            show_migration_status()
        elif command == "new":
            if len(sys.argv) > 2:
                create_new_migration(sys.argv[2])
            else:
                print("Usage: python setup_db.py new 'migration message'")
        else:
            print("Available commands: migrate, status, new")
    else:
        main()