from app.database import SessionLocal
from app.models import User
from app.authutils import get_password_hash

db = SessionLocal()
email = "manager@example.com"
password = "manager123"

existing_user = db.query(User).filter(User.email == email).first()
if not existing_user:
    new_user = User(
        name="Manager",
        email=email,
        password=get_password_hash(password),
        role="admin"
    )
    db.add(new_user)
    db.commit()
    print("User created successfully.")
else:
    print("User already exists.")
db.close()
