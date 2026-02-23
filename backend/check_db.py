from app.database import SessionLocal
from app.models import Appointment
from datetime import datetime

db = SessionLocal()
today = datetime.now().date()
apps = db.query(Appointment).all()

with open("db_audit.txt", "w") as f:
    f.write(f"Current Date: {today}\n")
    f.write("-" * 50 + "\n")
    for a in apps:
        f.write(f"ID: {a.id} | Date: {a.date} | Status: {a.status} | Amount: {a.total_amount} | Is Today: {a.date == today}\n")

db.close()
