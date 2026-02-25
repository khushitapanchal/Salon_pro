from fastapi import FastAPI
from .routes import auth, customers, services, appointments, dashboard, users
from .database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
import os

# Create tables (for development only)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Salon Customer Management System API")

# Get frontend URL from environment variable
FRONTEND_URL = os.getenv("FRONTEND_URL")

# Allowed origins list
origins = [
    "http://localhost:3000",   # local development
    "http://127.0.0.1:3000",
]

# Add production frontend only if it exists
if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(services.router)
app.include_router(appointments.router)
app.include_router(dashboard.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "Welcome to SCMS API"}