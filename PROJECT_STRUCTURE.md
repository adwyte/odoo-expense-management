# Project Structure

This document outlines the organized folder structure of the Odoo Expense Management system.

## 📁 Root Directory Structure

```
odoo-expense-management/
├── 📄 .env                          # Environment variables (copy from .env.example)
├── 📄 .env.example                  # Environment template
├── 📄 .gitignore                    # Git ignore rules
├── 📄 README.md                     # Main project documentation
├── 📄 DATABASE_SETUP.md             # Database setup guide
├── 📄 TEAM_SETUP.md                 # Quick team setup guide
├── 📄 PROJECT_STRUCTURE.md          # This file
├── 📄 start.py                      # Main startup script
├── 🗂️ src/                         # Source code
│   ├── 🗂️ backend/                 # FastAPI backend application
│   └── 🗂️ frontend/                # Next.js frontend application
└── 🗂️ venv/                        # Python virtual environment (created locally)
```

## 🔧 Backend Structure (`src/backend/`)

```
src/backend/
├── 📄 main.py                       # FastAPI application entry point
├── 📄 requirements.txt              # Python dependencies
├── 📄 README.md                     # Backend-specific documentation
├── 📄 alembic.ini                   # Database migration configuration
├── 🗂️ app/                         # Application code
│   ├── 📄 __init__.py
│   ├── 🗂️ api/                     # API layer
│   │   ├── 📄 __init__.py
│   │   └── 🗂️ routers/             # API route modules
│   │       ├── 📄 __init__.py
│   │       ├── 📄 auth.py           # Authentication endpoints
│   │       ├── 📄 users.py          # User management endpoints
│   │       ├── 📄 companies.py     # Company endpoints
│   │       └── 📄 countries.py     # Countries & currencies endpoints
│   ├── 🗂️ models/                  # Database models (SQLAlchemy)
│   │   ├── 📄 __init__.py
│   │   ├── 📄 user.py               # User model
│   │   └── 📄 company.py            # Company model
│   ├── 🗂️ schemas/                 # Data validation schemas (Pydantic)
│   │   ├── 📄 __init__.py
│   │   └── 📄 auth_schemas.py       # Authentication schemas
│   ├── 🗂️ services/                # Business logic services
│   │   ├── 📄 __init__.py
│   │   └── 📄 country_service.py    # Country/currency service
│   └── 🗂️ utils/                   # Utility modules
│       └── 🗂️ app/                 # Application utilities
│           ├── 📄 __init__.py       # FastAPI app factory
│           ├── 📄 config.py         # Configuration management
│           ├── 📄 database.py       # Database connection & session
│           └── 🗂️ utils/           # Authentication utilities
│               ├── 📄 __init__.py
│               └── 📄 auth.py       # JWT token handling
├── 🗂️ alembic/                     # Database migrations (Alembic)
│   ├── 📄 env.py                    # Alembic environment configuration
│   ├── 📄 script.py.mako            # Migration script template
│   ├── 📄 README                    # Alembic documentation
│   └── 🗂️ versions/                # Migration files (auto-generated)
└── 🗂️ scripts/                     # Utility scripts
    ├── 📄 init_db.py                # Legacy database initialization
    ├── 📄 migrate_db.py             # Simple database migration
    ├── 📄 setup_db.py               # Advanced database setup (Alembic)
    ├── 📄 create_migrations.py      # Migration creation utility
    └── 📄 setup.sh                  # Shell setup script
```

## 🎨 Frontend Structure (`src/frontend/`)

```
src/frontend/
├── 📄 package.json                  # Node.js dependencies
├── 📄 package-lock.json             # Dependency lock file
├── 📄 next.config.js                # Next.js configuration
├── 📄 tailwind.config.js            # Tailwind CSS configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 .env.local                    # Frontend environment variables
├── 🗂️ app/                         # Next.js app directory
│   ├── 📄 layout.tsx                # Root layout
│   ├── 📄 page.tsx                  # Home page
│   ├── 📄 globals.css               # Global styles
│   ├── 🗂️ auth/                    # Authentication pages
│   │   ├── 🗂️ signin/              # Sign in page
│   │   │   └── 📄 page.tsx
│   │   └── 🗂️ signup/              # Sign up page
│   │       └── 📄 page.tsx
│   ├── 🗂️ currency-dashboard/      # Currency dashboard
│   │   └── 📄 page.tsx
│   └── 🗂️ admin/                   # Admin pages
├── 🗂️ components/                  # Reusable UI components
│   ├── 📄 theme-provider.tsx        # Theme context provider
│   └── 📄 theme-toggle.tsx          # Dark/light mode toggle
├── 🗂️ lib/                         # Utility libraries
│   ├── 📄 api.ts                    # API service layer
│   └── 📄 utils.ts                  # General utilities
└── 🗂️ public/                      # Static assets
    └── 📄 favicon.ico
```

## 🗄️ Database Structure

### Tables Created:
- **companies**: Company information with currency settings
- **users**: User accounts with role-based access
- **alembic_version**: Migration tracking (Alembic)

### Key Relationships:
- `users.company_id` → `companies.id` (Many-to-One)
- `users.manager_id` → `users.id` (Self-referencing)

## 🚀 Entry Points

### Development Commands:
```bash
# Backend (from project root)
python start.py start                 # Start FastAPI server
python start.py setup-db              # Set up database

# Frontend (from src/frontend)
npm run dev                           # Start Next.js dev server
npm run build                         # Build for production
npm start                            # Start production server

# Database (from src/backend)
python scripts/migrate_db.py setup   # Set up tables
python scripts/migrate_db.py tables  # Check tables
alembic upgrade head                  # Run migrations
```

### Production Deployment:
```bash
# Backend
cd src/backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
cd src/frontend
npm run build
npm start
```

## 📦 Dependencies

### Backend Dependencies (`src/backend/requirements.txt`):
- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **sqlalchemy**: ORM
- **alembic**: Database migrations
- **psycopg2-binary**: PostgreSQL adapter
- **python-jose**: JWT handling
- **passlib**: Password hashing
- **httpx**: HTTP client for external APIs
- **pycountry**: Country data

### Frontend Dependencies (`src/frontend/package.json`):
- **next**: React framework
- **react**: UI library
- **typescript**: Type safety
- **tailwindcss**: CSS framework
- **shadcn/ui**: UI components

## 🔧 Configuration Files

### Environment Files:
- **Root `.env`**: Main environment variables (database, secrets)
- **Frontend `.env.local`**: Frontend-specific variables (API URLs)

### Configuration Files:
- **`alembic.ini`**: Database migration settings
- **`next.config.js`**: Next.js build configuration
- **`tailwind.config.js`**: CSS framework settings
- **`tsconfig.json`**: TypeScript compiler options

## 🗂️ Key Features by Directory

### `/src/backend/app/api/routers/`:
- **Authentication**: Signup, login, JWT management
- **User Management**: CRUD operations with role-based access
- **Company Management**: Company info and statistics
- **Currency Integration**: Real-time exchange rates

### `/src/backend/app/services/`:
- **Country Service**: REST Countries API integration
- **Exchange Rate Service**: Currency conversion API

### `/src/frontend/app/`:
- **Authentication UI**: Signup/signin forms
- **Currency Dashboard**: Real-time exchange rates display
- **Admin Interface**: User and company management

## 🔗 API Integration

### External APIs:
- **REST Countries**: https://restcountries.com/v3.1/all
- **Exchange Rates**: https://api.exchangerate-api.com/v4/latest/

### Internal APIs:
- **Backend API**: http://localhost:8000/api/*
- **Frontend**: http://localhost:3000

This organized structure promotes:
- ✅ **Clear separation of concerns**
- ✅ **Easy navigation and maintenance**
- ✅ **Scalable architecture**
- ✅ **Team collaboration**
- ✅ **Professional development workflow**