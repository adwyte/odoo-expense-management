#!/usr/bin/env python3
"""
Main entry point for the Odoo Expense Management FastAPI application.
"""
import uvicorn
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