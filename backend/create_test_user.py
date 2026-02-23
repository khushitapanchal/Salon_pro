from app.database import SessionLocal
from app.models import User
from app.authutils import get_password_hash

db = SessionLocal()
if not db.query(User).filter(User.email == "admin@example.com").first():
    admin = User(
        name="Admin",
        email="admin@example.com",
        password=get_password_hash("admin123"),
        role="admin"
    )
    db.add(admin)
    db.commit()
    print("Test user created: admin@example.com / admin123")
else:
    print("Test user already exists.")
db.close()
