from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, time, datetime

# ---------------- USER SCHEMAS ---------------- #

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    status: str = "active"


class UserCreate(UserBase):
    password: str
    service_ids: Optional[List[int]] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None
    service_ids: Optional[List[int]] = None


# ---------------- SERVICE SCHEMAS ---------------- #

class ServiceBase(BaseModel):
    name: str
    category: str
    price: float
    duration: int


class ServiceCreate(ServiceBase):
    pass


class ServiceResponse(ServiceBase):
    id: int

    class Config:
        from_attributes = True


# ---------------- USER RESPONSE ---------------- #

class UserResponse(UserBase):
    id: int
    services: Optional[List[ServiceResponse]] = None

    class Config:
        from_attributes = True


# ---------------- CUSTOMER SCHEMAS ---------------- #

class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    dob: Optional[date] = None
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------- APPOINTMENT SCHEMAS ---------------- #

class AppointmentBase(BaseModel):
    customer_id: Optional[int] = None
    staff_id: Optional[int] = None
    date: date
    time: time
    status: str
    payment_status: str = "unpaid"
    total_amount: float


class AppointmentCreate(AppointmentBase):
    service_ids: List[int]


class AppointmentResponse(AppointmentBase):
    id: int
    services: List[ServiceResponse]
    staff: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# ---------------- TOKEN SCHEMAS ---------------- #

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None