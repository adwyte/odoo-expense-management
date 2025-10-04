#!/usr/bin/env python3
"""
Main entry point for the Odoo Expense Management FastAPI application.
"""
import uvicorn
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from src.backend.app.utils.app import create_app

# Create the FastAPI app instance
app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",  # Refers to the app variable in this main.py file
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )