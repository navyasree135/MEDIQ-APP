from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DoctorResponse(BaseModel):
    id: int
    full_name: str
    specialty: str
    location: Optional[str]
    clinic_address: Optional[str] = None
    clinic_lat: Optional[float] = None
    clinic_lng: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    specialty: Optional[str] = None
    location: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_lat: Optional[float] = None
    clinic_lng: Optional[float] = None
