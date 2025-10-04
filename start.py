#!/usr/bin/env python3
"""
Main startup script for Odoo Expense Management
This script allows you to start the backend from the project root
"""
import sys
import subprocess
from pathlib import Path

def start_backend():
    """Start the FastAPI backend server"""
    backend_dir = Path(__file__).parent / "src" / "backend"
    
    print("🚀 Starting Odoo Expense Management Backend...")
    print(f"📁 Backend directory: {backend_dir}")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📖 API docs will be available at: http://localhost:8000/docs")
    print("-" * 60)
    
    try:
        # Change to backend directory and run main.py
        result = subprocess.run([
            sys.executable, "main.py"
        ], cwd=backend_dir)
        
        return result.returncode == 0
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        return True
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False

def setup_database():
    """Set up the database"""
    backend_dir = Path(__file__).parent / "src" / "backend"
    
    print("🗄️  Setting up database...")
    
    try:
        result = subprocess.run([
            sys.executable, "scripts/migrate_db.py", "setup"
        ], cwd=backend_dir)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False

def main():
    """Main function"""
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "start":
            start_backend()
        elif command == "setup-db":
            setup_database()
        elif command == "help":
            print("🔧 Odoo Expense Management - Startup Script")
            print("=" * 50)
            print("Available commands:")
            print("  start     - Start the FastAPI backend server")
            print("  setup-db  - Set up the database tables")
            print("  help      - Show this help message")
            print()
            print("Quick start:")
            print("  python start.py setup-db  # Set up database")
            print("  python start.py start     # Start server")
        else:
            print(f"Unknown command: {command}")
            print("Use 'python start.py help' for available commands")
    else:
        # Default: start the backend
        start_backend()

if __name__ == '__main__':
    main()