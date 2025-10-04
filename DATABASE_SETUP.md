# Database Setup & Migration Guide

This guide explains how to set up the database for the Odoo Expense Management system, including how your team members can clone and set up their own database instances.

## 🗄️ Database Schema

The system uses PostgreSQL with the following tables:
- **companies**: Company information with currency settings
- **users**: User accounts with role-based access
- **alembic_version**: Migration tracking

## 🚀 Quick Setup (For New Team Members)

### 1. Clone the Repository
```bash
git clone https://github.com/adwyte/odoo-expense-management.git
cd odoo-expense-management
```

### 2. Install Dependencies
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://your_username:your_password@localhost/your_database_name
SECRET_KEY=your-secret-key-here
```

### 4. Set Up PostgreSQL Database
```bash
# Create database (using psql)
createdb your_database_name

# Or using SQL
psql -c "CREATE DATABASE your_database_name;"
```

### 5. Run Database Setup
```bash
# This will create migrations and set up all tables
python setup_db.py
```

### 6. Start the Application
```bash
# Backend (FastAPI)
python main.py

# Frontend (Next.js) - in another terminal
cd src/frontend
npm install
npm run dev
```

## 🔧 Database Management Commands

### Initial Setup
```bash
# Set up database with migrations
python setup_db.py
```

### Migration Commands
```bash
# Run pending migrations
python setup_db.py migrate

# Check migration status
python setup_db.py status

# Create new migration (after model changes)
python setup_db.py new "Add new table or field"
```

### Manual Alembic Commands
```bash
cd src/backend

# Create new migration
alembic revision --autogenerate -m "Migration message"

# Run migrations
alembic upgrade head

# Check current revision
alembic current

# Show migration history
alembic history --verbose

# Downgrade to previous revision
alembic downgrade -1
```

## 🏗️ Development Workflow

### When You Make Model Changes:
1. **Modify models** in `src/backend/app/models/`
2. **Create migration**: `python setup_db.py new "Describe your changes"`
3. **Review migration** file in `src/backend/alembic/versions/`
4. **Run migration**: `python setup_db.py migrate`
5. **Commit changes** including the new migration file

### When You Pull Changes:
1. **Pull latest code**: `git pull origin main`
2. **Run migrations**: `python setup_db.py migrate`
3. **Start application**: `python main.py`

## 📁 Project Structure

```
odoo-expense-management/
├── .env                          # Environment variables (create from .env.example)
├── .env.example                  # Environment template
├── setup_db.py                   # Database setup script
├── init_db.py                    # Legacy database creation (for reference)
├── main.py                       # Application entry point
├── requirements.txt              # Python dependencies
├── src/backend/
│   ├── alembic.ini              # Alembic configuration
│   ├── alembic/
│   │   ├── env.py               # Alembic environment setup
│   │   ├── script.py.mako       # Migration template
│   │   └── versions/            # Migration files (auto-generated)
│   └── app/
│       ├── models/              # SQLAlchemy models
│       │   ├── user.py
│       │   └── company.py
│       ├── utils/app/
│       │   ├── database.py      # Database configuration
│       │   └── config.py        # Application settings
│       └── api/routers/         # API endpoints
└── src/frontend/                # Next.js frontend
```

## 🔒 Database Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost/database_name

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30
```

### PostgreSQL Setup Examples

#### Local Development:
```env
DATABASE_URL=postgresql://postgres:password@localhost/odoo_expense_db
```

#### Production:
```env
DATABASE_URL=postgresql://odoo_user:secure_password123@localhost/odoo_expense_db
```

## 🚨 Troubleshooting

### Common Issues:

1. **"ModuleNotFoundError"**
   ```bash
   # Ensure you're in the virtual environment
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **"Database connection failed"**
   ```bash
   # Check PostgreSQL is running
   sudo systemctl status postgresql
   
   # Check database exists
   psql -l
   ```

3. **"Alembic command not found"**
   ```bash
   # Install alembic in virtual environment
   pip install alembic
   ```

4. **"Permission denied for table"**
   ```bash
   # Ensure database user has proper permissions
   psql -c "GRANT ALL PRIVILEGES ON DATABASE your_db TO your_user;"
   ```

### Reset Database (Development Only):
```bash
# WARNING: This will delete all data!
python init_db.py  # Use the reset function
```

## 🔄 Migration Best Practices

1. **Always review** generated migration files before running
2. **Test migrations** on a copy of production data
3. **Backup database** before running migrations in production
4. **Never edit** existing migration files, create new ones
5. **Include migration files** in version control

## 🌐 Team Collaboration

### For New Features:
1. Create feature branch: `git checkout -b feature/new-table`
2. Make model changes
3. Generate migration: `python setup_db.py new "Add new feature table"`
4. Test migration locally
5. Commit and push: `git add . && git commit -m "feat: Add new table"`
6. Create pull request

### For Database Updates:
1. Pull latest changes: `git pull origin main`
2. Run migrations: `python setup_db.py migrate`
3. Verify tables: Check pgAdmin or run `python setup_db.py status`

## 📚 Additional Resources

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [FastAPI Database Guide](https://fastapi.tiangolo.com/tutorial/sql-databases/)

## 🆘 Getting Help

If you encounter issues:
1. Check this README first
2. Look at existing migration files for examples
3. Check the application logs
4. Ask the team for help with database-specific issues

---

**Happy coding! 🚀**