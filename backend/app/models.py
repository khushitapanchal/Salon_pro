from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Time, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# Many-to-many relationship for Appointment and Service
appointment_services = Table(
    "appointment_services",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("appointment_id", Integer, ForeignKey("appointments.id")),
    Column("service_id", Integer, ForeignKey("services.id")),
)

# Many-to-many relationship for Staff and Service
staff_services = Table(
    "staff_services",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("service_id", Integer, ForeignKey("services.id")),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20), nullable=True)
    password = Column(String(255))
    role = Column(String(50)) # Admin, Staff
    status = Column(String(50), default="active") # active, inactive

    services = relationship("Service", secondary=staff_services)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    phone = Column(String(20))
    email = Column(String(100), unique=True, index=True)
    dob = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    appointments = relationship("Appointment", back_populates="customer")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    category = Column(String(50))
    price = Column(Float)
    duration = Column(Integer) # in minutes

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    date = Column(Date)
    time = Column(Time)
    status = Column(String(50)) # pending, completed, cancelled
    payment_status = Column(String(50), default="unpaid") # unpaid, paid
    total_amount = Column(Float)

    customer = relationship("Customer", back_populates="appointments")
    staff = relationship("User")
    services = relationship("Service", secondary=appointment_services)
