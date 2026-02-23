from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .auth import get_current_user

router = APIRouter(prefix="/customers", tags=["customers"])

@router.post("/", response_model=schemas.CustomerResponse)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    data = customer.dict()
    # Convert empty strings to None for optional fields
    if data.get("email") == "": data["email"] = None
    if data.get("dob") == "": data["dob"] = None
    if data.get("notes") == "": data["notes"] = None
    
    db_customer = models.Customer(**data)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/", response_model=List[schemas.CustomerResponse])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    customers = db.query(models.Customer).offset(skip).limit(limit).all()
    return customers

@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer(customer_id: int, customer_update: schemas.CustomerCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in customer_update.dict().items():
        setattr(db_customer, key, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}

@router.get("/{customer_id}/profile")
def get_customer_profile(customer_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get all appointments for this customer
    appointments = db.query(models.Appointment).filter(
        models.Appointment.customer_id == customer_id
    ).order_by(models.Appointment.date.desc()).all()
    
    # Calculate stats
    completed_apps = [a for a in appointments if a.status == "completed"]
    total_visits = len(completed_apps)
    total_spent = sum(a.total_amount for a in completed_apps)
    last_visit = completed_apps[0].date if completed_apps else None
    
    return {
        "customer": customer,
        "stats": {
            "total_visits": total_visits,
            "total_spent": total_spent,
            "last_visit": last_visit
        },
        "history": [{
            "id": a.id,
            "date": a.date,
            "time": a.time,
            "status": a.status,
            "payment_status": a.payment_status,
            "total_amount": a.total_amount,
            "services": [s.name for s in a.services],
            "staff_name": a.staff.name if a.staff else "Not Assigned"
        } for a in appointments]
    }
