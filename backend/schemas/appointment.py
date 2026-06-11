from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from backend.models.appointment import AppointmentStatus


class AppointmentRequest(BaseModel):
    patient_id: int
    doctor_id: int
    scheduled_at: datetime
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    scheduled_at: datetime
    status: AppointmentStatus
    notes: Optional[str]
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    location: Optional[str] = None
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None

    class Config:
        from_attributes = True
