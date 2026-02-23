from app.database import SessionLocal
from app.models import Service

db = SessionLocal()

new_services = [
    {"name": "Eyebrow Threading", "category": "Threading", "price": 100, "duration": 15},
    {"name": "Upper Lip Threading", "category": "Threading", "price": 50, "duration": 10},
    {"name": "Full Legs Waxing", "category": "Waxing", "price": 500, "duration": 45},
    {"name": "Underarms Waxing", "category": "Waxing", "price": 150, "duration": 15},
    {"name": "Bridal Makeup", "category": "Makeup", "price": 5000, "duration": 120},
    {"name": "Party Makeup", "category": "Makeup", "price": 1500, "duration": 60},
    {"name": "Basic Facial", "category": "Skincare", "price": 800, "duration": 45},
    {"name": "Gold Facial", "category": "Skincare", "price": 1500, "duration": 60},
]

for s_data in new_services:
    # Check if service already exists to avoid duplicates if run multiple times
    exists = db.query(Service).filter(Service.name == s_data["name"]).first()
    if not exists:
        db.add(Service(**s_data))
        print(f"Added service: {s_data['name']}")
    else:
        print(f"Service already exists: {s_data['name']}")

db.commit()
db.close()
print("New services addition complete.")
