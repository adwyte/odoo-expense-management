#!/bin/bash

# Odoo Expense Management Setup Script (FastAPI)
# This script automates the setup process for the authentication system

set -e  # Exit on any error

echo "🚀 Setting up Odoo Expense Management Authentication System (FastAPI)"
echo "===================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

print_status "Python 3 is available"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed. Installing PostgreSQL..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
    print_status "PostgreSQL installed"
else
    print_status "PostgreSQL is available"
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
    print_status "Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
print_status "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
print_status "Dependencies installed"

# Setup environment file
if [ ! -f ".env" ]; then
    print_status "Creating environment configuration..."
    cp .env.example .env
    
    # Generate secure keys
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    
    # Update .env file with generated keys
    sed -i "s/your-secret-key-here/$SECRET_KEY/" .env
    
    print_status "Environment file created with secure keys"
    print_warning "Please update DATABASE_URL in .env file with your PostgreSQL credentials"
else
    print_status "Environment file already exists"
fi

# Database setup instructions
echo ""
echo "📋 Database Setup Instructions:"
echo "==============================="
echo "1. Start PostgreSQL service:"
echo "   sudo systemctl start postgresql"
echo ""
echo "2. Create database and user:"
echo "   sudo -u postgres psql"
echo "   CREATE DATABASE odoo_expense_db;"
echo "   CREATE USER odoo_user WITH PASSWORD 'your_secure_password';"
echo "   GRANT ALL PRIVILEGES ON DATABASE odoo_expense_db TO odoo_user;"
echo "   \\q"
echo ""
echo "3. Update DATABASE_URL in .env file:"
echo "   DATABASE_URL=postgresql://odoo_user:your_secure_password@localhost/odoo_expense_db"
echo ""
echo "4. Initialize database:"
echo "   source venv/bin/activate"
echo "   python init_db.py"
echo ""
echo "5. Start the application:"
echo "   python app.py"
echo ""

print_status "Setup completed! Follow the database setup instructions above."
print_status "The application will be available at:"
print_status "  - API: http://localhost:8000"
print_status "  - Interactive Docs: http://localhost:8000/docs"
print_status "  - ReDoc: http://localhost:8000/redoc"

echo ""
echo "📚 Quick Start:"
echo "==============="
echo "After database setup, you can test the signup endpoint:"
echo ""
echo "curl -X POST http://localhost:8000/api/auth/signup \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"email\": \"admin@company.com\","
echo "    \"password\": \"securepassword123\","
echo "    \"first_name\": \"Admin\","
echo "    \"last_name\": \"User\","
echo "    \"company_name\": \"Test Company\","
echo "    \"company_email\": \"contact@company.com\","
echo "    \"country_code\": \"US\""
echo "  }'"
echo ""
echo "📖 Documentation:"
echo "=================="
echo "Visit http://localhost:8000/docs for interactive API documentation"
echo "For more information, see README.md"