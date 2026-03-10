from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import auth, appointments, customers, dashboard, services, users, create_admin
from . import models
from .database import engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Salon Customer Management API",
    version="1.0.0"
)

# Allowed frontend domains
origins = [
    "http://localhost:3000",
    "https://salon-pro-lilac.vercel.app",
    "https://salon-annexcpmn-khushitapanchals-projects.vercel.app"
]

# Enable CORS (important for Vercel frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(create_admin.router)

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"]
)

app.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)

app.include_router(
    customers.router,
    prefix="/customers",
    tags=["Customers"]
)

app.include_router(
    services.router,
    prefix="/services",
    tags=["Services"]
)

app.include_router(
    appointments.router,
    prefix="/appointments",
    tags=["Appointments"]
)

app.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Salon API is running"
    }