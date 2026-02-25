import sys
import os
# Ensure the project root is in PYTHONPATH
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

from sqlalchemy.orm import Session
from app import models, database, authutils

def create_admin():
    db: Session = database.SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
        if not admin:
            admin = models.User(
                name="Admin",
                email="admin@example.com",
                phone="1234567890",
                password=authutils.get_password_hash("admin123"),
                role="admin",
                status="active",
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("Admin user created.")
        else:
            print("Admin user already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
