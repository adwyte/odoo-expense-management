import uvicorn
from app import create_app

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