from app.database import SessionLocal
from app.models import Appointment, Service
from datetime import datetime

db = SessionLocal()

completed_apps = db.query(Appointment).filter(Appointment.status == "completed").all()

print(f"Auditing {len(completed_apps)} completed appointments:")
print("-" * 50)

for app in completed_apps:
    service_sum = sum(s.price for s in app.services)
    print(f"ID: {app.id} | Date: {app.date} | Stored: ₹{app.total_amount} | Calculated: ₹{service_sum}")
    if app.total_amount != service_sum:
        print(f"  >>> DISCREPANCY FOUND! Updating stored amount...")
        app.total_amount = service_sum

db.commit()
print("-" * 50)
print("Audit and correction complete.")

# Check Revenue Today logic
today = datetime.now().date()
rev_today = sum(app.total_amount for app in completed_apps if app.date == today)
print(f"Calculated Revenue Today ({today}): ₹{rev_today}")

db.close()
