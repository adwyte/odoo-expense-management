# Odoo Expense Management - Authentication & User Management (FastAPI)

This application provides a comprehensive authentication and user management system for an Odoo-style expense management platform built with **FastAPI**.

## Features

### Authentication System
- **First-time Signup**: Creates both company and admin user automatically
- **Company Setup**: Auto-detects currency based on country selection
- **JWT Authentication**: Secure token-based authentication with python-jose
- **Role-based Access Control**: Admin, Manager, and Employee roles
- **Interactive API Documentation**: Automatic OpenAPI/Swagger docs

### User Management
- **Admin Capabilities**:
  - Create employees and managers
  - Assign and change user roles
  - Define manager-employee relationships
  - View company statistics
  - Deactivate users

- **Manager Capabilities**:
  - View and manage subordinates
  - Update employee information (limited)

- **Employee Capabilities**:
  - View own profile
  - Change password
 
*Video Link*: https://drive.google.com/file/d/188EFTg4r43LoR6lHXRl9fcKkI3Y9wxVK/view?usp=sharing

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with python-jose
- **Password Hashing**: bcrypt via passlib
- **Validation**: Pydantic models
- **Documentation**: Automatic OpenAPI/Swagger UI
- **Server**: Uvicorn ASGI server

## Database Schema

### Companies Table
- `id` (UUID): Primary key
- `name`: Company name
- `email`: Company email (unique)
- `phone`: Company phone number
- `address`: Company address
- `country_code`: ISO 3166-1 alpha-2 country code
- `currency_code`: ISO 4217 currency code (auto-set based on country)
- `is_active`: Active status
- `created_at`, `updated_at`: Timestamps

### Users Table
- `id` (UUID): Primary key
- `email`: User email (unique)
- `password_hash`: bcrypt hashed password
- `first_name`, `last_name`: User names
- `role`: admin, manager, or employee
- `is_active`: Active status
- `company_id`: Foreign key to companies table
- `manager_id`: Self-referencing foreign key for hierarchy
- `created_at`, `updated_at`: Timestamps

## API Endpoints

### Authentication
- `POST /api/auth/signup` - First-time signup (creates company + admin)
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### User Management
- `GET /api/users/` - List users (admin/managers)
- `POST /api/users/` - Create user (admin only)
- `PUT /api/users/{id}` - Update user (admin/managers)
- `DELETE /api/users/{id}` - Deactivate user (admin only)
- `PUT /api/users/change-password` - Change password
- `GET /api/users/managers` - List managers (admin only)

### Company
- `GET /api/companies/me` - Get company info
- `GET /api/companies/stats` - Get company statistics (admin only)

### Documentation
- `GET /docs` - Interactive Swagger UI
- `GET /redoc` - ReDoc documentation
- `GET /` - API information
- `GET /health` - Health check

## Setup Instructions

### 1. Environment Setup
```bash
# Clone repository (already done)
cd odoo-expense-management

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup
```bash
# Install PostgreSQL (if not already installed)
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE odoo_expense_db;
CREATE USER odoo_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE odoo_expense_db TO odoo_user;
\q
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
nano .env
```

Update the `.env` file with:
```
DATABASE_URL=postgresql://odoo_user:secure_password@localhost/odoo_expense_db
SECRET_KEY=your-very-secure-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30
```

### 4. Initialize Database
```bash
# Initialize database tables
python init_db.py

# Or reset database if needed
python init_db.py reset
```

### 5. Run Application
```bash
# Start the FastAPI application
python app.py

# Or using uvicorn directly
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Application will be available at:
# - API: http://localhost:8000
# - Docs: http://localhost:8000/docs
# - ReDoc: http://localhost:8000/redoc
```

## API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These provide:
- Interactive API testing
- Request/response schemas
- Authentication testing
- Example requests and responses

## Usage Examples

### 1. Company Signup (First User)
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe",
    "company_name": "Acme Corporation",
    "company_email": "contact@acme.com",
    "country_code": "US",
    "company_phone": "+1-555-0123",
    "company_address": "123 Business St, New York, NY"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "securepassword123"
  }'
```

### 3. Create Employee (Admin)
```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "email": "employee@company.com",
    "password": "employee123",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "employee",
    "manager_id": "manager-uuid-here"
  }'
```

## FastAPI Advantages

### Performance
- **Async Support**: Native async/await support for high performance
- **Pydantic**: Fast data validation and serialization
- **ASGI**: Modern async server interface

### Developer Experience
- **Type Hints**: Full Python type hints support
- **Auto-completion**: IDE support with type checking
- **Interactive Docs**: Automatic API documentation
- **Request Validation**: Automatic request/response validation

### Modern Features
- **OpenAPI**: Built-in OpenAPI 3.0 schema generation
- **JSON Schema**: Automatic JSON schema generation
- **Security**: Built-in OAuth2, JWT, and API key support
- **WebSocket**: Native WebSocket support for real-time features

## Security Features

- **Password Hashing**: Uses bcrypt via passlib for secure password storage
- **JWT Tokens**: Stateless authentication with access and refresh tokens
- **Role-based Access**: Granular permissions based on user roles
- **Input Validation**: Comprehensive request validation using Pydantic
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection
- **CORS Support**: Configurable cross-origin resource sharing
- **HTTP Security Headers**: Built-in security middleware

## Database Relationships

```
Companies (1) ←→ (Many) Users
Users (1) ←→ (Many) Users (Manager-Employee relationship)
```

The system supports hierarchical user management where:
- Each company has multiple users
- Users can have manager-employee relationships
- Managers can have multiple subordinates
- Employees can have one manager

## Country-Currency Mapping

The system automatically sets company currency based on the selected country:
- US → USD, IN → INR, GB → GBP, DE/FR/IT/ES → EUR, etc.
- Supports 40+ countries with their respective currencies
- Defaults to USD for unmapped countries

## Development

### Running in Development
```bash
# With auto-reload
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Or using the app.py script
python app.py
```

### Database Migrations (Optional)
```bash
# Initialize Alembic (if needed)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

## Next Steps

1. **Expense Management**: Add expense tracking features
2. **Approval Workflows**: Implement expense approval processes
3. **Reporting**: Add expense reports and analytics
4. **File Uploads**: Support for receipt attachments
5. **Email Notifications**: Automated email alerts
6. **Audit Logs**: Track user actions and changes
7. **Real-time Updates**: WebSocket support for live notifications
8. **Mobile API**: Optimize for mobile applications
