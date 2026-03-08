from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db: Session = SessionLocal()

hashed_password = pwd_context.hash("123456")

user = User(
    email="admin@gmail.com",
    password=hashed_password
)

db.add(user)
db.commit()
db.refresh(user)

print("User created!")