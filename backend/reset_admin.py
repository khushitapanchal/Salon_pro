import sys
import os
from sqlalchemy.orm import Session

# Add current directory to path so we can import 'app'
sys.path.append(os.getcwd())

from app import models, database, authutils

def reset_admin():
    db: Session = database.SessionLocal()
    try:
        # Define default admin
        email = "admin@example.com"
        password = "admin123"
        
        # Remove existing if any to ensure clean state
        admin = db.query(models.User).filter(models.User.email == email).first()
        if admin:
            db.delete(admin)
            db.commit()
            print(f"Removed existing user with email: {email}")
        
        # Create fresh admin with correct hashing
        hashed_password = authutils.get_password_hash(password)
        new_admin = models.User(
            name="System Admin",
            email=email,
            password=hashed_password,
            role="admin",
            status="active",
            phone="0000000000"
        )
        db.add(new_admin)
        db.commit()
        print(f"--- ADMIN CREATED ---")
        print(f"Email: {email}")
        print(f"Password: {password}")
        print(f"----------------------")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin()
