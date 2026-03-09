from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.authutils import get_password_hash

router = APIRouter()

@router.post("/create-admin")
def create_admin(db: Session = Depends(get_db)):
    user = User(
        name="System Admin",
        email="admin@example.com",
        password=get_password_hash("admin123"),
        role="admin"
    )
    db.add(user)
    db.commit()
    return {"message": "Admin created"}