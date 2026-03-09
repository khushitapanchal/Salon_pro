import os
import sys
from sqlalchemy.orm import Session
from datetime import date, time

# Add current directory to path so we can import 'app'
sys.path.append(os.getcwd())

from app import models, database

def check_appointments():
    db: Session = database.SessionLocal()
    try:
        appointments = db.query(models.Appointment).all()
        print(f"Total appointments: {len(appointments)}")
        for app in appointments:
            print(f"ID: {app.id}, Customer ID: {app.customer_id}, Date: {app.date} (type: {type(app.date)}), Time: {app.time} (type: {type(app.time)})")
            # Also check services
            print(f"  Services: {[s.name for s in app.services]}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_appointments()
