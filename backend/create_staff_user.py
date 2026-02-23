from app.database import SessionLocal
from app.models import User
from app.authutils import get_password_hash

db = SessionLocal()
email = "staff@example.com"
password = "staff123"

existing_user = db.query(User).filter(User.email == email).first()
if not existing_user:
    new_user = User(
        name="Staff Member",
        email=email,
        phone="+1234567890",
        password=get_password_hash(password),
        role="staff",
        status="active"
    )
    db.add(new_user)
    db.commit()
    print(f"Staff user created: {email} / {password}")
else:
    print("Staff user already exists.")
db.close()
