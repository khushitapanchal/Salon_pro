from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, appointments, customers, dashboard, services, users
from app import models
from app.database import engine

# Create the database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Salon Customer Management API")


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all the API routes
app.include_router(auth.router)
app.include_router(appointments.router)
app.include_router(customers.router)
app.include_router(dashboard.router)
app.include_router(services.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"status": "online", "message": "Salon API is running"}
