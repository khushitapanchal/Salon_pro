from fastapi import FastAPI
from .routes import auth, customers, services, appointments, dashboard, users
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Salon Customer Management System API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)