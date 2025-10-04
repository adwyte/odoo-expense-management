#!/usr/bin/env python3
"""
Simple database migration setup for team collaboration
"""
import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def create_migration_script():
    """Create a simple migration management script"""
    
    migration_script = """#!/usr/bin/env python3
'''
Database Migration Script for Odoo Expense Management
Run this script to set up the database for new team members
'''
import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
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
        print("\\n💡 Troubleshooting tips:")
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
"""
    
    return migration_script

def create_team_setup_guide():
    """Create a simple setup guide for team members"""
    
    setup_guide = """# Quick Database Setup for Team Members

## 🚀 Getting Started (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/adwyte/odoo-expense-management.git
cd odoo-expense-management
```

### 2. Create Environment File
```bash
cp .env.example .env
```

Edit `.env` with your database details:
```env
DATABASE_URL=postgresql://username:password@localhost/your_database_name
SECRET_KEY=your-secret-key-here
```

### 3. Install Python Dependencies
```bash
# Create virtual environment (if not exists)
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Set Up Database
```bash
# Create PostgreSQL database
createdb your_database_name

# Set up tables
python migrate_db.py setup
```

### 5. Start Application
```bash
# Backend
python main.py

# Frontend (new terminal)
cd src/frontend
npm install
npm run dev
```

## 🔧 Database Commands

```bash
# Set up database tables
python migrate_db.py setup

# Check existing tables
python migrate_db.py tables

# Show help
python migrate_db.py help
```

## 🆘 Troubleshooting

### "Database connection failed"
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database exists: `psql -l`
- Check .env file has correct DATABASE_URL

### "Permission denied"
- Ensure database user has permissions:
  ```sql
  GRANT ALL PRIVILEGES ON DATABASE your_db TO your_user;
  ```

### "ModuleNotFoundError"
- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

## 📊 Current Database Schema

**Tables:**
- `companies` - Company information with currency settings
- `users` - User accounts with role-based access
- `alembic_version` - Migration tracking (future use)

**Test the setup:**
- Visit: http://localhost:3000/auth/signup
- Create a company account
- Check pgAdmin to see your data

## 🔄 For Developers

When you make model changes:
1. Update models in `src/backend/app/models/`
2. Run `python migrate_db.py setup` to recreate tables
3. Test your changes
4. Commit and push changes

---
**Need help? Check the main README.md or ask the team!**
"""
    
    return setup_guide

def main():
    """Create migration files"""
    print("🔧 Creating database migration files...")
    
    # Create migration script
    migrate_script = create_migration_script()
    with open("migrate_db.py", "w") as f:
        f.write(migrate_script)
    
    # Make it executable
    os.chmod("migrate_db.py", 0o755)
    
    # Create setup guide
    setup_guide = create_team_setup_guide()
    with open("TEAM_SETUP.md", "w") as f:
        f.write(setup_guide)
    
    print("✅ Created migration files:")
    print("  - migrate_db.py (database setup script)")
    print("  - TEAM_SETUP.md (team setup guide)")
    print()
    print("🚀 Test the migration:")
    print("  python migrate_db.py setup")

if __name__ == '__main__':
    main()