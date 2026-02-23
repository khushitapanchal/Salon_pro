from app.database import SessionLocal
from app.models import Appointment, Service, Customer
from datetime import datetime

db = SessionLocal()

# Get a customer and some services
customer = db.query(Customer).first()
services = db.query(Service).limit(2).all()

if customer and services:
    new_app = Appointment(
        customer_id=customer.id,
        date=datetime.now().date(),
        time=datetime.now().time(),
        status="pending",
        total_amount=0
    )
    new_app.services = services
    db.add(new_app)
    db.commit()
    print(f"Created test pending appointment ID: {new_app.id}")
    
    # Now run the verification logic
    print(f"Current total_amount: {new_app.total_amount}")
    expected_amount = sum(s.price for s in new_app.services)
    
    # Apply completion logic
    new_app.status = "completed"
    new_app.total_amount = sum(s.price for s in new_app.services)
    db.commit()
    
    print(f"Updated to completed. New total_amount: {new_app.total_amount}")
    
    from sqlalchemy import func
    total_rev = db.query(func.sum(Appointment.total_amount)).filter(Appointment.status == "completed").scalar()
    print(f"New Total Revenue: {total_rev}")
else:
    print("Could not find customer or services.")

db.close()
