# Quick Database Setup for Team Members

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
source venv/bin/activate  # Windows: venv\Scripts\activate

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
