#!/usr/bin/env python3
"""
Database initialization script for Odoo Expense Management (FastAPI)
"""
import sys
from src.backend.app.utils.app.database import engine, Base

# Import models to ensure tables are created
from src.backend.app.models.user import User
from src.backend.app.models.company import Company


def init_database():
    """Initialize the database with tables"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Print table information
        print("\n📋 Created tables:")
        from sqlalchemy import inspect
        inspector = inspect(engine)
        for table_name in inspector.get_table_names():
            print(f"  - {table_name}")
            
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

    return True

def reset_database():
    """Reset the database (drop and recreate all tables)"""
    try:
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        print("🗑️  Dropped all existing tables")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database reset successfully!")
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        return False

    return True

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'reset':
        print("🔄 Resetting database...")
        reset_database()
    else:
        print("🚀 Initializing database...")
        init_database()