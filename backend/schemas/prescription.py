from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PrescriptionBase(BaseModel):
    doctor_name: str
    specialty: str
    hospital: str
    date: str
    image_url: Optional[str] = None
    medicines_json: str


class PrescriptionCreate(PrescriptionBase):
    pass


class PrescriptionResponse(PrescriptionBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        from_attributes = True
