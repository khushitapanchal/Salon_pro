from app.database import SessionLocal
from app.models import Appointment, Customer

db = SessionLocal()
first_cust = db.query(Customer).first()

if first_cust:
    orphans = db.query(Appointment).filter(Appointment.customer_id == None).all()
    print(f"Found {len(orphans)} appointments with missing customer ID.")
    for o in orphans:
        o.customer_id = first_cust.id
        print(f"Linked appointment {o.id} to customer {first_cust.name} (ID: {first_cust.id})")
    db.commit()
    print("Database cleanup complete.")
else:
    print("No customers found in database to link appointments to.")

db.close()
