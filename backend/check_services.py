from app.database import SessionLocal
from app.models import Service

db = SessionLocal()
services = db.query(Service).all()
if not services:
    print("No services found in database.")
else:
    for s in services:
        print(f"ID: {s.id}, Name: {s.name}, Price: {s.price}")
db.close()
