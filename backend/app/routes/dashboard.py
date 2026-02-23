from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from .. import models, database
from .auth import get_current_user
from typing import Dict, List

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_summary(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not enough permissions")
    total_customers = db.query(models.Customer).count()
    total_appointments = db.query(models.Appointment).filter(models.Appointment.status == "pending").count()
    
    # Revenue today
    today = datetime.now().date()
    revenue_today = db.query(func.sum(models.Appointment.total_amount)).filter(
        models.Appointment.date == today,
        models.Appointment.status == "completed"
    ).scalar() or 0
    
    # Total revenue (all completed appointments)
    total_revenue = db.query(func.sum(models.Appointment.total_amount)).filter(
        models.Appointment.status == "completed"
    ).scalar() or 0
    
    # Popular services (top 5)
    popular_services = db.query(
        models.Service.name,
        func.count(models.appointment_services.c.service_id).label("count")
    ).join(models.appointment_services).group_by(models.Service.id).order_by(func.count(models.appointment_services.c.service_id).desc()).limit(5).all()
    
    return {
        "total_customers": total_customers,
        "total_appointments": total_appointments,
        "revenue_today": revenue_today,
        "total_revenue": total_revenue,
        "popular_services": [{"name": s.name, "count": s.count} for s in popular_services]
    }

@router.get("/revenue")
def get_revenue_report(period: str = "monthly", db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not enough permissions")
    # Simple revenue by date
    if period == "monthly":
        days = 30
    else:
        days = 7
        
    start_date = datetime.now().date() - timedelta(days=days)
    
    revenue_data = db.query(
        models.Appointment.date,
        func.sum(models.Appointment.total_amount).label("revenue")
    ).filter(
        models.Appointment.date >= start_date,
        models.Appointment.status == "completed"
    ).group_by(models.Appointment.date).order_by(models.Appointment.date).all()
    
    return [{"date": str(r.date), "revenue": r.revenue} for r in revenue_data]

@router.get("/reports")
def get_detailed_reports(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not enough permissions")
    # 1. Daily Revenue (Last 30 Days)
    thirty_days_ago = datetime.now().date() - timedelta(days=30)
    daily_revenue = db.query(
        models.Appointment.date,
        func.sum(models.Appointment.total_amount).label("revenue")
    ).filter(
        models.Appointment.status == "completed",
        models.Appointment.date >= thirty_days_ago
    ).group_by(models.Appointment.date).order_by(models.Appointment.date).all()

    # 2. Monthly Revenue (PostgreSQL compatible)
    monthly_revenue = db.query(
        func.to_char(models.Appointment.date, "YYYY-MM").label("month"),
        func.sum(models.Appointment.total_amount).label("revenue")
    ).filter(
        models.Appointment.status == "completed"
    ).group_by(func.to_char(models.Appointment.date, "YYYY-MM")).order_by("month").all()

    # 3. Most Popular Services
    popular_services = db.query(
        models.Service.name,
        models.Service.category,
        func.count(models.appointment_services.c.service_id).label("total_bookings"),
        func.sum(models.Service.price).label("total_revenue")
    ).join(models.appointment_services).group_by(models.Service.id).order_by(func.count(models.appointment_services.c.service_id).desc()).all()

    # 4. Frequent Customers
    frequent_customers = db.query(
        models.Customer.name,
        models.Customer.phone,
        func.count(models.Appointment.id).label("visit_count"),
        func.sum(models.Appointment.total_amount).label("total_spent")
    ).join(models.Appointment).filter(
        models.Appointment.status == "completed"
    ).group_by(models.Customer.id).order_by(func.count(models.Appointment.id).desc()).limit(10).all()

    return {
        "daily_revenue": [{"date": str(r.date), "revenue": r.revenue} for r in daily_revenue],
        "monthly_revenue": [{"month": r.month, "revenue": r.revenue} for r in monthly_revenue],
        "popular_services": [{"name": r.name, "category": r.category, "bookings": r.total_bookings, "revenue": r.total_revenue} for r in popular_services],
        "frequent_customers": [{"name": r.name, "phone": r.phone, "visits": r.visit_count, "spent": r.total_spent} for r in frequent_customers]
    }
