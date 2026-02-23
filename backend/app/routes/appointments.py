from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from .. import models, schemas, database
from .auth import get_current_user

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("/", response_model=schemas.AppointmentResponse)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    # Verify customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == appointment.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Verify services exist and calculate total amount if not provided
    services = db.query(models.Service).filter(models.Service.id.in_(appointment.service_ids)).all()
    if len(services) != len(appointment.service_ids):
        raise HTTPException(status_code=400, detail="One or more services not found")
    
    db_appointment = models.Appointment(
        customer_id=appointment.customer_id,
        staff_id=appointment.staff_id,
        date=appointment.date,
        time=appointment.time,
        status=appointment.status,
        payment_status=appointment.payment_status,
        total_amount=sum(s.price for s in services) if appointment.total_amount == 0 else appointment.total_amount
    )
    db_appointment.services = services
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.get("/", response_model=List[schemas.AppointmentResponse])
def get_appointments(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Appointment).all()

@router.get("/{appointment_id}", response_model=schemas.AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.put("/{appointment_id}/status")
def update_appointment_status(appointment_id: int, status: str, payment_status: Optional[str] = None, date: Optional[date] = None, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db_appointment.status = status
    if payment_status:
        db_appointment.payment_status = payment_status
    if date:
        db_appointment.date = date
    
    # If completed, ensure total_amount is calculated and mark as paid if not already
    if status == "completed":
        db_appointment.total_amount = sum(s.price for s in db_appointment.services)
        if not payment_status:
            db_appointment.payment_status = "paid"
        
    db.commit()
    return {"message": "Appointment status updated"}

@router.put("/{appointment_id}", response_model=schemas.AppointmentResponse)
def update_appointment(appointment_id: int, appointment: schemas.AppointmentCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Verify customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == appointment.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Verify services exist and calculate total amount if not provided
    services = db.query(models.Service).filter(models.Service.id.in_(appointment.service_ids)).all()
    if len(services) != len(appointment.service_ids):
        raise HTTPException(status_code=400, detail="One or more services not found")
    
    db_appointment.customer_id = appointment.customer_id
    db_appointment.staff_id = appointment.staff_id
    db_appointment.date = appointment.date
    db_appointment.time = appointment.time
    db_appointment.status = appointment.status
    db_appointment.payment_status = appointment.payment_status
    db_appointment.total_amount = sum(s.price for s in services) if appointment.total_amount == 0 else appointment.total_amount
    db_appointment.services = services
    
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}
