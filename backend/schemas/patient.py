from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class PatientBase(BaseModel):
    full_name: str
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    insurance_id: Optional[int] = None
    blood_group: Optional[str] = None
    gender: Optional[str] = None
    last_visit: Optional[str] = None
    conditions: Optional[str] = None
    allergies: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class PatientCreate(PatientBase):
    email: EmailStr
    password: str

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    insurance_id: Optional[int] = None
    blood_group: Optional[str] = None
    gender: Optional[str] = None
    last_visit: Optional[str] = None
    conditions: Optional[str] = None
    allergies: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class PatientResponse(PatientBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
