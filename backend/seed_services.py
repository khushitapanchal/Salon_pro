from app.database import SessionLocal
from app.models import Service

db = SessionLocal()
if not db.query(Service).all():
    services = [
        {"name": "Mens Haircut", "category": "Haircut", "price": 25, "duration": 30},
        {"name": "Womens Haircut", "category": "Haircut", "price": 45, "duration": 60},
        {"name": "Hair Coloring", "category": "Coloring", "price": 80, "duration": 120},
        {"name": "Manicure", "category": "Nails", "price": 20, "duration": 30},
        {"name": "Pedicure", "category": "Nails", "price": 30, "duration": 45},
    ]
    for s_data in services:
        db.add(Service(**s_data))
    db.commit()
    print("Default services seeded.")
else:
    print("Services already exist.")
db.close()
