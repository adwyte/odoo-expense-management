#!/usr/bin/env python3
'''
Database Migration Script for Odoo Expense Management
Run this script to set up the database for new team members
'''
import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

def setup_database():
    '''Set up database tables'''
    try:
        from src.backend.app.utils.app.database import engine, Base
        from src.backend.app.models.user import User
        from src.backend.app.models.company import Company
        
        print("🏗️  Setting up database tables...")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print("✅ Database setup completed successfully!")
        print(f"📋 Created tables: {', '.join(tables)}")
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("✅ Database connection verified!")
            
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("\n💡 Troubleshooting tips:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check your .env file has correct DATABASE_URL")
        print("3. Ensure the database exists: createdb your_database_name")
        print("4. Check database permissions")
        return False

def show_tables():
    '''Show existing tables'''
    try:
        from src.backend.app.utils.app.database import engine
        from sqlalchemy import inspect
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if tables:
            print(f"📋 Existing tables: {', '.join(tables)}")
            for table in tables:
                columns = inspector.get_columns(table)
                print(f"  {table}: {len(columns)} columns")
        else:
            print("No tables found. Run setup first.")
            
    except Exception as e:
        print(f"❌ Error checking tables: {e}")

if __name__ == '__main__':
    print("🚀 Odoo Expense Management - Database Migration")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "setup":
            setup_database()
        elif command == "tables":
            show_tables()
        elif command == "help":
            print("Available commands:")
            print("  setup  - Create database tables")
            print("  tables - Show existing tables")
            print("  help   - Show this help")
        else:
            print(f"Unknown command: {command}")
            print("Use 'help' to see available commands")
    else:
        # Default: run setup
        setup_database()
