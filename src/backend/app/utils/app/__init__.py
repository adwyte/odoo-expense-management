from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.backend.app.api.routers.auth import router as auth_router
from src.backend.app.api.routers.users import router as users_router
from src.backend.app.api.routers.companies import router as companies_router

def create_app():
    app = FastAPI(
        title="Odoo Expense Management API",
        description="Authentication & User Management System",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, specify allowed origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(users_router, prefix="/api/users", tags=["User Management"])
    app.include_router(companies_router, prefix="/api/companies", tags=["Company"])
    
    @app.get("/")
    def root():
        return {
            "message": "Odoo Expense Management API",
            "version": "1.0.0",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    
    @app.get("/health")
    def health_check():
        return {"status": "healthy"}
    
    return app