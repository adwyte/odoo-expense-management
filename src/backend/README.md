# Backend - Odoo Expense Management API

FastAPI-based backend for the Odoo Expense Management system with authentication, user management, and currency support.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL
- Virtual environment (recommended)

### Setup
```bash
# Navigate to backend directory
cd src/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../../.env.example ../../.env
# Edit .env with your database credentials

# Set up database
python scripts/migrate_db.py setup

# Start the server
python main.py
```

The API will be available at: http://localhost:8000

## 📁 Directory Structure

```
src/backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── alembic.ini            # Database migration configuration
├── app/                   # Application code
│   ├── api/              # API routes
│   │   └── routers/      # Route modules
│   │       ├── auth.py   # Authentication routes
│   │       ├── users.py  # User management routes
│   │       ├── companies.py      # Company routes
│   │       └── countries.py      # Countries & currencies
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py       # User model
│   │   └── company.py    # Company model
│   ├── schemas/          # Pydantic schemas
│   │   └── auth_schemas.py
│   ├── services/         # Business logic services
│   │   └── country_service.py    # Country/currency service
│   └── utils/            # Utilities
│       └── app/          # App utilities
│           ├── __init__.py       # FastAPI app factory
│           ├── config.py         # Configuration
│           ├── database.py       # Database setup
│           └── auth.py           # Authentication utilities
├── alembic/              # Database migrations
│   ├── env.py           # Alembic environment
│   ├── script.py.mako   # Migration template
│   └── versions/        # Migration files
└── scripts/             # Utility scripts
    ├── init_db.py       # Legacy database initialization
    ├── migrate_db.py    # Simple database migration
    ├── setup_db.py      # Advanced database setup
    ├── create_migrations.py  # Migration creation utility
    └── setup.sh         # Shell setup script
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Company and admin user registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/` - List users (admin/manager only)
- `POST /api/users/` - Create new user
- `GET /api/users/{user_id}` - Get user details
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user

### Companies
- `GET /api/companies/me` - Get current user's company
- `PUT /api/companies/me` - Update company details
- `GET /api/companies/stats` - Company statistics

### Countries & Currencies
- `GET /api/countries/countries` - List all countries with currencies
- `GET /api/countries/exchange-rates/{currency}` - Get exchange rates
- `GET /api/countries/exchange-rates` - Get USD exchange rates

## 🗄️ Database Management

### Quick Setup
```bash
# Set up database tables
python scripts/migrate_db.py setup

# Check existing tables
python scripts/migrate_db.py tables

# Show help
python scripts/migrate_db.py help
```

### Advanced Migrations (Alembic)
```bash
# Create new migration
alembic revision --autogenerate -m "Migration message"

# Run migrations
alembic upgrade head

# Check current revision
alembic current
```

## ⚙️ Configuration

Environment variables (in root `.env` file):
```env
# Database
DATABASE_URL=postgresql://username:password@localhost/database_name

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30
```

## 🧪 Testing

```bash
# Test API endpoints
curl http://localhost:8000/health
curl http://localhost:8000/docs  # API documentation

# Test database connection
python scripts/migrate_db.py tables
```

## 📊 Features

- **JWT Authentication** with role-based access (admin, manager, employee)
- **User Management** with company-based organization
- **Currency Support** with real-time exchange rates
- **Country Integration** with 247+ countries
- **API Documentation** with FastAPI auto-generated docs
- **Database Migrations** with Alembic support
- **CORS Configuration** for frontend integration

## 🔗 Related

- **Frontend**: `../frontend/` - Next.js application
- **Documentation**: `../../DATABASE_SETUP.md` - Database setup guide
- **Team Setup**: `../../TEAM_SETUP.md` - Quick start for team members

## 🆘 Troubleshooting

### Common Issues

1. **Import errors**: Ensure you're in the virtual environment
2. **Database connection**: Check DATABASE_URL in .env
3. **Port conflicts**: Default port is 8000, change in main.py if needed
4. **Migration issues**: Run `python scripts/migrate_db.py setup`

### Getting Help

- Check API docs: http://localhost:8000/docs
- Review logs in terminal output
- Verify database setup with pgAdmin
- Check environment variables in .env file