import sys
import os
sys.path.append(os.getcwd())
from app import models, database

db = database.SessionLocal()
users = db.query(models.User).all()

print("--- USER LIST ---")
for u in users:
    print(f"ID: {u.id} | Email: {u.email} | Role: {u.role} | Status: {u.status}")

# Force admin@example.com to be admin if it's not
admin = db.query(models.User).filter(models.User.email == 'admin@example.com').first()
if admin and admin.role.lower() != 'admin':
    print(f"Updating {admin.email} role from {admin.role} to admin")
    admin.role = 'admin'
    db.commit()
    print("Update successful")

db.close()
print("--- END ---")
